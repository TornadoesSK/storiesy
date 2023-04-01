import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type textPrompt } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const basePrompt =
	'Your task is to create stories based on the user prompt. The story will be in a comics format - it will have an image and some dialogue. You need to imagine 3 scenes from this comic. Create a prompt for the image generation AI Dall-E, be as detailed and consistent as possible, especially with the character descriptions. The image prompt must be extra long and verbose. You need to the scene in great detail, each character in it and what they are doing. At the start of each scene, you need to repeat each character description that is in that scene, because Dall-E doesn\'t know anything that happened in previous scenes. You also need to output the name of the character speaking and what they say. Provide all of this in JSON - the schema is `{ "scenes": [{ "imagePrompt": "string", "speechBubble": { "characterName": "string", "text": "string" } }] }`. If you need to use quotes, use apostrophes instead to not break the JSON. Do not output anything apart from the JSON';

const textOutputSchema = z.object({
	scenes: z.array(
		z.object({
			imagePrompt: z.string(),
			speechBubble: z
				.object({
					characterName: z.string().nullish(),
					text: z.string(),
				})
				.optional(),
		}),
	),
});

export const generateRouter = createTRPCRouter({
	single: protectedProcedure
		.input(
			z.object({
				prompt: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log("Prompting ChatGPT for dialogue and image prompts...");
			const completion = await ctx.openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content: basePrompt,
					},
					{ role: "user", content: input.prompt },
				],
			});
			const textOutput = completion.data.choices[0]?.message?.content ?? "ERROR";
			async function saveToDb(
				extraProps: Partial<Omit<textPrompt, "input" | "output" | "systemPrompt">>,
			) {
				await ctx.prisma.textPrompt.create({
					data: {
						input: input.prompt,
						output: textOutput,
						systemPrompt: basePrompt,
						...extraProps,
					},
				});
			}

			let parsedJson;
			try {
				parsedJson = JSON.parse(textOutput);
			} catch (e) {
				await saveToDb({
					error: `Badly formatted JSON ${e instanceof Error ? e.message : "weird error"}`,
				});
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Invalid output from AI: Badly formatted JSON",
				});
			}

			const parseResult = textOutputSchema.safeParse(parsedJson);
			if (!parseResult.success) {
				await saveToDb({ error: JSON.stringify(parseResult.error.issues) });
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid output from AI" });
			}

			console.log("Prompting Dall-E for images");
			const promises = parseResult.data.scenes.map(async (scene) => {
				return {
					...scene,
					imageSrc: (
						await ctx.openai.createImage({
							prompt: scene.imagePrompt,
							n: 1,
							size: "1024x1024",
							response_format: "url",
						})
					).data.data[0]?.url,
				};
			});

			const result = await Promise.all(promises);
			await saveToDb({ imageUrls: JSON.stringify(result.map((scene) => scene.imageSrc)) });

			return { scenes: result };
		}),
});
