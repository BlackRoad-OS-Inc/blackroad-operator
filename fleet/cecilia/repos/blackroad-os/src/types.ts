export type EnvStatus = "healthy" | "degraded" | "down";

export interface Environment {
  id: string;
  name: string;
  region: string;
  status: EnvStatus;
}
