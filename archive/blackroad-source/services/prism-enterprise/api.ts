import { randomUUID } from "node:crypto";
import { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { ArtifactManifest, ParcelClaim, Session } from "./types.js";

const sessionRequestSchema = z.object({
  profileId: z.string().uuid(),
  spawnZone: z.string(),
  clientVersion: z.string()
});

const queuePedestalSchema = z.object({
  queueId: z.string(),
  seed: z.string().optional()
});

const artifactSchema = z.object({
  id: z.string().uuid(),
  pedestalId: z.string(),
  artifactUri: z.string().url(),
  previewUri: z.string().url().optional(),
  lineageHash: z.string(),
  mintedBy: z.string(),
  mintedAt: z.string()
});

const parcelClaimSchema = z.object({
  parcelId: z.string(),
  profileId: z.string().uuid(),
  expiresAt: z.string().optional()
});

export const apiPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: z.infer<typeof sessionRequestSchema>; Reply: Session }>(
    "/sessions",
    {
      schema: {
        description: "Establish a new visitor session in Origin Campus.",
        body: {
          type: "object",
          required: ["profileId", "spawnZone", "clientVersion"],
          properties: {
            profileId: { type: "string", format: "uuid" },
            spawnZone: { type: "string" },
            clientVersion: { type: "string" }
          }
        }
      }
    },
    async (request, reply) => {
      const body = sessionRequestSchema.parse(request.body);
      const now = new Date().toISOString();
      const session: Session = {
        id: randomUUID(),
        profileId: body.profileId,
        status: "pending",
        createdAt: now,
        updatedAt: now
      };

      reply.code(202);
      return session;
    }
  );

  fastify.get<{ Params: { sessionId: string }; Reply: Session | { message: string } }>(
    "/sessions/:sessionId",
    {
      schema: {
        description: "Fetch current state for a session.",
        params: {
          type: "object",
          required: ["sessionId"],
          properties: { sessionId: { type: "string", format: "uuid" } }
        }
      }
    },
    async (request, reply) => {
      const { sessionId } = request.params;
      reply.code(404);
      return { message: `Session ${sessionId} not yet persisted.` };
    }
  );

  fastify.post<{ Params: { pedestalId: string }; Body: z.infer<typeof queuePedestalSchema> }>(
    "/pedestals/:pedestalId/queue",
    {
      schema: {
        description: "Queue a QLM task for a pedestal interaction.",
        params: {
          type: "object",
          required: ["pedestalId"],
          properties: { pedestalId: { type: "string" } }
        }
      }
    },
    async (request, reply) => {
      const { pedestalId } = request.params;
      const body = queuePedestalSchema.parse(request.body);
      fastify.log.info({ pedestalId, body }, "Queued pedestal job");
      reply.code(202);
      return { status: "queued", pedestalId, queueId: body.queueId };
    }
  );

  fastify.post<{ Body: z.infer<typeof artifactSchema>; Reply: ArtifactManifest }>(
    "/artifacts",
    {
      schema: {
        description: "Record a new artifact manifest from the QLM bridge.",
        body: {
          type: "object"
        }
      }
    },
    async (request, reply) => {
      const manifest = artifactSchema.parse(request.body);
      reply.code(201);
      return manifest satisfies ArtifactManifest;
    }
  );

  fastify.post<{ Body: z.infer<typeof parcelClaimSchema>; Reply: ParcelClaim }>(
    "/parcels/claim",
    {
      schema: {
        description: "Claim a parcel for a stamped visitor profile.",
        body: {
          type: "object"
        }
      }
    },
    async (request, reply) => {
      const claimRequest = parcelClaimSchema.parse(request.body);
      const now = new Date().toISOString();
      const claim: ParcelClaim = {
        id: randomUUID(),
        parcelId: claimRequest.parcelId,
        profileId: claimRequest.profileId,
        claimedAt: now,
        expiresAt: claimRequest.expiresAt
      };

      reply.code(201);
      return claim;
    }
  );
};
