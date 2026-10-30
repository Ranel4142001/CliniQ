// Vercel serverless entry point: one Node.js function serves every /api/* route.
import { getRequestListener } from "@hono/node-server";
import { createApplication } from "@backend/bootstrap/application.factory";

export default getRequestListener(createApplication().fetch);
