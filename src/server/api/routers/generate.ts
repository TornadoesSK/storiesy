import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type textPrompt } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type OpenAIApi } from "openai";
import { type paths } from "../../../utils/customModelApiSchema";
import { Fetcher } from "openapi-typescript-fetch";
import { env } from "../../../env/server.mjs";

const fetcher = Fetcher.for<paths>();
fetcher.configure({
	baseUrl: env.CUSTOM_IMAGE_MODEL_API_URL,
});

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
				model: z.enum(["dalle", "stablediffusion"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const chatOutput = await promptChat(ctx.openai, input.prompt);

			async function saveToDb(
				extraProps: Partial<Omit<textPrompt, "input" | "output" | "systemPrompt">>,
			) {
				await ctx.prisma.textPrompt.create({
					data: {
						input: input.prompt,
						output: chatOutput,
						systemPrompt: basePrompt,
						...extraProps,
					},
				});
			}

			const processedChatOutput = parseChatOutput(chatOutput);
			if (!processedChatOutput.success) {
				await saveToDb({ error: processedChatOutput.error });
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: processedChatOutput.error });
			}

			console.log("Prompting Dall-E for images");
			const promises = processedChatOutput.data.scenes.map(async (scene) => {
				return {
					...scene,
					imageSrc: await (input.model === "dalle"
						? promptImageDalle(ctx.openai, scene.imagePrompt)
						: promptImageStableDiffusion(scene.imagePrompt)),
				};
			});

			const result = await Promise.all(promises);
			await saveToDb({ imageUrls: JSON.stringify(result.map((scene) => scene.imageSrc)) });

			return { scenes: result };
		}),
});

async function promptChat(openai: OpenAIApi, prompt: string) {
	console.log("Prompting ChatGPT for dialogue and image prompts...");
	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content: basePrompt,
			},
			{ role: "user", content: prompt },
		],
	});

	return completion.data.choices[0]?.message?.content ?? "ERROR";
}

type ImagePromptOutput =
	| {
			type: "url";
			url?: string;
	  }
	| {
			type: "base64";
			data?: string;
	  };

async function promptImageDalle(openai: OpenAIApi, prompt: string): Promise<ImagePromptOutput> {
	return {
		type: "url",
		url: (
			await openai.createImage({
				prompt: prompt,
				n: 1,
				size: "1024x1024",
				response_format: "url",
			})
		).data.data[0]?.url,
	};
}

async function promptImageStableDiffusion(prompt: string): Promise<ImagePromptOutput> {
	const fetch = fetcher.path("/sdapi/v1/txt2img").method("post").create();
	const result = await fetch({ prompt });
	return { type: "base64", data: result.data.images?.[0] };
}

function parseChatOutput(output: string) {
	let parsedJson;
	try {
		parsedJson = JSON.parse(output);
	} catch (e) {
		return {
			success: false as const,
			error: `Badly formatted JSON ${e instanceof Error ? e.message : "weird error"}`,
		};
	}

	const parseResult = textOutputSchema.safeParse(parsedJson);
	if (!parseResult.success) {
		return { success: false as const, error: JSON.stringify(parseResult.error.issues) };
	}

	return { success: true as const, data: parseResult.data };
}
