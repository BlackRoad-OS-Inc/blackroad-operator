"use client";

import { ReactNode } from "react";
import Modal from "./Modal";
import {
  usePreferencesStore,
  type ClockType,
  type ClockFormat,
} from "@/stores/preferencesStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
}: SettingsModalProps): ReactNode {
  const clockType = usePreferencesStore((s) => s.clockType);
  const clockFormat = usePreferencesStore((s) => s.clockFormat);
  const autoFollowNewSessions = usePreferencesStore(
    (s) => s.autoFollowNewSessions,
  );
  const setClockType = usePreferencesStore((s) => s.setClockType);
  const setClockFormat = usePreferencesStore((s) => s.setClockFormat);
  const setAutoFollowNewSessions = usePreferencesStore(
    (s) => s.setAutoFollowNewSessions,
  );

  const handleClockTypeChange = (type: ClockType) => {
    setClockType(type);
  };

  const handleClockFormatChange = (format: ClockFormat) => {
    setClockFormat(format);
  };

  const handleAutoFollowToggle = () => {
    setAutoFollowNewSessions(!autoFollowNewSessions);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        {/* Clock Type */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
            Clock Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleClockTypeChange("analog")}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm font-bold transition-colors ${
                clockType === "analog"
                  ? "bg-purple-500/20 border-purple-500 text-purple-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              Analog
            </button>
            <button
              onClick={() => handleClockTypeChange("digital")}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm font-bold transition-colors ${
                clockType === "digital"
                  ? "bg-purple-500/20 border-purple-500 text-purple-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              Digital
            </button>
          </div>
        </div>

        {/* Time Format - only visible when digital */}
        {clockType === "digital" && (
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
              Time Format
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleClockFormatChange("12h")}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-bold transition-colors ${
                  clockFormat === "12h"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                12-hour
              </button>
              <button
                onClick={() => handleClockFormatChange("24h")}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-bold transition-colors ${
                  clockFormat === "24h"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                24-hour
              </button>
            </div>
          </div>
        )}

        {/* Session Settings */}
        <div className="pt-4 border-t border-slate-800">
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
            Session Behavior
          </label>
          <div
            role="button"
            tabIndex={0}
            onClick={handleAutoFollowToggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleAutoFollowToggle();
              }
            }}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div>
              <p className="text-slate-300 text-sm font-medium">
                Auto-follow new sessions
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Automatically switch to new sessions in the current project
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full relative transition-colors ${
                autoFollowNewSessions ? "bg-purple-500" : "bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                  autoFollowNewSessions ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-slate-500 text-xs">
            Tip: Click the clock in the office to quickly cycle between modes.
          </p>
        </div>
      </div>
    </Modal>
  );
}
