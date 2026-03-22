/**
 * Service Registry Tests
 */

import { describe, test, expect } from "vitest";
import {
  getServiceById,
  listServices,
  listServicesByKind,
  constructServiceUrl,
  validateRegistry,
} from "../src/services/helpers";
import { SERVICE_REGISTRY } from "../src/services/registry";
import type { ServiceId } from "../src/services/types";

describe("Service Registry", () => {
  test("should have all required services", () => {
    const requiredServices: ServiceId[] = [
      "core",
      "api",
      "operator",
      "web",
      "prism-console",
      "pack-education",
      "pack-infra-devops",
      "pack-finance",
      "pack-legal",
    ];

    requiredServices.forEach((id) => {
      expect(SERVICE_REGISTRY[id]).toBeDefined();
      expect(SERVICE_REGISTRY[id].id).toBe(id);
    });
  });

  test("should validate registry integrity", () => {
    const validation = validateRegistry();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test("should get service by ID", () => {
    const service = getServiceById("api");
    expect(service).toBeDefined();
    expect(service?.id).toBe("api");
    expect(service?.name).toBe("BlackRoad OS API");
  });

  test("should return undefined for invalid service ID", () => {
    const service = getServiceById("invalid" as ServiceId);
    expect(service).toBeUndefined();
  });

  test("should list all services", () => {
    const services = listServices();
    expect(services.length).toBeGreaterThan(0);
    expect(services.length).toBe(Object.keys(SERVICE_REGISTRY).length);
  });

  test("should list services by kind", () => {
    const packServices = listServicesByKind("pack");
    expect(packServices.length).toBeGreaterThan(0);
    packServices.forEach((service) => {
      expect(service.kind).toBe("pack");
    });

    const apiServices = listServicesByKind("api");
    expect(apiServices.length).toBe(1);
    expect(apiServices[0].id).toBe("api");
  });

  test("should construct service URL correctly", () => {
    const url = constructServiceUrl("api", "health_path", "localhost:3000", "http");
    expect(url).toBe("http://localhost:3000/api/health");

    const httpsUrl = constructServiceUrl("api", "version_path", "api.blackroad.io", "https");
    expect(httpsUrl).toBe("https://api.blackroad.io/api/version");
  });

  test("should return undefined for invalid service in constructServiceUrl", () => {
    const url = constructServiceUrl("invalid" as ServiceId, "health_path", "localhost:3000");
    expect(url).toBeUndefined();
  });

  test("all services should have required fields", () => {
    const services = listServices();
    services.forEach((service) => {
      expect(service.id).toBeTruthy();
      expect(service.name).toBeTruthy();
      expect(service.description).toBeTruthy();
      expect(service.kind).toBeTruthy();
      expect(service.default_env).toBeTruthy();
      expect(service.health_path).toBeTruthy();
      expect(service.ready_path).toBeTruthy();
      expect(service.version_path).toBeTruthy();
    });
  });

  test("should have no duplicate service IDs", () => {
    const services = listServices();
    const ids = services.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
