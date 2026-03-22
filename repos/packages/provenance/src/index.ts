export type ProvenanceOrigin =
  | "amundson-original"
  | "amundson-derived"
  | "public-domain"
  | "third-party";

export interface ProvenanceCard {
  id: string;
  title: string;
  kind: "definition" | "axiom" | "formula" | "metric" | "library";
  statementRef: string;
  origin: ProvenanceOrigin;
  license: string;
  authors?: string[];
  proofStatus?: "accepted" | "sketch" | "draft" | "open";
  sources?: string[];
  inputs?: string[];
  dependencies?: string[];
  commit?: string;
  url?: string;
}

export interface BadgeDescriptor {
  label: string;
  tone: "slate" | "emerald" | "amber" | "indigo";
}

export const ORIGIN_BADGES: Record<ProvenanceOrigin, BadgeDescriptor> = {
  "public-domain": { label: "PUBLIC DOMAIN", tone: "slate" },
  "third-party": { label: "THIRD-PARTY", tone: "indigo" },
  "amundson-original": { label: "AMUNDSON ORIGINAL", tone: "amber" },
  "amundson-derived": { label: "AMUNDSON DERIVED", tone: "emerald" },
};

export const LICENSE_ALLOW_LIST = [
  "public domain",
  "public-domain",
  "public domain (pd)",
  "© blackroad inc., all rights reserved",
  "bsd-3-clause",
  "mit",
];

export type LicenseStatus = "allowed" | "review";

export function checkLicenseStatus(license: string): LicenseStatus {
  const normalized = license.trim().toLowerCase();
  return LICENSE_ALLOW_LIST.includes(normalized) ? "allowed" : "review";
}

export interface ArtifactStamp {
  timestamp: string;
  inputs: Record<string, unknown>;
  formulaIds: string[];
  codeHash: string;
  dataHash: string;
}

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export interface ArtifactOptions {
  inputs: Record<string, unknown>;
  formulaIds: string[];
  codeSeed: string;
  dataSeed?: string;
  timestamp?: string;
}

export function createArtifactStamp({
  inputs,
  formulaIds,
  codeSeed,
  dataSeed,
  timestamp,
}: ArtifactOptions): ArtifactStamp {
  const serializedInputs = JSON.stringify(inputs);
  const serializedFormulas = formulaIds.join(",");
  const codeHash = hashString(`${codeSeed}:${serializedFormulas}`);
  const dataHash = hashString(`${dataSeed ?? ""}:${serializedInputs}`);
  return {
    timestamp: timestamp ?? new Date().toISOString(),
    inputs,
    formulaIds,
    codeHash,
    dataHash,
  };
}

export function normalizeCard(card: ProvenanceCard): ProvenanceCard {
  return {
    ...card,
    statementRef: card.statementRef.trim(),
    license: card.license.trim(),
    id: card.id.trim(),
    title: card.title.trim(),
    dependencies: card.dependencies ?? [],
    inputs: card.inputs ?? [],
  };
}
