import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const categoriesRouter = createTRPCRouter({
	getAll: publicProcedure.query(({ ctx }) => {
		return ctx.prisma.category.findMany();
	}),
	create: publicProcedure
		.input(
			z.object({
				name: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.category.create({
				data: { ...input },
			});
		}),
});
