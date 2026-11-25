import fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "../routers";
import { fileRoute } from "../routers/file";

export const server = fastify({ logger: true });

const port = 8000;

server.register(fileRoute);

server.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
});

server.register(fastifyTRPCPlugin, {
  prefix: "/backend",
  trpcOptions: {
    router: appRouter,
    createContext: () => ({}),
  },
});

server.listen({ port: port }, () => {
  console.log(`Server listening on ${port}`);
});
