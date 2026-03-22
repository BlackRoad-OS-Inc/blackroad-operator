import { useMemo } from "react";
import { ALL_CAPABILITIES, Policy, summarizePolicy } from "@prism/core";

type PolicyDescriptor = {
  id: string;
  name: string;
  policy: Policy;
};

type PoliciesProps = {
  policies: PolicyDescriptor[];
  onModeChange?: (policyId: string, mode: Policy["mode"]) => void;
};

const MODE_LABEL: Record<Policy["mode"], string> = {
  playground: "Playground",
  dev: "Dev",
  trusted: "Trusted",
  prod: "Prod",
};

export default function Policies({ policies, onModeChange }: PoliciesProps) {
  const totals = useMemo(() => {
    const counters = new Map<Policy["mode"], number>();
    for (const descriptor of policies) {
      counters.set(descriptor.policy.mode, (counters.get(descriptor.policy.mode) ?? 0) + 1);
    }
    return counters;
  }, [policies]);

  return (
    <div className="policies-panel">
      <header className="policies-panel__header">
        <h3>Policy Modes</h3>
        <ul>
          {Array.from(totals.entries()).map(([mode, count]) => (
            <li key={mode} aria-label={`${mode}-count`}>
              {MODE_LABEL[mode]} &mdash; {count}
            </li>
          ))}
        </ul>
      </header>
      <table className="policies-table">
        <thead>
          <tr>
            <th scope="col">Policy</th>
            <th scope="col">Mode</th>
            {ALL_CAPABILITIES.map((capability) => (
              <th key={capability} scope="col">
                {capability.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {policies.map(({ id, name, policy }) => {
            const summary = summarizePolicy(policy);
            return (
              <tr key={id}>
                <th scope="row">{name}</th>
                <td>
                  <select
                    aria-label={`${name}-mode`}
                    value={policy.mode}
                    onChange={(event) => onModeChange?.(id, event.target.value as Policy["mode"]) }
                  >
                    {Object.entries(MODE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                {ALL_CAPABILITIES.map((capability) => (
                  <td key={capability} data-decision={summary[capability]}>
                    {summary[capability]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
