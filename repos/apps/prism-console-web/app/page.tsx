'use client';
import { OverviewContent } from '~components/OverviewContent';

import { useState, useEffect } from 'react';
import { AgentCard } from '../components/agent-card';
import { TaskSubmission } from '../components/task-submission';
import { fetchAgents, fetchAgentDetails, type Agent, type AgentDetails } from '../lib/api';

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskSubmission, setShowTaskSubmission] = useState(false);
import { AgentTable } from "~components/AgentTable";
import { MetricCard } from "~components/MetricCard";
import { ShortcutGrid } from "~components/ShortcutGrid";
import { Skeleton } from "~components/Skeleton";
import { useAgents } from "~hooks/useAgents";
import { useDashboard } from "~hooks/useDashboard";

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchQuery, statusFilter]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await fetchAgents();
      setAgents(data.agents);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    setFilteredAgents(filtered);
  };

  const handleAgentSelect = async (agentId: string) => {
    try {
      const details = await fetchAgentDetails(agentId);
      setSelectedAgent(details);
      setShowTaskSubmission(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">BlackRoad Prism Console</h1>
          <p className="text-gray-400">Agent orchestration and task management</p>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-800 rounded p-3">
              <div className="text-2xl font-bold">{agents.length}</div>
              <div className="text-xs text-gray-400">Total Agents</div>
            </div>
            <div className="bg-green-900 rounded p-3">
              <div className="text-2xl font-bold">{statusCounts.online || 0}</div>
              <div className="text-xs text-green-200">Online</div>
            </div>
            <div className="bg-gray-800 rounded p-3">
              <div className="text-2xl font-bold">{statusCounts.offline || 0}</div>
              <div className="text-xs text-gray-400">Offline</div>
            </div>
            <div className="bg-yellow-900 rounded p-3">
              <div className="text-2xl font-bold">{statusCounts.starting || 0}</div>
              <div className="text-xs text-yellow-200">Starting</div>
            </div>
            <div className="bg-red-900 rounded p-3">
              <div className="text-2xl font-bold">{statusCounts.error || 0}</div>
              <div className="text-xs text-red-200">Error</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search agents by name, description, or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-64 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="starting">Starting</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={loadAgents}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            Loading agents...
          </div>
        )}

        {/* Agent Grid */}
        {!loading && filteredAgents.length > 0 && (
          <>
            <div className="mb-4 text-gray-400 text-sm">
              Showing {filteredAgents.length} of {agents.length} agents
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={handleAgentSelect}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && filteredAgents.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No agents found matching your criteria
          </div>
        )}
      </main>

      {/* Task Submission Modal */}
      {showTaskSubmission && selectedAgent && (
        <TaskSubmission
          agent={selectedAgent}
          onClose={() => {
            setShowTaskSubmission(false);
            setSelectedAgent(null);
          }}
        />
      )}
    </div>
  );
}
