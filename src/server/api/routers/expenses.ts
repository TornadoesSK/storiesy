import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const expensesRouter = createTRPCRouter({
	getAll: publicProcedure.query(({ ctx }) => {
		return ctx.prisma.expense.findMany();
	}),
	create: publicProcedure
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
});
