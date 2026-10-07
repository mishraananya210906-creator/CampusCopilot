import React from 'react';
import { GraduationCap, Cpu, Zap, Settings, TrendingUp } from 'lucide-react';

interface NebiusHeaderProps {
  lastModel: {
    tier: string;
    model_name: string;
    latency_ms: number;
    tokens: number;
    simulated: boolean;
  } | null;
  metrics: {
    total_requests: number;
    tokens_saved_vs_all_ultra: number;
    avg_latency_ms: number;
    estimated_savings_percentage: number;
  } | null;
  onOpenSettings: () => void;
}

export const NebiusHeader: React.FC<NebiusHeaderProps> = ({
  lastModel,
  metrics,
  onOpenSettings
}) => {
  const getBadge = () => {
    if (!lastModel) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Nebius Token Factory Ready</span>
        </div>
      );
    }

    if (lastModel.tier === 'ultra') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/50 text-xs text-purple-200 shadow-sm shadow-purple-900/50 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="font-semibold">🧠 Nemotron 3 Ultra (550B Reasoning)</span>
          <span className="text-[10px] text-purple-300/80">({lastModel.latency_ms}ms)</span>
        </div>
      );
    } else if (lastModel.tier === 'super') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/50 text-xs text-blue-200 shadow-sm shadow-blue-900/50">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="font-semibold">🚀 Nemotron 3 Super (Balanced)</span>
          <span className="text-[10px] text-blue-300/80">({lastModel.latency_ms}ms)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 shadow-sm shadow-emerald-900/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold">⚡ Nemotron 3 Nano (Fast Everyday)</span>
          <span className="text-[10px] text-emerald-300/80">({lastModel.latency_ms}ms)</span>
        </div>
      );
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Copilot</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Nebius Token Factory
              </span>
            </div>
            <p className="text-xs text-slate-400">AI College Copilot • Powered by NVIDIA Nemotron</p>
          </div>
        </div>

        {/* Live Router & Savings */}
        <div className="flex items-center gap-3">
          {getBadge()}

          {metrics && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong className="text-emerald-400">{metrics.estimated_savings_percentage}%</strong> Tokens Saved
              </span>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            title="Configure Nebius Token Factory"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
