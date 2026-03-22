import { Worker } from "bullmq";
export function registerSampleJobProcessor(connection = { host: "localhost", port: 6379 }) {
    const worker = new Worker("sample", async (job) => {
        console.log(`Processing job ${job.id}`);
        return job.data;
    }, { connection });
    worker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} failed`, err);
    });
    return worker;
}
