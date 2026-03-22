import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket, { SocketStream } from "@fastify/websocket";
import { handleIngest } from "./handlers.js";

const app = Fastify({ logger: true });
await app.register(websocket);

app.get("/healthz", async () => ({ ok: true }));

app.post("/ingest", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = handleIngest(request.body);
    app.log.info({ event: "ingest", ...result });
    return reply.send(result);
  } catch (error: any) {
    const message = error?.message ?? "invalid payload";
    app.log.warn({ event: "ingest-error", message });
    return reply.code(400).send({ error: message });
  }
});

app.get("/events", { websocket: true }, (connection: SocketStream) => {
  connection.socket.send(JSON.stringify({ hello: "island" }));
});

await app.listen({ host: "0.0.0.0", port: 8080 });
