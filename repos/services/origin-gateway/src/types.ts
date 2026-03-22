export interface Session {
  id: string;
  profileId: string;
  status: "pending" | "active" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactManifest {
  id: string;
  pedestalId: string;
  artifactUri: string;
  previewUri?: string;
  lineageHash: string;
  mintedBy: string;
  mintedAt: string;
}

export interface ParcelClaim {
  id: string;
  parcelId: string;
  profileId: string;
  claimedAt: string;
  expiresAt?: string;
}

export type GatewayEvent =
  | {
      type: "session.updated";
      payload: Session;
    }
  | {
      type: "artifact.created";
      payload: ArtifactManifest;
    }
  | {
      type: "parcel.claimed";
      payload: ParcelClaim;
    };
