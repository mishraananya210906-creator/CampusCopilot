import React, { useState } from 'react';
import { Upload, FileText, Sparkles, HelpCircle, Target, BookOpen, Send, Check, Copy, Bookmark, Zap } from 'lucide-react';
import { AIResponse } from './AIResponse';

export const NotesToAI: React.FC = () => {
  const [notesText, setNotesText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const sampleNotes = `LECTURE NOTES: Multivariable Calculus & Partial Differential Equations
Module 4: Conservative Vector Fields and Green's Theorem

1. DEFINITION: Conservative Vector Fields
A vector field F(x, y) = P(x, y)i + Q(x, y)j is conservative if there exists a scalar potential function f(x, y) such that F = ∇f.
Condition for Conservatism: In an open, simply-connected domain D, F is conservative if and only if ∂P/∂y = ∂Q/∂x.
The quantity curl(F) = (∂Q/∂x - ∂P/∂y) measures rotational vorticity. If curl(F) = 0, the field is irrotational.

2. PATH INDEPENDENCE & LINE INTEGRALS
If F = ∇f is conservative, the fundamental theorem of line integrals states:
∫_C F · dr = f(r(B)) - f(r(A))
The work done in moving a particle from point A to B depends only on endpoints, not on the path chosen.
Corollary: The closed line integral ∮_C F · dr = 0 along any closed smooth curve C.

3. GREEN'S THEOREM (Circulation & Flux Form)
Let C be a positively oriented, piecewise smooth, simple closed curve in the plane, and let D be the region bounded by C.
If P and Q have continuous partial derivatives on an open region containing D, then:
∮_C (P dx + Q dy) = ∬_D (∂Q/∂x - ∂P/∂y) dA

Area Application of Green's Theorem:
Area(D) = 1/2 ∮_C (x dy - y dx)

4. COMMON COLLEGE EXAM TRAPS:
- Orientation: If C is traversed clockwise, you MUST negate the integral (∮ = -∬).
- Discontinuities: The theorem fails if the field has a singularity inside D (e.g., vortex field F = (-y/(x²+y²), x/(x²+y²))).
- Holes in domain: Must split into sub-domains or apply multiply-connected Green's Theorem.`;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/notes/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.full_text) {
        setNotesText(data.full_text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'explain' | 'questions' | 'important_topics' | 'ask') => {
    if (!notesText.trim()) return;

    setActionLoading(action);
    setResult(null);

    try {
      const res = await fetch('/api/notes/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes_text: notesText,
          action: action,
          query: customQuery
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Visual Banner with White & Platinum Styling */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#0e111a]/90 backdrop-blur-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e111a] via-[#0e111a]/95 to-transparent pointer-events-none" />

        <div className="relative p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20 flex items-center gap-2 shadow-sm">
              <FileText className="w-4 h-4 text-white" />
              Feature 2 — Notes → AI
            </span>
            <span className="text-xs text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              pypdf Extraction & Nemotron Engine
            </span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Transform Lecture Notes & PDFs into Exam Mastery
          </h2>
          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            Upload any PDF or paste raw slides. Nemotron will synthesize concepts, extract 10 high-yield exam questions, and identify the top topics professors are most likely to test.
          </p>
        </div>
      </div>

      {/* Dual Pane Studio: Left = Notes Input, Right = AI Actions & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Notes Source & Upload */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-white/15 bg-[#0e111a]/90 p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-white" />
                Upload PDF Notes or Paste Text
              </label>
              <button
                onClick={() => {
                  setNotesText(sampleNotes);
                  setFileName('Calculus_Green_Theorem_Notes.txt');
                }}
                className="text-xs text-white hover:underline font-bold transition-all bg-white/10 px-3 py-1 rounded-lg border border-white/20"
              >
                Load Sample Notes
              </button>
            </div>

            {/* Drag & Drop Box */}
            <div className="relative border-2 border-dashed border-white/20 hover:border-white rounded-2xl p-6 text-center transition-all bg-white/5 hover:bg-white/10 cursor-pointer group">
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-white">
                  {fileName ? fileName : 'Drop PDF or text notes here (or click to browse)'}
                </span>
                <span className="text-xs text-slate-400">PDF, TXT, MD supported</span>
              </div>
            </div>

            {/* Bigger Notes Textarea */}
            <div>
              <textarea
                rows={13}
                placeholder="Or paste your lecture slides, textbook excerpts, or handwritten transcripts here..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full bg-[#080b18]/90 border-2 border-white/15 hover:border-white/30 focus:border-white rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono leading-relaxed transition-all shadow-inner"
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1 font-mono">
                <span>{notesText ? `${notesText.split(/\s+/).length} words` : '0 words'}</span>
                <span>{notesText ? `${notesText.length} characters` : '0 characters'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Instant Action Buttons & Big Custom Q&A */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-white/15 bg-[#0e111a]/90 p-6 sm:p-8 space-y-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-white" />
              One-Click AI Power Actions
            </h3>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Action 1: Explain */}
              <button
                onClick={() => handleAction('explain')}
                disabled={!notesText.trim() || !!actionLoading}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/40 text-left transition-all group disabled:opacity-50 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-white transition-colors">"Explain this topic"</h4>
                    <p className="text-xs text-slate-300">Synthesize main concepts & key mental models</p>
                  </div>
                </div>
                {actionLoading === 'explain' && <span className="text-xs text-white animate-spin">🌀</span>}
              </button>

              {/* Action 2: 10 Questions */}
              <button
                onClick={() => handleAction('questions')}
                disabled={!notesText.trim() || !!actionLoading}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/40 text-left transition-all group disabled:opacity-50 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-white transition-colors">"Give me 10 questions from these notes"</h4>
                    <p className="text-xs text-slate-300">5 conceptual, 3 derivation, 2 critical exam problems</p>
                  </div>
                </div>
                {actionLoading === 'questions' && <span className="text-xs text-white animate-spin">🌀</span>}
              </button>

              {/* Action 3: Important Topics */}
              <button
                onClick={() => handleAction('important_topics')}
                disabled={!notesText.trim() || !!actionLoading}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/40 text-left transition-all group disabled:opacity-50 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-white transition-colors">"What are the important topics?"</h4>
                    <p className="text-xs text-slate-300">Ranked by professor exam probability (%)</p>
                  </div>
                </div>
                {actionLoading === 'important_topics' && <span className="text-xs text-white animate-spin">🌀</span>}
              </button>
            </div>

            {/* BIGGER Custom Question Box */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Ask a Specific Question About These Notes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. When does Green's Theorem fail according to these notes?"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAction('ask')}
                  className="flex-1 bg-white/5 hover:bg-white/10 border-2 border-white/20 focus:border-white rounded-2xl px-5 py-3.5 sm:py-4 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none font-sans transition-all"
                />
                <button
                  onClick={() => handleAction('ask')}
                  disabled={!customQuery.trim() || !notesText.trim() || !!actionLoading}
                  className="px-6 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-200 disabled:opacity-50 text-slate-950 font-bold transition-all flex items-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Results View */}
      {result && (
        <div className="rounded-3xl border border-white/20 bg-[#0e111a]/95 backdrop-blur-2xl p-6 sm:p-10 space-y-5 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="font-display font-bold text-xl text-white">AI Analysis & Notes Insights</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-mono font-semibold">
                {result.model_name}
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

          <AIResponse content={result.content} />
        </div>
      )}
    </div>
  );
};
