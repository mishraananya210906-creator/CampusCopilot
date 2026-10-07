import os
import json
import re
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from nebius_client import nebius_client, metrics_store, MODEL_TIERS
from pdf_parser import extract_text_from_pdf_bytes, truncate_for_context

app = FastAPI(
    title="CampusCopilot API - Powered by Nebius Token Factory",
    description="Autonomous AI College Copilot powered by NVIDIA Nemotron models on Nebius Token Factory",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request / Response Models -----------------

class StudyRequest(BaseModel):
    topic: str
    depth: str = "beginner"  # "beginner", "exam_ready", "rigorous"
    subject: Optional[str] = "General"

class NotesActionRequest(BaseModel):
    notes_text: str
    action: str  # "explain", "questions", "important_topics", "ask"
    query: Optional[str] = None

class PlannerRequest(BaseModel):
    subject: str
    days_remaining: int = 7
    hours_per_day: float = 3.0
    current_level: str = "moderate"
    topics: Optional[str] = None

class QuizGenerateRequest(BaseModel):
    topic: str
    question_count: int = 5
    quiz_type: str = "mcq"  # "mcq" or "short_answer"
    notes_text: Optional[str] = None

class QuizEvaluateRequest(BaseModel):
    question: str
    user_answer: str
    topic: str

class SettingsRequest(BaseModel):
    api_key: str
    base_url: Optional[str] = None

# ----------------- Routes -----------------

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "CampusCopilot API",
        "nebius_connected": bool(nebius_client.api_key),
        "available_tiers": list(MODEL_TIERS.keys())
    }

@app.get("/api/metrics")
def get_metrics():
    return metrics_store.to_dict()

@app.post("/api/settings")
def update_settings(req: SettingsRequest):
    nebius_client.update_key(req.api_key)
    if req.base_url:
        nebius_client.base_url = req.base_url
    return {
        "success": True,
        "message": "Nebius Token Factory credentials updated successfully",
        "base_url": nebius_client.base_url
    }

# ----------------- Feature 1: AI Study Assistant -----------------

@app.post("/api/study/explain")
async def explain_topic(req: StudyRequest):
    # Route model tier:
    # Beginner / Fast explanation -> Nemotron 3 Nano / Super
    # Rigorous / Proof -> Nemotron 3 Ultra (for serious reasoning)
    if req.depth == "rigorous":
        tier = "ultra"
        system_prompt = (
            "You are an elite university professor and mathematician/scientist. Provide a rigorous, "
            "deeply detailed academic explanation with formal definitions, mathematical proofs/derivations, "
            "and theoretical mechanics. Assume the student is preparing for an advanced college examination."
        )
    elif req.depth == "exam_ready":
        tier = "super"
        system_prompt = (
            "You are an expert college tutor. Provide a high-yield, exam-oriented breakdown. "
            "Focus on how questions on this topic appear on college finals, step-by-step problem-solving templates, "
            "and scoring rubrics."
        )
    else:
        tier = "nano"
        system_prompt = (
            "You are a friendly, brilliant college peer tutor. Provide a crystal-clear, beginner-friendly explanation. "
            "Use an intuitive real-world analogy first, followed by the core concept, an easy step-by-step example, "
            "and the top 2 pitfalls college students make."
        )

    user_prompt = f"Topic to explain: {req.topic}\nSubject/Course: {req.subject}\nLevel: {req.depth}"

    # Rich fallback if API key is not yet set
    fallback = f"""### 💡 The Intuition & Analogy
Think of **{req.topic}** like adjusting the temperature on a dual-control shower. If you have two knobs—one for hot water ($x$) and one for cold water ($y$)—the total temperature depends on both. 
When you adjust *only* the hot water knob while keeping the cold water knob completely fixed, you are measuring how the temperature changes with respect to hot water alone. That rate of change is a **partial derivative**!

---

### 📐 Core Concept & Formulation
In multivariable calculus, for a function $f(x, y)$:
- The partial derivative with respect to $x$, denoted $\\frac{{\\partial f}}{{\\partial x}}$ or $f_x$, measures the instantaneous rate of change of $f$ as $x$ varies while $y$ is held constant.
- Formally:
$$\\frac{{\\partial f}}{{\\partial x}} = \\lim_{{h \\to 0}} \\frac{{f(x+h, y) - f(x, y)}}{{h}}$$

---

### 🔍 Step-by-Step College Problem
**Problem:** Find $\\frac{{\\partial f}}{{\\partial x}}$ and $\\frac{{\\partial f}}{{\\partial y}}$ for $f(x, y) = 3x^2y + 4xy^3 - 7x + 2$.

1. **Differentiating with respect to $x$ (Treat $y$ as a constant number like 5):**
   - Term $3x^2y \\to \\frac{{d}}{{dx}}[3x^2] \\cdot y = 6xy$
   - Term $4xy^3 \\to 4y^3 \\cdot \\frac{{d}}{{dx}}[x] = 4y^3$
   - Term $-7x \\to -7$
   - Constant $+2 \\to 0$
   $$\\frac{{\\partial f}}{{\\partial x}} = 6xy + 4y^3 - 7$$

2. **Differentiating with respect to $y$ (Treat $x$ as a constant):**
   - Term $3x^2y \\to 3x^2 \\cdot 1 = 3x^2$
   - Term $4xy^3 \\to 4x \\cdot 3y^2 = 12xy^2$
   - Term $-7x \\to 0$
   - Constant $+2 \\to 0$
   $$\\frac{{\\partial f}}{{\\partial y}} = 3x^2 + 12xy^2$$

---

### ⚠️ Top 2 College Exam Pitfalls
1. **Forgetting to hold variables constant:** Don't use the product rule between $x$ and $y$ unless both are functions of a third variable $t$. Treat $y$ purely as a constant number.
2. **Chain Rule Slip-ups:** When differentiating composite functions like $\\sin(xy)$ with respect to $x$, remember the inner derivative gives an extra factor of $y$: $\\frac{{\\partial}}{{\\partial x}}[\\sin(xy)] = y\\cos(xy)$.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    result = await nebius_client.call_nemotron(
        tier=tier,
        messages=messages,
        fallback_content=fallback
    )
    return result

# ----------------- Feature 2: Notes -> AI -----------------

@app.post("/api/notes/upload")
async def upload_notes(file: Optional[UploadFile] = File(None), raw_text: Optional[str] = Form(None)):
    extracted = ""
    filename = "Pasted Notes"
    if file:
        filename = file.filename
        content = await file.read()
        if filename.lower().endswith(".pdf"):
            extracted = extract_text_from_pdf_bytes(content)
        else:
            extracted = content.decode("utf-8", errors="ignore")
    elif raw_text:
        extracted = raw_text

    if not extracted.strip():
        raise HTTPException(status_code=400, detail="No readable text found in upload.")

    preview = extracted[:500] + ("..." if len(extracted) > 500 else "")
    return {
        "success": True,
        "filename": filename,
        "char_count": len(extracted),
        "word_count": len(extracted.split()),
        "preview": preview,
        "full_text": extracted
    }

@app.post("/api/notes/action")
async def perform_notes_action(req: NotesActionRequest):
    notes_sample = truncate_for_context(req.notes_text, max_chars=8000)

    if req.action == "questions":
        tier = "super"
        prompt = (
            f"Here are college lecture/textbook notes:\n```\n{notes_sample}\n```\n\n"
            "Generate exactly 10 high-yield college exam questions based on these notes. "
            "Include a mix of conceptual (5), calculation/derivation/practical (3), and critical analysis (2) questions. "
            "For each question, provide a brief answer key / what a college professor looks for."
        )
        fallback = """### 📝 10 High-Yield Exam Questions from Notes

#### Part A: Core Conceptual Questions (5 Marks Each)
1. **Define the fundamental principle highlighted in Section 1 and explain its physical/theoretical significance.**
   * *Professor's Scoring Key:* Award 2 marks for standard definition, 3 marks for boundary conditions and assumptions.
2. **Explain the key differences between the primary and secondary mechanisms described in the notes.**
   * *Professor's Scoring Key:* Look for comparison table or distinct comparative bullet points.
3. **What are the primary assumptions underlying this derivation, and when do they break down in practice?**
   * *Professor's Scoring Key:* Must mention linearity and steady-state conditions.
4. **State the governing law and describe how each parameter affects the final outcome.**
   * *Professor's Scoring Key:* Clear identification of independent vs dependent variables.
5. **How does this concept interconnect with prerequisite topics from earlier in the semester?**
   * *Professor's Scoring Key:* Demonstration of holistic course understanding.

---

#### Part B: Numerical & Analytical Problems (10 Marks Each)
6. **Given standard initial parameters, derive the equilibrium state step-by-step.**
   * *Professor's Scoring Key:* Full intermediate algebra required; correct units carry 2 marks.
7. **If the input parameter is doubled while constraints remain constant, calculate the percentage shift in output.**
   * *Professor's Scoring Key:* Proportionality argument or explicit ratio formula.
8. **Identify the edge case where the denominator approaches zero and state the mathematical remedy.**
   * *Professor's Scoring Key:* Application of L'Hôpital's Rule or perturbation analysis.

---

#### Part C: Critical Thinking & Exam Edge Cases (15 Marks Each)
9. **Critique the methodology presented in these notes: what are its modern limitations?**
   * *Professor's Scoring Key:* Points for referencing computational overhead or non-ideal constraints.
10. **Formulate a real-world engineering or scientific scenario where this model fails to predict the observed data.**
    * *Professor's Scoring Key:* Real-world application example showing critical scientific evaluation.
"""

    elif req.action == "important_topics":
        tier = "nano"
        prompt = (
            f"Analyze these college notes and identify the most important topics:\n```\n{notes_sample}\n```\n\n"
            "List the Top 5 High-Yield Exam Topics. For each, give:\n"
            "1. Topic Title\n2. Exam Probability (%)\n3. Why professors test it\n4. Key formulas or definitions to memorize."
        )
        fallback = """### 🎯 Top 5 High-Yield Exam Topics from Notes

1. **Foundational Theorems & Governing Equations** (Exam Probability: **95%**)
   - **Why Professors Test It:** Tests whether students understand the underlying bedrock before applying formulas.
   - **Key Focus:** Exact mathematical statements, domain constraints, and proof sketches.

2. **Equilibrium States & Boundary Conditions** (Exam Probability: **88%**)
   - **Why Professors Test It:** Separates students who memorize from those who understand practical edge cases.
   - **Key Focus:** What happens as $t \\to \\infty$ or at boundary limits ($x=0, x=L$).

3. **Multi-Step Analytical Problem Solving** (Exam Probability: **82%**)
   - **Why Professors Test It:** Standard long-answer 10-mark question format in semester finals.
   - **Key Focus:** Standard substitution patterns and conservation laws.

4. **Comparative Analysis of Competing Methods** (Exam Probability: **70%**)
   - **Why Professors Test It:** Frequent 5-mark short answer question; tests conceptual clarity.
   - **Key Focus:** Efficiency trade-offs, assumptions, and complexity analysis.

5. **Common Fallacies & Edge Cases** (Exam Probability: **65%**)
   - **Why Professors Test It:** Used as "distractor" questions to differentiate A vs B grades.
   - **Key Focus:** Division-by-zero traps, invalid unit conversions, and sign conventions.
"""

    elif req.action == "explain":
        tier = "super"
        prompt = (
            f"Synthesize and clearly explain the core contents of these college notes:\n```\n{notes_sample}\n```\n\n"
            "Provide an executive student summary: Core concepts, formulas, and a mental framework to master them."
        )
        fallback = f"""### 📚 Comprehensive Notes Synthesis

#### 1. Core Summary & Big Picture
These notes focus on foundational analytical principles. The central thesis is that complex systems can be decomposed into governing differential or algebraic relations by isolating orthogonal components.

#### 2. Key Frameworks & Formulas
- **Primary Governing Relation:** $\\mathcal{{F}}(x, y, t) = \\sum_{{i=1}}^N \\alpha_i \\cdot \\phi_i(x)$
- **Conservation Condition:** $\\nabla \\cdot \\mathbf{{J}} + \\frac{{\\partial \\rho}}{{\\partial t}} = 0$
- **Steady-State Simplification:** When $\\frac{{\\partial}}{{\\partial t}} \\to 0$, the equations simplify to linear boundary-value problems.

#### 3. Mental Model for Finals
- **Step 1:** Identify the system boundaries and degrees of freedom.
- **Step 2:** Write down the constitutive equations before substituting numerical values.
- **Step 3:** Sanity check units and asymptotic behavior before finalizing your solution.
"""

    else:  # Custom student question
        tier = "ultra" if any(w in (req.query or "").lower() for w in ["prove", "derive", "why", "complex", "proof"]) else "nano"
        prompt = f"Based on these notes:\n```\n{notes_sample}\n```\n\nStudent Question: {req.query}"
        fallback = f"Based on your notes, here is the direct answer to '{req.query}':\n\nThe notes explain that this relationship is governed by the underlying balance equations. You should treat the primary terms as independent variables and verify the boundary conditions."

    messages = [
        {"role": "system", "content": "You are CampusCopilot, an expert college academic tutor powered by Nebius Nemotron."},
        {"role": "user", "content": prompt}
    ]

    result = await nebius_client.call_nemotron(
        tier=tier,
        messages=messages,
        fallback_content=fallback
    )
    return result

# ----------------- Feature 3: Study Planner -----------------

@app.post("/api/planner/generate")
async def generate_study_plan(req: PlannerRequest):
    # Generating a custom day-by-day exam roadmap requires serious reasoning -> Nemotron 3 Ultra
    tier = "ultra"
    prompt = (
        f"Create an optimal day-by-day study plan for a college student:\n"
        f"- Subject: {req.subject}\n"
        f"- Days Until Exam: {req.days_remaining} days\n"
        f"- Available Time: {req.hours_per_day} hours/day\n"
        f"- Current Preparation Level: {req.current_level}\n"
        f"- Specific Topics/Syllabus: {req.topics or 'Standard college curriculum for this subject'}\n\n"
        "Generate a structured day-by-day breakdown from Day 1 to Day {req.days_remaining}. "
        "For each day include: Focus Theme, Morning/Afternoon study blocks, targeted practice problem count, "
        "and a daily milestone mastery checkpoint."
    )

    fallback = f"""### 📅 {req.days_remaining}-Day Mastery Blueprint for {req.subject}
**Strategy:** High-Yield Spaced Repetition | **Commitment:** {req.hours_per_day} Hours/Day | **Level:** {req.current_level.capitalize()}

---

#### 📌 Phase 1: Foundation & High-Yield Core (Days 1–{max(1, req.days_remaining // 3)})
* **Day 1: Diagnostic Assessment & Core Definitions**
  - *Block 1 (1.5 hrs):* Review syllabus, list all major theorems and formulas on a single cheat sheet.
  - *Block 2 (1.5 hrs):* Work through 8 fundamental textbook examples with solutions hidden.
  - *Target:* 8 problems solved. Milestone: Zero hesitation on foundational terminology.

* **Day 2: Primary Governing Techniques & Derivations**
  - *Block 1 (1.5 hrs):* Active derivation of the top 3 most frequently tested formulas on scratch paper.
  - *Block 2 (1.5 hrs):* Solve 10 medium-difficulty problems focusing on algebraic accuracy.
  - *Target:* 10 problems solved. Milestone: Reproduce derivations from memory.

---

#### 📌 Phase 2: Medium-Hard Problem Sets & Edge Cases (Days {max(2, req.days_remaining // 3 + 1)}–{max(2, req.days_remaining - 2)})
* **Day 3: Multivariable Interactions & Application Problems**
  - *Block 1 (1.5 hrs):* Deep dive into multi-step problems that combine two or more chapters.
  - *Block 2 (1.5 hrs):* Timed 45-minute sprint on 5 complex problem sets.
  - *Target:* 12 problems solved. Milestone: Solving problems without looking at formula sheet.

* **Day 4: Common Professor Traps & Edge Cases**
  - *Block 1 (1.5 hrs):* Review mistakes from Days 1-3 in an "Error Log".
  - *Block 2 (1.5 hrs):* Attack past exam questions specifically rated "Difficult".
  - *Target:* 8 hard problems. Milestone: Identify trick questions before starting work.

* **Day 5: Past Papers & Timed Simulation I**
  - *Block 1 (2.0 hrs):* Full mock exam under strict 2-hour timed conditions (no distractions).
  - *Block 2 (1.0 hr):* Rigorous grading using answer key; note all lost marks.
  - *Target:* 1 Full Mock Exam. Milestone: Score $\\ge 75\\%$.

---

#### 📌 Phase 3: Final Polish & Peak Performance (Days {max(3, req.days_remaining - 1)}–{req.days_remaining})
* **Day 6: Targeted Gap Remediation & Mock II**
  - *Block 1 (1.5 hrs):* Laser focus exclusively on concepts where marks were lost on Day 5.
  - *Block 2 (1.5 hrs):* Flashcard blitz: recite definitions and limits aloud.
  - *Target:* Remediation complete. Milestone: Confidence on all 5 predicted exam topics.

* **Day 7: Light Review & Mental Priming (Pre-Exam Day)**
  - *Block 1 (1.5 hrs):* Slow review of your 1-page formula summary sheet.
  - *Block 2 (1.0 hr):* Solve 3 warm-up problems to maintain mental sharpness. Rest early!
  - *Milestone:* Formula sheet memorized, stationery ready, full 8 hours sleep scheduled.
"""

    messages = [
        {"role": "system", "content": "You are a master academic strategist and study planner powered by Nebius Nemotron 3 Ultra."},
        {"role": "user", "content": prompt}
    ]

    result = await nebius_client.call_nemotron(
        tier=tier,
        messages=messages,
        fallback_content=fallback
    )
    return result

# ----------------- Feature 4: Quiz Mode & Evaluation -----------------

@app.post("/api/quiz/generate")
async def generate_quiz(req: QuizGenerateRequest):
    # Quiz generation -> Nemotron 3 Super
    tier = "super"
    prompt = (
        f"Generate a college-level quiz for testing student knowledge:\n"
        f"- Topic: {req.topic}\n"
        f"- Question Count: {req.question_count}\n"
        f"- Type: {req.quiz_type}\n\n"
        "Return a valid JSON object with a 'questions' array. Each item must have:\n"
        "id (int), question (string), options (array of 4 strings if mcq), correct_index (int if mcq), "
        "explanation (string), hint (string)."
    )

    fallback_questions = [
        {
            "id": 1,
            "question": f"When calculating the partial derivative of f(x, y) = 3x²y³ with respect to x, what is treated as a constant?",
            "options": ["The variable x", "The variable y", "Both x and y", "Neither x nor y"],
            "correct_index": 1,
            "explanation": "When taking the partial derivative with respect to x, all other independent variables (here y) are held strictly constant.",
            "hint": "Think about which variable you are differentiating with respect to."
        },
        {
            "id": 2,
            "question": f"What is the partial derivative ∂/∂x of f(x, y) = x³ + 5xy + y²?",
            "options": ["3x² + 5y", "3x² + 5x + 2y", "3x² + 5y + 2y", "x² + 5y"],
            "correct_index": 0,
            "explanation": "∂/∂x[x³] = 3x², ∂/∂x[5xy] = 5y(1) = 5y, and ∂/∂x[y²] = 0 since y is constant.",
            "hint": "Differentiate x terms normally and treat y terms without x as 0."
        },
        {
            "id": 3,
            "question": f"If z = sin(2x + 3y), what is ∂z/∂y?",
            "options": ["2cos(2x + 3y)", "3cos(2x + 3y)", "-3cos(2x + 3y)", "cos(3y)"],
            "correct_index": 1,
            "explanation": "By the chain rule: ∂z/∂y = cos(2x + 3y) · ∂/∂y[2x + 3y] = 3cos(2x + 3y).",
            "hint": "Remember the chain rule on the inside linear argument."
        },
        {
            "id": 4,
            "question": f"Clairaut's Theorem states that the mixed second partial derivatives f_xy and f_yx are equal provided that:",
            "options": ["The function is linear", "The partial derivatives are continuous on an open disk", "The function equals zero", "x and y are integers"],
            "correct_index": 1,
            "explanation": "Clairaut's Theorem (Schwarz's Theorem) requires that f_xy and f_yx be continuous on an open region containing the point.",
            "hint": "Continuity of the mixed derivatives is the key condition."
        },
        {
            "id": 5,
            "question": f"In physics and engineering, the gradient vector ∇f of a scalar function points in the direction of:",
            "options": ["Zero change", "Steepest descent", "Steepest ascent / maximum rate of increase", "Constant contour"],
            "correct_index": 2,
            "explanation": "The gradient vector ∇f points in the direction of greatest instantaneous rate of increase of f.",
            "hint": "Think about climbing a hill in the steepest possible direction."
        }
    ]

    messages = [
        {"role": "system", "content": "You are a university quiz generator. Respond with valid JSON only."},
        {"role": "user", "content": prompt}
    ]

    # Try calling Nebius
    result = await nebius_client.call_nemotron(
        tier=tier,
        messages=messages,
        fallback_content=json.dumps({"questions": fallback_questions})
    )

    try:
        # Extract json if in code blocks
        clean_content = result["content"].strip()
        if "```" in clean_content:
            clean_content = re.sub(r"```json|```", "", clean_content).strip()
        parsed = json.loads(clean_content)
        questions = parsed.get("questions", fallback_questions)
    except Exception:
        questions = fallback_questions

    return {
        "questions": questions,
        "model": result["model"],
        "model_name": result["model_name"],
        "tier": result["tier"],
        "latency_ms": result["latency_ms"],
        "tokens": result["tokens"],
        "simulated": result["simulated"]
    }

@app.post("/api/quiz/evaluate")
async def evaluate_student_answer(req: QuizEvaluateRequest):
    # Rigorous academic evaluation and feedback -> Nemotron 3 Ultra (Deep Reasoning)
    tier = "ultra"
    prompt = (
        f"You are a rigorous college professor grading a student's answer.\n"
        f"Question: {req.question}\n"
        f"Topic: {req.topic}\n"
        f"Student's Answer: {req.user_answer}\n\n"
        "Evaluate this answer thoroughly. Return a structured breakdown:\n"
        "1. Score (out of 10)\n"
        "2. Grade (A, B, C, D, or F)\n"
        "3. Strengths: What the student got right\n"
        "4. Gaps / Lost Marks: What was missed or mathematically imprecise\n"
        "5. Model A+ Answer: How to write the ideal response in a college exam"
    )

    fallback = f"""### 🎓 Professor's Evaluation & Score

#### 📊 Overall Score: **8.5 / 10** (Grade: **A-**)

---

#### ✅ Strengths & Key Concepts Covered
* You correctly identified the core principle and showed sound intuition.
* Your logic proceeds in a sequential, understandable manner.
* Key terminology was applied in the appropriate context.

#### ⚠️ Areas for Improvement & Lost Marks (-1.5)
* **Mathematical Precision:** Be careful to explicitly state domain assumptions (e.g. holding non-differentiating variables strictly constant or specifying continuity).
* **Boundary Considerations:** Mentioning edge cases or the limiting behavior elevates an answer from a standard 8 to an unquestionable 10.

---

#### 🌟 Model A+ College Exam Answer
> *"To address this problem with full academic rigor: first, we establish the governing relation and identify our independent variables. By holding all orthogonal dimensions constant, we apply the differential operator directly. This yields the exact rate of change, valid on all open regions where the partial derivatives remain continuous."*
"""

    messages = [
        {"role": "system", "content": "You are a university professor grading student exams with deep academic rigor."},
        {"role": "user", "content": prompt}
    ]

    result = await nebius_client.call_nemotron(
        tier=tier,
        messages=messages,
        fallback_content=fallback
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
