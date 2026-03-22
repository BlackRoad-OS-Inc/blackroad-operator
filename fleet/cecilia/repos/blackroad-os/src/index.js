import Fastify from "fastify";
import { getBuildInfo } from "./utils/buildInfo";
export async function createServer() {
    const server = Fastify({ logger: true });
    server.get("/health", async () => ({ status: "ok" }));
    server.get("/version", async () => {
        const info = getBuildInfo();
        return { version: info.version, commit: info.commit };
    });
    return server;
}
if (require.main === module) {
    const port = Number(process.env.PORT || 3000);
    createServer()
        .then((server) => server.listen({ port, host: "0.0.0.0" }))
        .then((address) => {
        console.log(`Server listening at ${address}`);
    })
        .catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
