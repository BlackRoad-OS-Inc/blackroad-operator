import {
  type DomainEvent,
  type UserLoggedInPayload,
  type DeploymentChangedPayload,
  type AgentRunStartedPayload,
  DomainEventTypes,
} from "../src/events/domainEvent";

describe("Domain Events", () => {
  describe("DomainEvent", () => {
    it("should create a valid domain event", () => {
      const event: DomainEvent<UserLoggedInPayload> = {
        id: "pssha∞_event123",
        type: DomainEventTypes.USER_LOGGED_IN,
        payload: {
          userId: "pssha∞_user123",
          sessionId: "pssha∞_sess123",
          orgId: "pssha∞_org123",
          method: "oauth",
          deviceInfo: {
            userAgent: "Mozilla/5.0",
            platform: "macOS",
          },
        },
        severity: "info",
        timestamp: "2024-01-01T00:00:00.000Z",
      };

      expect(event.type).toBe("user.logged_in");
      expect(event.payload.method).toBe("oauth");
    });
  });

  describe("DeploymentChangedPayload", () => {
    it("should create a valid deployment event", () => {
      const event: DomainEvent<DeploymentChangedPayload> = {
        id: "pssha∞_event456",
        type: DomainEventTypes.DEPLOYMENT_CHANGED,
        payload: {
          deploymentId: "pssha∞_deploy123",
          status: "succeeded",
          environment: "production",
          version: "1.2.3",
          triggeredBy: "pssha∞_user123",
          metadata: {
            commitSha: "abc123",
            duration: 120,
          },
        },
        severity: "info",
        timestamp: "2024-01-01T00:00:00.000Z",
      };

      expect(event.type).toBe("deployment.changed");
      expect(event.payload.status).toBe("succeeded");
      expect(event.payload.metadata?.duration).toBe(120);
    });
  });

  describe("AgentRunStartedPayload", () => {
    it("should create a valid agent run event", () => {
      const event: DomainEvent<AgentRunStartedPayload> = {
        id: "pssha∞_event789",
        type: DomainEventTypes.AGENT_RUN_STARTED,
        payload: {
          runId: "pssha∞_run123",
          agentId: "pssha∞_agent123",
          jobId: "pssha∞_job123",
          input: {
            query: "What is the weather?",
            options: { verbose: true },
          },
          triggeredBy: "user",
        },
        severity: "info",
        timestamp: "2024-01-01T00:00:00.000Z",
        agentId: "pssha∞_agent123",
      };

      expect(event.type).toBe("agent.run_started");
      expect(event.payload.triggeredBy).toBe("user");
    });
  });

  describe("DomainEventTypes", () => {
    it("should define all user events", () => {
      expect(DomainEventTypes.USER_LOGGED_IN).toBe("user.logged_in");
      expect(DomainEventTypes.USER_LOGGED_OUT).toBe("user.logged_out");
      expect(DomainEventTypes.USER_ROLE_CHANGED).toBe("user.role_changed");
      expect(DomainEventTypes.USER_INVITED).toBe("user.invited");
    });

    it("should define all org events", () => {
      expect(DomainEventTypes.ORG_CREATED).toBe("org.created");
      expect(DomainEventTypes.ORG_UPDATED).toBe("org.updated");
    });

    it("should define all workspace events", () => {
      expect(DomainEventTypes.WORKSPACE_CREATED).toBe("workspace.created");
      expect(DomainEventTypes.WORKSPACE_DELETED).toBe("workspace.deleted");
    });

    it("should define all deployment events", () => {
      expect(DomainEventTypes.DEPLOYMENT_CHANGED).toBe("deployment.changed");
      expect(DomainEventTypes.DEPLOYMENT_STARTED).toBe("deployment.started");
      expect(DomainEventTypes.DEPLOYMENT_COMPLETED).toBe("deployment.completed");
    });

    it("should define all agent events", () => {
      expect(DomainEventTypes.AGENT_RUN_STARTED).toBe("agent.run_started");
      expect(DomainEventTypes.AGENT_RUN_COMPLETED).toBe("agent.run_completed");
      expect(DomainEventTypes.AGENT_STATUS_CHANGED).toBe("agent.status_changed");
    });

    it("should define all app events", () => {
      expect(DomainEventTypes.APP_OPENED).toBe("app.opened");
      expect(DomainEventTypes.APP_CLOSED).toBe("app.closed");
    });

    it("should define environment events", () => {
      expect(DomainEventTypes.ENVIRONMENT_SWITCHED).toBe("environment.switched");
    });
  });
});
