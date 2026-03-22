'use client';

import type { Agent } from '../lib/api';

interface AgentCardProps {
  agent: Agent;
  onSelect: (agentId: string) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    starting: 'bg-yellow-500',
    stopping: 'bg-orange-500',
    error: 'bg-red-500'
  };

  return (
    <div
      className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer bg-gray-900"
      onClick={() => onSelect(agent.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
          <span className="text-xs text-gray-400 capitalize">{agent.status}</span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{agent.description}</p>

      <div className="flex flex-wrap gap-1 mb-2">
        {agent.capabilities.slice(0, 3).map((cap) => (
          <span
            key={cap}
            className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded"
          >
            {cap.replace(/_/g, ' ')}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded">
            +{agent.capabilities.length - 3} more
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500">
        ID: {agent.id}
      </div>
    </div>
  );
}
