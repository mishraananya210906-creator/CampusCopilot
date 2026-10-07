import React, { useState, useEffect } from 'react';
import { NebiusSettingsModal } from './components/NebiusSettingsModal';
import { StudyAssistant } from './components/StudyAssistant';
import { NotesToAI } from './components/NotesToAI';
import { StudyPlanner } from './components/StudyPlanner';
import { QuizMode } from './components/QuizMode';
import { 
  Sparkles, FileText, Calendar, Award, Cpu, Settings, 
  TrendingUp, Zap, BookOpen, Layers, Image as ImageIcon,
  ChevronRight, ShieldCheck, GraduationCap
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'study' | 'notes' | 'planner' | 'quiz'>('study');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [lastModel, setLastModel] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [quizTopic, setQuizTopic] = useState('');
  const [currentSubject, setCurrentSubject] = useState('Multivariable Calculus');
  
  // High-Resolution Atmospheric Backgrounds with Crisp White/Neutral Overlays
  const backgrounds = [
    {
      id: 'gothic-library',
      name: 'Grand University Library',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80',
      tint: 'from-black/85 via-[#0b0d17]/95 to-[#07080f]'
    },
    {
      id: 'classic-hall',
      name: 'Oxford Academic Hall',
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80',
      tint: 'from-black/85 via-[#0c0e18]/95 to-[#07080f]'
    },
    {
      id: 'study-desk',
      name: 'Architectural Study Space',
      url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=2000&q=80',
      tint: 'from-black/85 via-[#0c0e18]/95 to-[#07080f]'
    },
    {
      id: 'night-stars',
      name: 'Cosmic Intelligence',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
      tint: 'from-black/85 via-[#0c0e18]/95 to-[#07080f]'
    }
  ];
  const [activeBg, setActiveBg] = useState(backgrounds[0]);

  const subjects = [
    { name: 'Multivariable Calculus', icon: '📐', code: 'MATH 201' },
    { name: 'Data Structures & Algorithms', icon: '💻', code: 'CS 210' },
    { name: 'Engineering Physics & E&M', icon: '⚛️', code: 'PHYS 150' },
    { name: 'Probability & Statistics', icon: '📊', code: 'STAT 300' },
    { name: 'Organic Chemistry', icon: '🧬', code: 'CHEM 220' },
  ];

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.log('Backend not connected or starting up...');
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleModelResponse = (data: any) => {
    if (data && data.tier) {
      setLastModel({
        tier: data.tier,
        model_name: data.model_name || data.model,
        latency_ms: data.latency_ms || 350,
        tokens: data.tokens || 150,
        simulated: data.simulated || false,
      });
      fetchMetrics();
    }
  };

  const handleSaveApiKey = async (newKey: string) => {
    setApiKey(newKey);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: newKey }),
      });
      fetchMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchQuiz = (topic: string) => {
    setQuizTopic(topic);
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen relative flex bg-[#07080f] text-white font-sans selection:bg-white selection:text-black">
      {/* Background Photography with Neutral Contrast Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 opacity-20 scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${activeBg.url})` }}
      />
      <div className={`fixed inset-0 z-0 bg-gradient-to-b ${activeBg.tint} pointer-events-none backdrop-blur-[2px]`} />

      {/* LEFT SIDEBAR NAVIGATION WITH CRISP WHITE ACCENTS */}
      <aside className="w-72 shrink-0 border-r border-white/10 bg-[#0b0d18]/90 backdrop-blur-2xl z-20 flex flex-col justify-between hidden lg:flex sticky top-0 h-screen shadow-2xl">
        <div className="p-5 space-y-6 overflow-y-auto no-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-white p-[1px] shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0c16] rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-extrabold text-xl tracking-tight text-white">
                  Campus<span className="text-white">Copilot</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Nebius Token Factory Edition</p>
            </div>
          </div>

          {/* Quick Subject Selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <BookOpen className="w-3.5 h-3.5 text-white" /> Active Course
            </span>
            <div className="space-y-1">
              {subjects.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSubject(sub.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    currentSubject === sub.name
                      ? 'bg-white text-slate-950 font-bold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{sub.icon}</span>
                    <span className="truncate">{sub.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono shrink-0 ${currentSubject === sub.name ? 'opacity-80' : 'opacity-50'}`}>
                    {sub.code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary 4 Features Navigation */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Layers className="w-3.5 h-3.5 text-white" /> Copilot Tools
            </span>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('study')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs transition-all group ${
                  activeTab === 'study'
                    ? 'bg-white text-slate-950 font-bold shadow-xl'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'study' ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-medium">1. AI Study Assistant</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${activeTab === 'study' ? 'bg-black/15 text-black font-bold' : 'bg-white/10 text-slate-300'}`}>
                  Nano
                </span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs transition-all group ${
                  activeTab === 'notes'
                    ? 'bg-white text-slate-950 font-bold shadow-xl'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'notes' ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-medium">2. Notes → AI</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${activeTab === 'notes' ? 'bg-black/15 text-black font-bold' : 'bg-white/10 text-slate-300'}`}>
                  PDF
                </span>
              </button>

              <button
                onClick={() => setActiveTab('planner')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs transition-all group ${
                  activeTab === 'planner'
                    ? 'bg-white text-slate-950 font-bold shadow-xl'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'planner' ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-medium">3. Study Planner</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${activeTab === 'planner' ? 'bg-black/15 text-black font-bold' : 'bg-white/10 text-slate-300'}`}>
                  Ultra
                </span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs transition-all group ${
                  activeTab === 'quiz'
                    ? 'bg-white text-slate-950 font-bold shadow-xl'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${activeTab === 'quiz' ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="font-medium">4. Quiz & Viva Mode</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${activeTab === 'quiz' ? 'bg-black/15 text-black font-bold' : 'bg-white/10 text-slate-300'}`}>
                  Grading
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* NEBIUS TOKEN FACTORY TELEMETRY WITH CRISP WHITE LABELS */}
        <div className="p-4 border-t border-white/10 bg-[#090b14]/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-white" /> Nebius Telemetry
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Configure Nebius API Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Tier:</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {lastModel ? lastModel.model_name : 'Nemotron Ready'}
              </span>
            </div>
            {metrics && (
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
                <span className="text-slate-400">Tokens Saved:</span>
                <span className="font-bold text-white flex items-center gap-1 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  {metrics.estimated_savings_percentage}%
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN STAGE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/10 bg-[#0b0d18]/70 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-white" />
              <span className="font-display font-bold text-base text-white">CampusCopilot</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <span className="font-bold text-white">{currentSubject}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-white/80 font-medium capitalize">
                {activeTab === 'study' ? 'AI Concept Explainer' : activeTab === 'notes' ? 'Notes & PDF Ingestion' : activeTab === 'planner' ? 'Day-by-Day Exam Blueprint' : 'Interactive Quiz & Grading'}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Wallpaper Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/15 rounded-full px-3 py-1.5 text-xs text-white">
              <ImageIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-slate-400 mr-1">Wallpaper:</span>
              <select
                value={activeBg.id}
                onChange={(e) => {
                  const found = backgrounds.find(b => b.id === e.target.value);
                  if (found) setActiveBg(found);
                }}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1"
              >
                {backgrounds.map(bg => (
                  <option key={bg.id} value={bg.id} className="bg-slate-900 text-white">
                    {bg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Pill */}
            {lastModel ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-white font-mono shadow-md">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span className="font-bold">{lastModel.model_name}</span>
                <span className="text-slate-300">({lastModel.latency_ms}ms)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Nebius Token Factory Ready</span>
              </div>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
              title="Configure Nebius Token Factory"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-b border-white/10 bg-[#0b0d18]/90 p-2 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'study', label: '1. Assistant', icon: Sparkles },
            { id: 'notes', label: '2. Notes', icon: FileText },
            { id: 'planner', label: '3. Planner', icon: Calendar },
            { id: 'quiz', label: '4. Quiz', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-white text-slate-950' : 'text-slate-300 bg-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Workspace Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
          {activeTab === 'study' && (
            <StudyAssistant
              onModelResponse={handleModelResponse}
              onLaunchQuiz={handleLaunchQuiz}
            />
          )}

          {activeTab === 'notes' && (
            <NotesToAI onModelResponse={handleModelResponse} />
          )}

          {activeTab === 'planner' && (
            <StudyPlanner onModelResponse={handleModelResponse} />
          )}

          {activeTab === 'quiz' && (
            <QuizMode
              initialTopic={quizTopic}
              onModelResponse={handleModelResponse}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#07080f]/90 py-5 px-6 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-white" />
              <span>
                Powered by <strong className="text-white">Nebius Token Factory</strong> & NVIDIA Nemotron Models
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Multi-Tier Smart Routing (Nano, Super, Ultra)
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <NebiusSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
        metrics={metrics}
      />
    </div>
  );
}
