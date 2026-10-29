import { serve } from "@hono/node-server";
import { createApplication } from "@backend/bootstrap/application.factory";
import { getEnv } from "@backend/shared/infrastructure/config/env";
import { prisma } from "@backend/shared/infrastructure/persistence/prisma";

const { HOST, PORT } = getEnv();
const server = serve({ fetch: createApplication().fetch, hostname: HOST, port: PORT }, (info) => {
  console.log(`CliniQ API listening on http://${info.address}:${info.port}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
