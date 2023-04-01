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
			include: {
				account: {
					select: {
						email: true,
					},
				},
			},
		});
	}),
	list: protectedProcedure.query(async ({ ctx }) => {
		return (await ctx.prisma.organization.findMany()).map((org) => ({
			id: org.id,
			name: org.name,
		}));
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
	change: protectedProcedure
		.input(
			z.object({
				organizationId: z.string().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const account = await ctx.prisma.account.findFirstOrThrow({
				where: { userId: ctx.user.id },
			});
			if (!!account.organizationId !== !input.organizationId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You are already a member of an organization",
				});
			}
			await ctx.prisma.account.update({
				data: { organizationId: input.organizationId },
				where: { id: account.id },
			});
		}),
	addMember: protectedProcedure
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const account = await ctx.prisma.account.findFirstOrThrow({
				where: { userId: ctx.user.id },
			});
			const organizationId = account.organizationId;
			if (!organizationId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You are not a member of an organization",
				});
			}
			const invited = await ctx.prisma.account.findFirst({
				where: { email: input.email },
			});
			if (!invited) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "User not found",
				});
			}
			if (invited.organizationId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "User is already a member of an organization",
				});
			}
			await ctx.prisma.account.update({
				data: {
					organizationId,
				},
				where: { id: invited.id },
			});
			return true;
		}),
});
