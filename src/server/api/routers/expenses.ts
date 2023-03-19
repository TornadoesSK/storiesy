import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const expensesRouter = createTRPCRouter({
	getAll: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.expense.findMany();
	}),
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				amount: z.number(),
				categoryId: z.string(),
				note: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let wallet = await ctx.prisma.wallet.findFirst();
			if (wallet === null) {
				wallet = await ctx.prisma.wallet.create({ data: { name: "Test" } });
			}
			return await ctx.prisma.expense.create({
				data: { ...input, walletId: wallet.id },
			});
		}),
	delete: protectedProcedure
		.input(z.string()) // id
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.expense.delete({ where: { id: input } });
		}),
});
