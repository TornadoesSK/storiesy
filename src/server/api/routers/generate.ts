import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const basePrompt =
	'Your task is to create stories based on the user prompt. The story will be in a comics format - it will have an image and some dialogue. You need to imagine 3 scenes from this comic. Create a prompt for the image generation AI Dall-E, be as detailed and consistent as possible, especially with the character descriptions. The image prompt must be extra long and verbose. You need to the scene in great detail, each character in it and what they are doing. At the start of each scene, you need to repeat each character description that is in that scene, because Dall-E doesn\'t know anything that happened in previous scenes. You also need to output the name of the character speaking and what they say. Provide all of this in JSON - the schema is `{ "scenes": [{ "imagePrompt": "string", "speechBubble": { "characterName": "string", "text": "string" } }] }`. Do not output anything apart from the JSON.';

export const generateRouter = createTRPCRouter({
	single: protectedProcedure
		.input(
			z.object({
				prompt: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
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
			const output = completion.data.choices[0]?.message?.content ?? "ERROR";
			await ctx.prisma.textPrompt.create({ data: { input: input.prompt, output } });
			return output;
		}),
});
