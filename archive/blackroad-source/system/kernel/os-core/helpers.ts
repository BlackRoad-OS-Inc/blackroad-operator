/**
 * Service Registry Helpers
 * Utility functions for working with the service registry
 */

import { SERVICE_REGISTRY } from "./registry";
import type { ServiceMetadata, ServiceId, ServiceKind, BaseEnv } from "./types";

/**
 * Get service metadata by ID
 */
export function getServiceById(id: ServiceId): ServiceMetadata | undefined {
  return SERVICE_REGISTRY[id];
}

/**
 * List all services
 */
export function listServices(): ServiceMetadata[] {
  return Object.values(SERVICE_REGISTRY);
}

/**
 * List services by kind
 */
export function listServicesByKind(kind: ServiceKind): ServiceMetadata[] {
  return listServices().filter((service) => service.kind === kind);
}

/**
 * Construct a full URL for a service endpoint
 * @param serviceId - The service ID
 * @param endpointPath - The endpoint path (health_path, ready_path, or version_path)
 * @param baseHostname - Base hostname (e.g., "localhost:3000" or "api.blackroad.io")
 * @param protocol - HTTP protocol (default: "http")
 */
export function constructServiceUrl(
  serviceId: ServiceId,
  endpointPath: keyof Pick<
    ServiceMetadata,
    "health_path" | "ready_path" | "version_path"
  >,
  baseHostname: string,
  protocol: "http" | "https" = "http"
): string | undefined {
  const service = getServiceById(serviceId);
  if (!service) {
    return undefined;
  }

  const path = service[endpointPath];
  return `${protocol}://${baseHostname}${path}`;
}

/**
 * Validate service registry integrity
 * Checks for duplicate IDs and ensures all required fields are present
 */
export function validateRegistry(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const [key, service] of Object.entries(SERVICE_REGISTRY)) {
    // Check if key matches service.id
    if (key !== service.id) {
      errors.push(`Service key "${key}" does not match service.id "${service.id}"`);
    }

    // Check for duplicate IDs
    if (ids.has(service.id)) {
      errors.push(`Duplicate service ID: ${service.id}`);
    }
    ids.add(service.id);

    // Validate required fields
    if (!service.name) {
      errors.push(`Service ${service.id} missing name`);
    }
    if (!service.description) {
      errors.push(`Service ${service.id} missing description`);
    }
    if (!service.health_path) {
      errors.push(`Service ${service.id} missing health_path`);
    }
    if (!service.ready_path) {
      errors.push(`Service ${service.id} missing ready_path`);
    }
    if (!service.version_path) {
      errors.push(`Service ${service.id} missing version_path`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
