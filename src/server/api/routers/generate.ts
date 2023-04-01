import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const generateRouter = createTRPCRouter({
	single: protectedProcedure
		.input(
			z.object({
				prompt: z.string(),
			}),
		)
		.mutation(async ({ ctx: _, input }) => {
			return input;
		}),
});
