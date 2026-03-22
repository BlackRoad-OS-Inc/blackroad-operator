interface SigNode {
  id: string;
  label: string;
  factors?: string[];
  children?: SigNode[];
}

interface PositionedNode extends SigNode {
  angle: number;
  radius: number;
  depth: number;
}

const sampleTree: SigNode = {
  id: "agent-root",
  label: "Finance Orchestrator",
  factors: ["mission:control", "jurisdiction:us"],
  children: [
    {
      id: "capability-compliance",
      label: "Compliance",
      factors: ["finra", "sec", "aml"],
      children: [
        { id: "surveillance", label: "Surveillance", factors: ["market", "communications"] },
        { id: "kyc", label: "KYC", factors: ["identity", "risk-scoring"] }
      ]
    },
    {
      id: "capability-revenue",
      label: "Revenue",
      factors: ["pricing", "sales-ops"],
      children: [
        { id: "pricing-engine", label: "Pricing", factors: ["elasticity", "discounts"] },
        { id: "deal-desk", label: "Deal Desk", factors: ["approval", "margins"] }
      ]
    }
  ]
};

function positionTree(node: SigNode, depth = 0, startAngle = 0, endAngle = Math.PI * 2): PositionedNode {
  const radius = depth + 1;
  const angle = (startAngle + endAngle) / 2;
  const positionedChildren = (node.children ?? []).map((child, index, arr) => {
    const segmentSize = (endAngle - startAngle) / Math.max(arr.length, 1);
    const childStart = startAngle + index * segmentSize;
    const childEnd = childStart + segmentSize;
    return positionTree(child, depth + 1, childStart, childEnd);
  });

  return {
    ...node,
    angle,
    radius,
    depth,
    children: positionedChildren
  };
}

function renderTree(node: PositionedNode, indent = ""): void {
  const angleDeg = (node.angle * 180) / Math.PI;
  console.log(`${indent}- ${node.label} [r=${node.radius.toFixed(1)}, θ=${angleDeg.toFixed(1)}°]`);
  if (node.factors?.length) {
    console.log(`${indent}  factors: ${node.factors.join(", ")}`);
  }
  for (const child of node.children ?? []) {
    renderTree(child as PositionedNode, `${indent}  `);
  }
}

const positioned = positionTree(sampleTree);
renderTree(positioned);
