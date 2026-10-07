import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, Sparkles, HelpCircle, ArrowRight, RefreshCw, PenTool, Check } from 'lucide-react';

interface QuizModeProps {
  initialTopic?: string;
  onModelResponse: (data: any) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ initialTopic = '', onModelResponse }) => {
  const [topic, setTopic] = useState(initialTopic || 'Partial Derivatives & Multivariable Calculus');
  const [quizType, setQuizType] = useState<'mcq' | 'subjective'>('mcq');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [id: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  // Subjective / Professor Evaluation state
  const [subjectiveQuestion, setSubjectiveQuestion] = useState(
    "Explain why the order of mixed second-order partial derivatives f_xy and f_yx can be interchanged, and state Clairaut's Theorem assumptions."
  );
  const [studentWrittenAnswer, setStudentWrittenAnswer] = useState(
    "Clairaut's theorem states that f_xy = f_yx if both derivatives exist and are continuous in a neighborhood around the point. If there is a jump discontinuity, they might differ."
  );
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleGenerateQuestions = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          question_count: 5,
          quiz_type: 'mcq',
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      onModelResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correct_index) {
        score += 1;
      }
    });
    return score;
  };

  const handleEvaluateWrittenAnswer = async () => {
    if (!studentWrittenAnswer.trim()) return;
    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: subjectiveQuestion,
          user_answer: studentWrittenAnswer,
          topic: topic,
        }),
      });
      const data = await res.json();
      setEvaluationResult(data);
      onModelResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Visual Card with White & Platinum Styling */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#0e111a]/90 backdrop-blur-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e111a] via-[#0e111a]/95 to-transparent pointer-events-none" />

        <div className="relative p-6 sm:p-10 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20 flex items-center gap-2 shadow-sm">
              <Award className="w-4 h-4 text-white" />
              Feature 4 — Quiz & Viva Mode
            </span>
            <span className="text-xs text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              Academic Scoring & AI Evaluation
            </span>
          </div>

          <div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Interactive Examination & Professor Grading
            </h2>
            <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              AI generates exam questions $\to$ you submit your answers $\to$ Nemotron evaluates your answer with rigorous scoring rubrics and model A+ solutions.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <button
              onClick={() => setQuizType('mcq')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                quizType === 'mcq'
                  ? 'bg-white text-slate-950 shadow-xl'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Mode A: Multiple Choice Quiz (MCQ)
            </button>
            <button
              onClick={() => setQuizType('subjective')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                quizType === 'subjective'
                  ? 'bg-white text-slate-950 shadow-xl'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Mode B: Written Viva & Professor Evaluation
            </button>
          </div>
        </div>
      </div>

      {/* Mode A: MCQ Quiz */}
      {quizType === 'mcq' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/15 bg-[#0e111a]/90 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-5 shadow-xl">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                Topic for Quiz
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Partial Derivatives, Linked Lists, Quantum Mechanics"
                className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 focus:border-white rounded-2xl px-5 py-4 sm:py-5 text-base sm:text-lg text-white focus:outline-none font-bold transition-all"
              />
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={loading || !topic.trim()}
              className="flex items-center gap-2.5 px-8 py-4 sm:py-5 rounded-2xl bg-white hover:bg-slate-200 text-slate-950 text-sm font-extrabold shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? <span className="animate-spin">🌀</span> : <RefreshCw className="w-5 h-5 text-slate-950" />}
              {loading ? 'Generating 5 Questions...' : 'Generate 5 Quiz Questions'}
            </button>
          </div>

          {/* Empty State */}
          {questions.length === 0 && !loading && (
            <div className="rounded-3xl border border-white/10 bg-[#0e111a]/50 p-12 text-center space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="font-display font-bold text-lg text-white">No active quiz questions yet</h3>
              <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Click "Generate 5 Quiz Questions" above to have Nemotron construct a practice exam on this topic.
              </p>
              <button
                onClick={handleGenerateQuestions}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-lg hover:bg-slate-200"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                Generate Sample Calculus Quiz
              </button>
            </div>
          )}

          {/* Question List */}
          {questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((q, qIndex) => {
                const selected = userAnswers[q.id];
                const isCorrect = selected === q.correct_index;

                return (
                  <div
                    key={q.id || qIndex}
                    className="rounded-3xl border border-white/15 bg-[#0e111a]/90 p-6 sm:p-8 space-y-5 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-slate-950 bg-white px-3.5 py-1.5 rounded-xl shrink-0 font-mono">
                        Question {qIndex + 1}
                      </span>
                      <h4 className="text-base font-bold text-white flex-1 leading-relaxed">
                        {q.question}
                      </h4>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {q.options?.map((opt: string, optIdx: number) => {
                        let optStyle = "bg-white/5 border-white/15 text-slate-200 hover:border-white/40 hover:bg-white/10";

                        if (selected === optIdx) {
                          optStyle = "bg-white text-slate-950 font-bold border-white shadow-lg";
                        }

                        if (showResults) {
                          if (optIdx === q.correct_index) {
                            optStyle = "bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold";
                          } else if (selected === optIdx) {
                            optStyle = "bg-red-500/30 border-red-400 text-red-200";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            disabled={showResults}
                            className={`flex items-center gap-3.5 p-4 rounded-2xl border text-xs sm:text-sm text-left transition-all ${optStyle}`}
                          >
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${selected === optIdx ? 'bg-slate-900 text-white border-transparent' : 'bg-white/10 border-white/20'}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {showResults && optIdx === q.correct_index && (
                              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                            )}
                            {showResults && selected === optIdx && optIdx !== q.correct_index && (
                              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showResults && (
                      <div className="mt-3 p-5 rounded-2xl bg-white/5 border border-white/15 text-xs sm:text-sm space-y-2">
                        <div className="font-bold text-white flex items-center gap-2">
                          {isCorrect ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4" /> Correct Answer!
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1.5">
                              <XCircle className="w-4 h-4" /> Incorrect
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit Quiz Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e111a]/90 border border-white/20 shadow-xl">
                {showResults ? (
                  <div className="flex items-center gap-3">
                    <div className="text-base font-bold text-white">
                      Your Final Score:{' '}
                      <span className="text-white text-2xl font-display font-extrabold ml-1">
                        {calculateScore()} / {questions.length}
                      </span>{' '}
                      ({Math.round((calculateScore() / questions.length) * 100)}%)
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-300 font-medium">
                    {Object.keys(userAnswers).length} of {questions.length} questions answered
                  </div>
                )}

                <div className="flex gap-3">
                  {!showResults ? (
                    <button
                      onClick={() => setShowResults(true)}
                      disabled={Object.keys(userAnswers).length === 0}
                      className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-sm transition-all shadow-xl disabled:opacity-50"
                    >
                      Submit & Grade Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateQuestions}
                      className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-colors border border-white/20"
                    >
                      Retake / New Questions
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Written Viva & Professor Evaluation with BIGGER INPUTS */}
      {quizType === 'subjective' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/15 bg-[#0e111a]/90 p-6 sm:p-10 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PenTool className="w-4 h-4 text-white" /> Professor Oral & Written Exam Question
              </span>
              <span className="text-xs px-3.5 py-1 rounded-full bg-white/10 text-white border border-white/20 font-mono font-bold">
                Nemotron 3 Ultra (550B)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Exam Question:
              </label>
              <textarea
                rows={2}
                value={subjectiveQuestion}
                onChange={(e) => setSubjectiveQuestion(e.target.value)}
                className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/20 focus:border-white rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-white font-bold focus:outline-none transition-all"
              />
            </div>

            {/* BIGGER WRITTEN ANSWER TEXTAREA */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Your Written Answer:
              </label>
              <textarea
                rows={8}
                value={studentWrittenAnswer}
                onChange={(e) => setStudentWrittenAnswer(e.target.value)}
                placeholder="Type your explanation or derivation here..."
                className="w-full bg-[#080b18]/90 border-2 border-white/20 hover:border-white/30 focus:border-white rounded-2xl p-5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none font-sans leading-relaxed transition-all shadow-inner"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleEvaluateWrittenAnswer}
                disabled={evaluating || !studentWrittenAnswer.trim()}
                className="flex items-center gap-2.5 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white hover:bg-slate-200 text-slate-950 text-sm sm:text-base font-extrabold shadow-2xl transition-all disabled:opacity-50"
              >
                {evaluating ? <span className="animate-spin">🌀</span> : <Sparkles className="w-5 h-5 text-slate-950" />}
                {evaluating ? 'Professor is Grading Your Answer...' : 'Submit for Professor Evaluation'}
              </button>
            </div>
          </div>

          {/* Evaluation Results */}
          {evaluationResult && (
            <div className="rounded-3xl border border-white/20 bg-[#0e111a]/95 backdrop-blur-2xl p-6 sm:p-10 space-y-5 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-white" />
                  <h3 className="font-display font-bold text-2xl text-white">Professor Rubric & Evaluation</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-mono font-bold">
                    {evaluationResult.model_name}
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  ⚡ {evaluationResult.latency_ms}ms • {evaluationResult.tokens} tokens
                </span>
              </div>

              <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans space-y-4">
                {evaluationResult.content}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
