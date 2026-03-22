import {
  Environments,
  EnvironmentConfig,
  Teams,
  TeamConfig,
  Packs,
  PackConfig,
  GenericStatuses,
  JobStatuses,
  DeploymentStatuses,
  AgentStatuses,
  StatusColors,
  Priorities,
  PriorityConfig,
  ErrorCodes,
} from "../src/constants";

describe("Constants", () => {
  describe("Environments", () => {
    it("should define all environments", () => {
      expect(Environments.LOCAL).toBe("local");
      expect(Environments.DEVELOPMENT).toBe("development");
      expect(Environments.STAGING).toBe("staging");
      expect(Environments.PRODUCTION).toBe("production");
    });

    it("should have config for all environments", () => {
      Object.values(Environments).forEach((env) => {
        expect(EnvironmentConfig[env]).toBeDefined();
        expect(EnvironmentConfig[env].name).toBeTruthy();
        expect(EnvironmentConfig[env].color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should mark production as dangerous", () => {
      expect(EnvironmentConfig.production.dangerous).toBe(true);
      expect(EnvironmentConfig.development.dangerous).toBe(false);
    });
  });

  describe("Teams", () => {
    it("should define all teams", () => {
      expect(Teams.ENGINEERING).toBe("engineering");
      expect(Teams.PRODUCT).toBe("product");
      expect(Teams.DESIGN).toBe("design");
      expect(Teams.OPERATIONS).toBe("operations");
      expect(Teams.SUPPORT).toBe("support");
      expect(Teams.SECURITY).toBe("security");
      expect(Teams.FINANCE).toBe("finance");
      expect(Teams.LEADERSHIP).toBe("leadership");
    });

    it("should have config for all teams", () => {
      Object.values(Teams).forEach((team) => {
        expect(TeamConfig[team]).toBeDefined();
        expect(TeamConfig[team].name).toBeTruthy();
        expect(TeamConfig[team].icon).toBeTruthy();
        expect(TeamConfig[team].color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe("Packs", () => {
    it("should define all packs", () => {
      expect(Packs.EDUCATION).toBe("education");
      expect(Packs.INFRA_DEVOPS).toBe("infra-devops");
      expect(Packs.FINANCE).toBe("finance");
      expect(Packs.LEGAL).toBe("legal");
      expect(Packs.HEALTHCARE).toBe("healthcare");
      expect(Packs.ECOMMERCE).toBe("ecommerce");
      expect(Packs.MARKETING).toBe("marketing");
      expect(Packs.HR).toBe("hr");
    });

    it("should have config for all packs", () => {
      Object.values(Packs).forEach((pack) => {
        expect(PackConfig[pack]).toBeDefined();
        expect(PackConfig[pack].id).toMatch(/^pack-/);
        expect(PackConfig[pack].name).toBeTruthy();
        expect(PackConfig[pack].description).toBeTruthy();
      });
    });
  });

  describe("Statuses", () => {
    it("should define generic statuses", () => {
      expect(GenericStatuses.ACTIVE).toBe("active");
      expect(GenericStatuses.INACTIVE).toBe("inactive");
      expect(GenericStatuses.PENDING).toBe("pending");
      expect(GenericStatuses.ARCHIVED).toBe("archived");
      expect(GenericStatuses.DELETED).toBe("deleted");
      expect(GenericStatuses.SUSPENDED).toBe("suspended");
    });

    it("should define job statuses", () => {
      expect(JobStatuses.QUEUED).toBe("queued");
      expect(JobStatuses.RUNNING).toBe("running");
      expect(JobStatuses.COMPLETED).toBe("completed");
      expect(JobStatuses.FAILED).toBe("failed");
      expect(JobStatuses.CANCELLED).toBe("cancelled");
      expect(JobStatuses.TIMED_OUT).toBe("timed_out");
    });

    it("should define deployment statuses", () => {
      expect(DeploymentStatuses.PENDING).toBe("pending");
      expect(DeploymentStatuses.BUILDING).toBe("building");
      expect(DeploymentStatuses.DEPLOYING).toBe("deploying");
      expect(DeploymentStatuses.SUCCEEDED).toBe("succeeded");
      expect(DeploymentStatuses.FAILED).toBe("failed");
      expect(DeploymentStatuses.ROLLED_BACK).toBe("rolled_back");
    });

    it("should define agent statuses", () => {
      expect(AgentStatuses.IDLE).toBe("idle");
      expect(AgentStatuses.RUNNING).toBe("running");
      expect(AgentStatuses.ERROR).toBe("error");
      expect(AgentStatuses.OFFLINE).toBe("offline");
      expect(AgentStatuses.MAINTENANCE).toBe("maintenance");
    });

    it("should have metadata for common statuses", () => {
      const statusesToCheck = ["active", "pending", "completed", "failed", "running"];
      
      statusesToCheck.forEach((status) => {
        expect(StatusColors[status]).toBeDefined();
        expect(StatusColors[status].label).toBeTruthy();
        expect(StatusColors[status].color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe("Priorities", () => {
    it("should define all priorities", () => {
      expect(Priorities.CRITICAL).toBe("critical");
      expect(Priorities.HIGH).toBe("high");
      expect(Priorities.MEDIUM).toBe("medium");
      expect(Priorities.LOW).toBe("low");
    });

    it("should have ascending weights", () => {
      expect(PriorityConfig.critical.weight).toBeGreaterThan(PriorityConfig.high.weight);
      expect(PriorityConfig.high.weight).toBeGreaterThan(PriorityConfig.medium.weight);
      expect(PriorityConfig.medium.weight).toBeGreaterThan(PriorityConfig.low.weight);
    });
  });

  describe("ErrorCodes", () => {
    it("should define auth error codes", () => {
      expect(ErrorCodes.UNAUTHORIZED).toBe("unauthorized");
      expect(ErrorCodes.FORBIDDEN).toBe("forbidden");
      expect(ErrorCodes.SESSION_EXPIRED).toBe("session_expired");
    });

    it("should define resource error codes", () => {
      expect(ErrorCodes.NOT_FOUND).toBe("not_found");
      expect(ErrorCodes.ALREADY_EXISTS).toBe("already_exists");
      expect(ErrorCodes.CONFLICT).toBe("conflict");
    });

    it("should define server error codes", () => {
      expect(ErrorCodes.INTERNAL_ERROR).toBe("internal_error");
      expect(ErrorCodes.SERVICE_UNAVAILABLE).toBe("service_unavailable");
      expect(ErrorCodes.TIMEOUT).toBe("timeout");
    });
  });
});
