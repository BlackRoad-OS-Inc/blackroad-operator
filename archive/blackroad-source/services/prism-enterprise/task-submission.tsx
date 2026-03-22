'use client';

import { useState } from 'react';
import type { AgentDetails, Task } from '../lib/api';
import { submitTask, fetchTask } from '../lib/api';

interface TaskSubmissionProps {
  agent: AgentDetails;
  onClose: () => void;
}

export function TaskSubmission({ agent, onClose }: TaskSubmissionProps) {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTask, setSubmittedTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await submitTask(agent.manifest.agent_id, {
        task: task.trim(),
        priority,
        timeout_ms: 30000
      });

      // Poll for results
      const taskId = response.task_id;
      const pollInterval = setInterval(async () => {
        try {
          const taskStatus = await fetchTask(taskId);
          setSubmittedTask(taskStatus);

          if (['completed', 'failed', 'timeout'].includes(taskStatus.status)) {
            clearInterval(pollInterval);
            setSubmitting(false);
          }
        } catch (err) {
          console.error('Failed to poll task:', err);
          clearInterval(pollInterval);
          setSubmitting(false);
        }
      }, 1000);

    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Submit Task to {agent.manifest.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Description
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              rows={4}
              placeholder="Describe the task for this agent to perform..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {submittedTask && (
            <div className="p-4 bg-gray-800 border border-gray-700 rounded">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Task Status</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  submittedTask.status === 'completed' ? 'bg-green-900 text-green-200' :
                  submittedTask.status === 'failed' ? 'bg-red-900 text-red-200' :
                  submittedTask.status === 'running' ? 'bg-blue-900 text-blue-200' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {submittedTask.status}
                </span>
              </div>
              {submittedTask.result && (
                <pre className="text-xs text-gray-300 overflow-auto mt-2">
                  {JSON.stringify(submittedTask.result, null, 2)}
                </pre>
              )}
              {submittedTask.error && (
                <div className="text-xs text-red-300 mt-2">
                  Error: {submittedTask.error}
                </div>
              )}
              {submittedTask.execution_time_ms && (
                <div className="text-xs text-gray-400 mt-2">
                  Execution time: {submittedTask.execution_time_ms}ms
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !task.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Executing...' : 'Submit Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
