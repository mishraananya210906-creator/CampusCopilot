import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

interface NebiusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  metrics: any;
}

export const NebiusSettingsModal: React.FC<NebiusSettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  metrics
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput);
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Nebius Token Factory</h2>
            <p className="text-xs text-slate-400">Model Tiering & API Configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Zap className="w-4 h-4" />
              <span>Multi-Tier NVIDIA Nemotron Routing</span>
            </div>
            <p>
              Calls are automatically tiered across models on Nebius Token Factory:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong className="text-slate-200">Nemotron 3 Nano:</strong> Fast everyday explanations, notes extraction (~300ms, 95% cheaper)</li>
              <li><strong className="text-slate-200">Nemotron 3 Super:</strong> Balanced exam questions & high-yield topics (120B)</li>
              <li><strong className="text-slate-200">Nemotron 3 Ultra:</strong> Serious reasoning, mathematical proofs, study planning & grading (550B)</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nebius Token Factory API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="Enter Nebius API Key (optional for demo mode)"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Leave blank to use the high-fidelity Nebius Simulation Engine for offline testing.
            </p>
          </div>

          {metrics && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Total Requests</span>
                <span className="text-base font-bold text-white">{metrics.total_requests || 0}</span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl">
                <span className="text-[11px] text-emerald-400/80 block">Tokens Saved</span>
                <span className="text-base font-bold text-emerald-400">{metrics.tokens_saved_vs_all_ultra || 0}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {savedStatus ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
