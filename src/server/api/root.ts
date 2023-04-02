import { createTRPCRouter } from "./trpc";
import { generateRouter } from "./routers/generate";
import { organizationRouter } from "./routers/organization";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
	generate: generateRouter,
	organization: organizationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
