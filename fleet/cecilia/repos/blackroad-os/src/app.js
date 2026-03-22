import express from "express";
import { createMetaRouter } from "./routes/meta";
export function createApp() {
    const app = express();
    app.use(express.json());
    app.use("/internal", createMetaRouter());
    return app;
}
