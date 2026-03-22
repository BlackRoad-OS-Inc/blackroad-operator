import cron from "node-cron";
import { Queue } from "bullmq";
export function buildHeartbeatQueue(connection = { host: "localhost", port: 6379 }) {
    return new Queue("heartbeat", { connection });
}
let defaultQueue = null;
function getDefaultQueue() {
    if (!defaultQueue) {
        defaultQueue = buildHeartbeatQueue();
    }
    return defaultQueue;
}
export async function enqueueHeartbeat(queue = getDefaultQueue()) {
    const payload = { ts: Date.now() };
    await queue.add("heartbeat", payload);
    return payload;
}
export function startHeartbeatScheduler(queue = getDefaultQueue()) {
    const task = cron.schedule("*/5 * * * *", () => {
        enqueueHeartbeat(queue);
    });
    return task;
}
