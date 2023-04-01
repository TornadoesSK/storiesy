import { createTRPCRouter } from "./trpc";
import { expensesRouter } from "./routers/expenses";
import { categoriesRouter } from "./routers/categories";
import { generateRouter } from "./routers/generate";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
	expenses: expensesRouter,
	categories: categoriesRouter,
	generate: generateRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
