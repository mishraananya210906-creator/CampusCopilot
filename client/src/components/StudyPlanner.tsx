import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Sparkles, BookOpen, ChevronRight, Copy, Check, BarChart, Target } from 'lucide-react';

interface StudyPlannerProps {
  onModelResponse: (data: any) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ onModelResponse }) => {
  const [subject, setSubject] = useState('Calculus');
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [currentLevel, setCurrentLevel] = useState('moderate');
  const [topics, setTopics] = useState('Limits, Derivatives, Integrals, Multivariable, Differential Equations');
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const presets = [
    { subject: "Calculus", days: 7, hours: 3, label: "Calculus Exam in 7 Days" },
    { subject: "Data Structures & Algorithms", days: 5, hours: 4, label: "DSA Finals in 5 Days" },
    { subject: "Engineering Physics", days: 3, hours: 4, label: "Physics in 3 Days (Sprint)" },
    { subject: "Operating Systems", days: 10, hours: 2.5, label: "Operating Systems in 10 Days" }
  ];

  const handleGeneratePlan = async (customSubject?: string, customDays?: number) => {
    const s = customSubject || subject;
    const d = customDays || daysRemaining;
    if (!s.trim()) return;

    setLoading(true);
    setPlanResult(null);
    setCompletedDays([]);

    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: s,
          days_remaining: d,
          hours_per_day: hoursPerDay,
          current_level: currentLevel,
          topics: topics
        }),
      });
      const data = await res.json();
      setPlanResult(data);
      onModelResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDayCompletion = (dayNum: number) => {
    setCompletedDays(prev =>
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  const handleCopy = () => {
    if (planResult?.content) {
      navigator.clipboard.writeText(planResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Visual Card with White & Platinum Styling */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#0e111a]/90 backdrop-blur-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e111a] via-[#0e111a]/95 to-transparent pointer-events-none" />

        <div className="relative p-6 sm:p-10 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20 flex items-center gap-2 shadow-sm">
              <Calendar className="w-4 h-4 text-white" />
              Feature 3 — Study Planner
            </span>
            <span className="text-xs text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              Nemotron 3 Ultra (550B Deep Reasoning)
            </span>
          </div>

          <div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Autonomous Day-by-Day Exam Blueprint
            </h2>
            <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Say: <span className="text-white font-bold underline decoration-white/40">"I have Calculus exam in 7 days"</span>. Nemotron 3 Ultra synthesizes your syllabus, available hours, and spaced repetition milestones into a realistic, high-scoring study schedule.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-xs text-slate-300 font-semibold">Quick Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSubject(p.subject);
                  setDaysRemaining(p.days);
                  setHoursPerDay(p.hours);
                  handleGeneratePlan(p.subject, p.days);
                }}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/40 text-white transition-all shadow-sm font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Card with BIGGER INPUTS */}
      <div className="rounded-3xl border border-white/15 bg-[#0e111a]/90 p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Exam Subject / Course
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Calculus, Microeconomics, Chemistry"
              className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 focus:border-white rounded-2xl px-5 py-4 sm:py-5 text-base sm:text-lg text-white placeholder:text-slate-400 focus:outline-none font-bold transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Days Remaining
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={60}
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(parseInt(e.target.value) || 1)}
                className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 focus:border-white rounded-2xl px-5 py-4 sm:py-5 text-base sm:text-lg text-white focus:outline-none font-bold transition-all"
              />
              <span className="text-sm text-slate-300 font-bold shrink-0">days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
              Daily Study Hours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                min={1}
                max={12}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 1)}
                className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 focus:border-white rounded-2xl px-5 py-4 sm:py-5 text-base sm:text-lg text-white focus:outline-none font-bold transition-all"
              />
              <span className="text-sm text-slate-300 font-bold shrink-0">hrs/day</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
            Target Topics or Syllabus Modules
          </label>
          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g. Unit 1: Vectors, Unit 2: Multiple Integrals, Unit 3: Vector Calculus"
            className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 focus:border-white rounded-2xl px-5 py-4 text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Level:</span>
            <div className="inline-flex p-1 bg-white/5 rounded-xl border border-white/15 text-xs">
              {(['beginner', 'moderate', 'revision'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCurrentLevel(lvl)}
                  className={`px-4 py-2 rounded-lg capitalize font-bold transition-all ${
                    currentLevel === lvl
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* BIGGER ACTION BUTTON */}
          <button
            onClick={() => handleGeneratePlan()}
            disabled={loading || !subject.trim()}
            className="flex items-center gap-2.5 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white hover:bg-slate-200 text-slate-950 text-sm sm:text-base font-extrabold shadow-2xl transition-all disabled:opacity-50"
          >
            {loading ? <span className="animate-spin">🌀</span> : <Sparkles className="w-5 h-5 text-slate-950" />}
            {loading ? 'Synthesizing Optimal Schedule...' : 'Generate Day-by-Day Blueprint'}
          </button>
        </div>
      </div>

      {/* Plan Results */}
      {planResult && (
        <div className="rounded-3xl border border-white/20 bg-[#0e111a]/95 backdrop-blur-2xl p-6 sm:p-10 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white" />
                <h3 className="font-display font-bold text-2xl text-white">
                  {subject} — {daysRemaining}-Day Master Plan
                </h3>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-mono font-bold">
                  {planResult.model_name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {hoursPerDay} hrs/day • {daysRemaining * hoursPerDay} Total Study Hours Planned
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                ⚡ {planResult.latency_ms}ms • {planResult.tokens} tokens
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Plan'}
              </button>
            </div>
          </div>

          {/* Interactive Checklist & Progress Tracker */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Your Study Schedule Progress
              </span>
              <span className="text-white font-mono font-bold">
                {completedDays.length} of {daysRemaining} Days Completed (
                {Math.round((completedDays.length / daysRemaining) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedDays.length / daysRemaining) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {Array.from({ length: daysRemaining }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => toggleDayCompletion(day)}
                  className={`text-xs px-4 py-2 rounded-xl border transition-all font-bold ${
                    completedDays.includes(day)
                      ? 'bg-white text-slate-950 border-white shadow-md'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Day {day} {completedDays.includes(day) ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Formatted Content */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans space-y-4">
            {planResult.content}
          </div>
        </div>
      )}
    </div>
  );
};
