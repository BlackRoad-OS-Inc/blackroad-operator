import websocket from "@fastify/websocket";
import { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { GatewayEvent } from "./types.js";

interface ConnectionContext {
  profileId?: string;
}

export const wsPlugin: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  await fastify.register(websocket);

  fastify.get(
    "/ws",
    { websocket: true },
    (connection, request) => {
      const context: ConnectionContext = {};

      connection.socket.on("message", (rawMessage: Buffer) => {
        try {
          const message = JSON.parse(rawMessage.toString());
          if (message.type === "hello" && typeof message.profileId === "string") {
            context.profileId = message.profileId;
            fastify.log.info({ profileId: context.profileId }, "WebSocket hello acknowledged");
            connection.socket.send(JSON.stringify({ type: "hello.ack" }));
          }
        } catch (error) {
          fastify.log.warn({ err: error }, "Failed to process websocket message");
        }
      });

      connection.socket.on("close", () => {
        if (context.profileId) {
          fastify.log.info({ profileId: context.profileId }, "WebSocket disconnected");
        }
      });
    }
  );

  fastify.decorate("broadcastGatewayEvent", (event: GatewayEvent) => {
    const clients = fastify.websocketServer?.clients ?? new Set();
    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(event));
      }
    }
  });
});

declare module "fastify" {
  interface FastifyInstance {
    broadcastGatewayEvent: (event: GatewayEvent) => void;
  }
}
