import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const organizationRouter = createTRPCRouter({
	get: protectedProcedure.query(async ({ ctx }) => {
		const account = await ctx.prisma.account.findFirstOrThrow({
			where: { userId: ctx.user.id },
		});
		if (!account.organizationId) {
			return null;
		}
		return ctx.prisma.organization.findUniqueOrThrow({
			where: { id: account.organizationId },
		});
	}),
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				color: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const account = await ctx.prisma.account.findFirstOrThrow({
				where: { userId: ctx.user.id },
			});
			if (account.organizationId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You are already a member of an organization",
				});
			}
			await ctx.prisma.organization.create({
				data: { ...input, account: { connect: { id: account.id } } },
			});
		}),
});
