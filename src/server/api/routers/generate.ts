import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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
				messages: [{ role: "user", content: input.prompt }],
			});
			return completion.data.choices[0]?.message?.content ?? "BAD";
		}),
});
