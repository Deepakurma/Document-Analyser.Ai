import { createTrpcRouter } from "../server/trpc";
import { aiRouter } from "./ai";

export const appRouter = createTrpcRouter({
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
