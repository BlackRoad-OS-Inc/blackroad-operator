export interface RegistrySummary {
  id: string;
  name: string;
  mentors: string[];
  peers: string[];
  apprentices: string[];
}

export type Ring = "mentor" | "peer" | "apprentice";

export interface GraphNode {
  id: string;
  label: string;
  ring: Ring;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: "mentorship" | "peer" | "apprentice";
}

export interface MentorGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rings: Record<Ring, string[]>;
}

const defaultRing: Ring = "peer";

function determineRing(summary: RegistrySummary): Ring {
  if (summary.apprentices.length > 0) {
    return "mentor";
  }
  if (summary.mentors.length > 0) {
    return "apprentice";
  }
  return defaultRing;
}

export function buildMentorGraph(summaries: RegistrySummary[]): MentorGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const ringBuckets: Record<Ring, Set<string>> = {
    mentor: new Set<string>(),
    peer: new Set<string>(),
    apprentice: new Set<string>(),
  };

  const summariesById = new Map(summaries.map((summary) => [summary.id, summary] as const));

  for (const summary of summaries) {
    const ring = determineRing(summary);
    nodes.push({ id: summary.id, label: summary.name, ring });
    ringBuckets[ring].add(summary.id);

    for (const mentorId of summary.mentors) {
      edges.push({ from: mentorId, to: summary.id, relation: "mentorship" });
      if (!ringBuckets.mentor.has(mentorId) && summariesById.has(mentorId)) {
        ringBuckets.mentor.add(mentorId);
      }
    }

    const peerSet = new Set(summary.peers);
    const orderedPeers = Array.from(peerSet).sort();
    for (const peerId of orderedPeers) {
      if (summary.id < peerId) {
        edges.push({ from: summary.id, to: peerId, relation: "peer" });
      }
      ringBuckets.peer.add(peerId);
    }

    for (const apprenticeId of summary.apprentices) {
      edges.push({ from: summary.id, to: apprenticeId, relation: "apprentice" });
      ringBuckets.apprentice.add(apprenticeId);
    }
  }

  return {
    nodes,
    edges,
    rings: {
      mentor: Array.from(ringBuckets.mentor).sort(),
      peer: Array.from(ringBuckets.peer).sort(),
      apprentice: Array.from(ringBuckets.apprentice).sort(),
    },
  };
}
