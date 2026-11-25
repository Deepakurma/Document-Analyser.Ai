import {
  createTRPCClient,
  httpLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/client";
import type { AppRouter } from "@/backend/routers";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",

      true: httpSubscriptionLink({
        url: "http://localhost:8000/backend",
        eventSourceOptions: {
          withCredentials: true,
        },
      }),

      false: httpLink({
        url: "http://localhost:8000/backend",
        fetch: (input, init) =>
          fetch(input, { ...init, credentials: "include" }),
      }),
    }),
  ],
});
