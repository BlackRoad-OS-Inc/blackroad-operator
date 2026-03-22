import { List, Action, ActionPanel, showToast, Toast, Icon, Color, Detail } from "@raycast/api"
import { useState, useEffect } from "react"

const PRISM = "https://prism.blackroad.io/api";

interface Node {
  name: string;
  status: string;
  cpu_temp?: number;
  mem_used_mb?: number;
  mem_total_mb?: number;
  disk_pct?: number;
  ollama_models?: number;
  docker_containers?: number;
}

interface KPIs {
  fleet: string;
  models: number;
  repos: number;
  containers: number;
  ports: number;
  orgs: number;
}

export default function Command() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(PRISM + "/fleet").then(r => r.json()).catch(() => ({ nodes: [] })),
      fetch(PRISM + "/kpis").then(r => r.json()).catch(() => null),
    ]).then(([fleet, kpiData]) => {
      setNodes(fleet.nodes || []);
      setKpis(kpiData);
      setLoading(false);
    });
  }, []);

  const online = nodes.filter(n => n.status === "online").length;

  return (
    <List isLoading={loading} searchBarPlaceholder="Search BlackRoad OS...">
      <List.Section title={`Fleet — ${online}/${nodes.length} online`}>
        {nodes.map(n => (
          <List.Item
            key={n.name}
            icon={{ source: Icon.CircleFilled, tintColor: n.status === "online" ? Color.Green : Color.Red }}
            title={n.name}
            subtitle={`${n.cpu_temp || "?"}°C · ${n.ollama_models || 0} models · disk ${n.disk_pct || "?"}%`}
            accessories={[{ text: `${Math.round(n.mem_used_mb || 0)}/${Math.round(n.mem_total_mb || 0)}MB` }]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Open Prism" url="https://prism.blackroad.io" />
                <Action.CopyToClipboard title="Copy Node Info" content={JSON.stringify(n, null, 2)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Quick Actions">
        <List.Item icon={Icon.Globe} title="Prism Console" subtitle="Operations dashboard" actions={<ActionPanel><Action.OpenInBrowser url="https://prism.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.MagnifyingGlass} title="Search" subtitle="search.blackroad.io" actions={<ActionPanel><Action.OpenInBrowser url="https://search.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.Message} title="Chat" subtitle="AI chat" actions={<ActionPanel><Action.OpenInBrowser url="https://chat.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.GameController} title="Games" subtitle="games.blackroad.io" actions={<ActionPanel><Action.OpenInBrowser url="https://games.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.Building} title="Office" subtitle="Pixel office" actions={<ActionPanel><Action.OpenInBrowser url="https://office.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.Stars} title="Metaverse" subtitle="Build worlds" actions={<ActionPanel><Action.OpenInBrowser url="https://metaverse.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.Wallet} title="Pricing" subtitle="Plans & add-ons" actions={<ActionPanel><Action.OpenInBrowser url="https://pricing.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.Code} title="GitHub" subtitle="1701 repos" actions={<ActionPanel><Action.OpenInBrowser url="https://github.com/BlackRoad-OS-Inc" /></ActionPanel>} />
      </List.Section>

      {kpis && (
        <List.Section title="KPIs">
          <List.Item icon={Icon.ComputerChip} title="Fleet" subtitle={kpis.fleet} />
          <List.Item icon={Icon.LightBulb} title="Models" subtitle={String(kpis.models)} />
          <List.Item icon={Icon.Box} title="Containers" subtitle={String(kpis.containers)} />
          <List.Item icon={Icon.Document} title="Repos" subtitle={String(kpis.repos)} />
          <List.Item icon={Icon.Network} title="Ports" subtitle={String(kpis.ports)} />
        </List.Section>
      )}

      <List.Section title="Sites">
        <List.Item icon={Icon.House} title="blackroad.io" actions={<ActionPanel><Action.OpenInBrowser url="https://blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.Brain} title="blackroadai.com" actions={<ActionPanel><Action.OpenInBrowser url="https://blackroadai.com" /></ActionPanel>} />
        <List.Item icon={Icon.Eye} title="lucidia.earth" actions={<ActionPanel><Action.OpenInBrowser url="https://lucidia.earth" /></ActionPanel>} />
        <List.Item icon={Icon.Link} title="roadchain.io" actions={<ActionPanel><Action.OpenInBrowser url="https://roadchain.io" /></ActionPanel>} />
        <List.Item icon={Icon.Brush} title="brand.blackroad.io" actions={<ActionPanel><Action.OpenInBrowser url="https://brand.blackroad.io" /></ActionPanel>} />
        <List.Item icon={Icon.Building} title="blackroad.company" actions={<ActionPanel><Action.OpenInBrowser url="https://blackroad.company" /></ActionPanel>} />
      </List.Section>
    </List>
  );
}
