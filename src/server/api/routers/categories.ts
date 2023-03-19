import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const categoriesRouter = createTRPCRouter({
	getAll: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.category.findMany();
	}),
	create: protectedProcedure
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
