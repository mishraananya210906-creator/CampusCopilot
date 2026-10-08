import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, Brain, Zap, Copy, Check, ArrowRight, Lightbulb } from 'lucide-react';
import { AIResponse } from './AIResponse';

interface StudyAssistantProps {
  onLaunchQuiz: (topic: string) => void;
}

export const StudyAssistant: React.FC<StudyAssistantProps> = ({
  onLaunchQuiz
}) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'beginner' | 'exam_ready' | 'rigorous'>('beginner');
  const [subject, setSubject] = useState('Calculus & Higher Math');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const quickTopics = [
    { label: "Explain partial derivatives", subject: "Calculus", icon: "∂" },
    { label: "What is dynamic programming?", subject: "Computer Science", icon: "⚡" },
    { label: "Intuition behind Eigenvalues", subject: "Linear Algebra", icon: "λ" },
    { label: "Thermodynamics 2nd Law & Entropy", subject: "Physics", icon: "ΔS" },
    { label: "Bayes' Theorem with real intuition", subject: "Probability", icon: "P(A|B)" },
  ];

  const handleExplain = async (selectedTopic?: string, selectedDepth?: 'beginner' | 'exam_ready' | 'rigorous', selectedSubject?: string) => {
    const qTopic = selectedTopic || topic;
    const qDepth = selectedDepth || depth;
    const qSubject = selectedSubject || subject;
    if (!qTopic.trim()) return;

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch('/api/study/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: qTopic,
          depth: qDepth,
          subject: qSubject
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `AI request failed (${res.status}).`);
      }
      if (typeof data.content !== 'string') {
        throw new Error('The AI response did not include answer content.');
      }
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (response?.content) {
      navigator.clipboard.writeText(response.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Visual Card with Crisp White & Platinum Styling */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#0e111a]/90 backdrop-blur-2xl">
        {/* Subtle Thematic Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e111a] via-[#0e111a]/95 to-transparent pointer-events-none" />

        <div className="relative p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20 flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
              Feature 1 — AI Study Assistant
            </span>
            <span className="text-xs text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              NVIDIA Nemotron 3 Engine
            </span>
          </div>

          <div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Master Any College Concept in Seconds
            </h2>
            <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Enter any college lecture topic. Nemotron breaks it down with intuitive analogies, formal formulations, step-by-step problem templates, and scoring traps.
            </p>
          </div>

          {/* LARGE EXPANSIVE INPUT BOX */}
          <div className="space-y-4 pt-2">
            <div className="relative flex items-center">
              <Search className="w-6 h-6 sm:w-7 h-7 text-white/80 absolute left-5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Explain partial derivatives, What is dynamic programming?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 focus:border-white rounded-2xl pl-14 sm:pl-16 pr-44 py-5 sm:py-6 text-base sm:text-lg text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-xl font-sans"
              />
              <button
                onClick={() => handleExplain()}
                disabled={loading || !topic.trim()}
                className="absolute right-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 disabled:opacity-50 text-sm font-bold shadow-xl transition-all flex items-center gap-2"
              >
                {loading ? (
                  <span className="inline-block animate-spin mr-1">🌀</span>
                ) : (
                  <Sparkles className="w-4 h-4 text-slate-950" />
                )}
                {loading ? 'Thinking...' : 'Explain'}
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" /> Try Asking:
              </span>
              {quickTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(item.label);
                    setSubject(item.subject);
                    handleExplain(item.label, undefined, item.subject);
                  }}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/40 text-white transition-all flex items-center gap-2"
                >
                  <span className="font-mono text-white/70 font-bold">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Depth Selector with Crisp White Styling */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Depth Level:</span>
                <div className="inline-flex p-1 bg-white/5 rounded-xl border border-white/15 text-xs shadow-inner">
                  <button
                    onClick={() => setDepth('beginner')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                      depth === 'beginner'
                        ? 'bg-white text-slate-950 shadow-md font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Beginner-Friendly
                  </button>
                  <button
                    onClick={() => setDepth('exam_ready')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                      depth === 'exam_ready'
                        ? 'bg-white text-slate-950 shadow-md font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    Exam-Ready
                  </button>
                  <button
                    onClick={() => setDepth('rigorous')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                      depth === 'rigorous'
                        ? 'bg-white text-slate-950 shadow-md font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    Rigorous Proof
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span className="font-semibold text-slate-400">Model Tier:</span>
                <span className="font-mono px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-bold">
                  {depth === 'rigorous' ? 'Nemotron 3 Ultra (550B)' : depth === 'exam_ready' ? 'Nemotron 3 Super' : 'Nemotron 3 Nano (~300ms)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-3xl border border-white/10 bg-[#0e111a]/80 p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-white/10 rounded-lg w-1/3"></div>
          <div className="h-4 bg-white/5 rounded w-full"></div>
          <div className="h-4 bg-white/5 rounded w-5/6"></div>
          <div className="h-32 bg-white/5 rounded-2xl w-full"></div>
        </div>
      )}

      {/* Results View in Crisp White & Platinum Cards */}
      {response && !loading && (
        <div className="rounded-3xl border border-white/20 bg-[#0e111a]/95 backdrop-blur-2xl p-6 sm:p-10 space-y-6 shadow-2xl relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-white shadow-sm shadow-white"></span>
              <h3 className="font-display font-bold text-xl text-white capitalize">{topic || 'Concept Explanation'}</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-mono font-semibold">
                {response.model_name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <AIResponse content={response.content} />

          {/* Follow-up CTA */}
          <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              Ready to verify your understanding under exam conditions?
            </div>
            <button
              onClick={() => onLaunchQuiz(topic)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all"
            >
              <span>Test My Understanding in Quiz Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
