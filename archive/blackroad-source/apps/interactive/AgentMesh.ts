/**
 * BlackRoad Agent Mesh — Live D3.js Force Graph WebComponent
 * Renders agent nodes and their communication edges in real-time.
 */
export interface AgentNode {
  id: string;
  name: string;
  type: "logic" | "gateway" | "compute" | "memory" | "security" | "vision";
  status: "active" | "idle" | "busy";
  taskCount: number;
}

export interface AgentEdge {
  source: string;
  target: string;
  strength: number; // 0-1 bond strength
  messageCount: number;
}

const AGENT_COLORS: Record<string, string> = {
  logic:    "#9c27b0",  // LUCIDIA — violet
  gateway:  "#2979ff",  // ALICE   — electric blue
  compute:  "#f5a623",  // OCTAVIA — amber
  vision:   "#00bcd4",  // PRISM   — cyan
  memory:   "#4caf50",  // ECHO    — green
  security: "#ff1d6c",  // CIPHER  — hot pink
};

export class AgentMeshRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private nodes: AgentNode[] = [];
  private edges: AgentEdge[] = [];
  private positions: Map<string, { x: number; y: number; vx: number; vy: number }> = new Map();
  private animFrame: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.initDefaultAgents();
  }

  private initDefaultAgents() {
    this.nodes = [
      { id: "lucidia", name: "LUCIDIA", type: "logic",    status: "active", taskCount: 12 },
      { id: "alice",   name: "ALICE",   type: "gateway",  status: "busy",   taskCount: 847 },
      { id: "octavia", name: "OCTAVIA", type: "compute",  status: "active", taskCount: 201 },
      { id: "prism",   name: "PRISM",   type: "vision",   status: "idle",   taskCount: 55 },
      { id: "echo",    name: "ECHO",    type: "memory",   status: "active", taskCount: 133 },
      { id: "cipher",  name: "CIPHER",  type: "security", status: "busy",   taskCount: 422 },
    ];
    this.edges = [
      { source: "lucidia", target: "echo",    strength: 0.95, messageCount: 2340 },
      { source: "alice",   target: "octavia", strength: 0.88, messageCount: 18920 },
      { source: "cipher",  target: "alice",   strength: 0.82, messageCount: 5621 },
      { source: "prism",   target: "echo",    strength: 0.75, messageCount: 3109 },
      { source: "lucidia", target: "cipher",  strength: 0.65, messageCount: 901 },
      { source: "alice",   target: "prism",   strength: 0.60, messageCount: 1204 },
    ];
    // Random initial positions
    const cx = this.canvas.width / 2, cy = this.canvas.height / 2;
    this.nodes.forEach(n => {
      this.positions.set(n.id, {
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 200,
        vx: 0, vy: 0
      });
    });
  }

  private applyForces() {
    // Repulsion between nodes
    const k = 8000;
    this.nodes.forEach(a => {
      const pa = this.positions.get(a.id)!;
      this.nodes.forEach(b => {
        if (a.id === b.id) return;
        const pb = this.positions.get(b.id)!;
        const dx = pa.x - pb.x, dy = pa.y - pb.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const f = k / (dist * dist);
        pa.vx += f * dx / dist;
        pa.vy += f * dy / dist;
      });
    });
    // Attraction along edges
    this.edges.forEach(e => {
      const pa = this.positions.get(e.source)!, pb = this.positions.get(e.target)!;
      if (!pa || !pb) return;
      const dx = pb.x - pa.x, dy = pb.y - pa.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const f = (dist - 100) * e.strength * 0.1;
      pa.vx += f * dx / dist; pa.vy += f * dy / dist;
      pb.vx -= f * dx / dist; pb.vy -= f * dy / dist;
    });
    // Damping + center gravity
    const cx = this.canvas.width / 2, cy = this.canvas.height / 2;
    this.positions.forEach(p => {
      p.vx = (p.vx + (cx - p.x) * 0.001) * 0.85;
      p.vy = (p.vy + (cy - p.y) * 0.001) * 0.85;
      p.x += p.vx; p.y += p.vy;
    });
  }

  private draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    this.edges.forEach(e => {
      const pa = this.positions.get(e.source)!, pb = this.positions.get(e.target)!;
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = `rgba(255,29,108,${e.strength * 0.4})`;
      ctx.lineWidth = e.strength * 3;
      ctx.stroke();
    });

    // Draw nodes
    this.nodes.forEach(n => {
      const p = this.positions.get(n.id)!;
      const r = 20 + Math.min(n.taskCount / 100, 10);
      const color = AGENT_COLORS[n.type];
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color + "33";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = n.status === "busy" ? 3 : 1.5;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(n.name, p.x, p.y + 4);
      ctx.font = "9px monospace";
      ctx.fillStyle = "#888";
      ctx.fillText(`${n.taskCount}t`, p.x, p.y + r + 14);
    });
  }

  start() {
    const loop = () => {
      this.applyForces();
      this.draw();
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    cancelAnimationFrame(this.animFrame);
  }
}
