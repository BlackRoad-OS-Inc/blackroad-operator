import fastify from "fastify";
import sensible from "@fastify/sensible";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import pino from "pino";
import { apiPlugin } from "./api.js";
import { wsPlugin } from "./ws.js";
import { loadConfig } from "./config.js";

async function bootstrap() {
  const config = loadConfig();
  const app = fastify({
    logger: pino({ level: process.env.LOG_LEVEL ?? "info" })
  });

  await app.register(sensible);
  await app.register(helmet, { global: true });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(wsPlugin);
  await app.register(apiPlugin, { prefix: "/api" });

  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    app.log.info({ port: config.PORT }, "Origin gateway ready");
  } catch (error) {
    app.log.error(error, "Failed to start Origin gateway");
    process.exit(1);
  }
}

void bootstrap();
