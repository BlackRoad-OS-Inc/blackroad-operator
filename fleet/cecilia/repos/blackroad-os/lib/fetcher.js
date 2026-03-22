const mockEnvironments = [
    { id: "env_1", name: "Development", region: "us-east-1", status: "healthy" },
    { id: "env_2", name: "Staging", region: "eu-west-1", status: "degraded" }
];
export async function getEnvironments() {
    return mockEnvironments;
}
export async function getEnvById(id) {
    return mockEnvironments.find((env) => env.id === id);
}
export async function getHealth() {
    return { status: "ok", uptime: process.uptime() };
}
export async function getVersion() {
    const version = process.env.APP_VERSION || "1.0.0";
    const commit = process.env.APP_COMMIT || "unknown";
    return { version, commit };
}
