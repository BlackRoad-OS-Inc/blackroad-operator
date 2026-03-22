import Link from "next/link";
import { Card, Button } from "@blackroad/ui";

const workspaces = [
  { id: "alpha", name: "Alpha Deck" },
  { id: "beta", name: "Beta Console" }
];

export default function HomePage() {
  return (
    <section className="grid gap-6 sm:grid-cols-2">
      {workspaces.map((workspace) => (
        <Card key={workspace.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm text-br-neon-glow uppercase tracking-[0.2em]">Workspace</p>
            <h2 className="text-lg font-semibold">{workspace.name}</h2>
          </div>
          <Button asChild>
            <Link href={`/workspace/${workspace.id}`}>Open</Link>
          </Button>
        </Card>
      ))}
    </section>
  );
}
