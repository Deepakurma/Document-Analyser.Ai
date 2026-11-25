import { initTRPC } from "@trpc/server";

const t = initTRPC.create({
  errorFormatter({ shape }) {
    if (shape.data.code === "INTERNAL_SERVER_ERROR") {
      return {
        ...shape,
        message: "Something went wrong!",
      };
    }
  },
});

export const createTrpcRouter = t.router;
export const publicProcedure = t.procedure;
