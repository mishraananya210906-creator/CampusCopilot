# 🎓 CampusCopilot — AI College Copilot

> **Best Apps & Agents Track** | Powered by **Nebius Token Factory** & **NVIDIA Nemotron**

CampusCopilot is an all-in-one AI College Copilot designed for university students to excel in coursework, engineering labs, notes synthesis, and exam preparation.

---

## 🚀 Key Features (The 4 Pillars)

### 💡 Feature 1 — AI Study Assistant
- **What it does:** Students enter a concept like *"Explain partial derivatives"*, *"What is dynamic programming?"*, or *"Eigenvalues intuition"*.
- **Multi-Tier Model Routing:**
  - ⚡ **Beginner-Friendly:** Handled by **Nemotron 3 Nano** (~300ms, intuitive real-world analogies).
  - 🎯 **Exam-Ready:** Handled by **Nemotron 3 Super** (step-by-step problem templates and exam grading criteria).
  - 🧠 **Rigorous Proof:** Escalated to **Nemotron 3 Ultra (550B)** (formal mathematical definitions and theoretical mechanics).
- **Direct Link to Quiz:** "Test My Understanding in Quiz Mode" one-click button.

### 📄 Feature 2 — Notes → AI
- **What it does:** Upload lecture PDFs or paste raw notes/slides.
- **Instant AI Actions:**
  - 📖 **"Explain this topic":** Synthesizes notes into core principles and mental models.
  - ❓ **"Give me 10 questions from these notes":** Extracts 5 conceptual, 3 derivation, and 2 critical exam questions with professor answer keys.
  - 🎯 **"What are the important topics?":** Identifies high-yield topics ranked by professor exam probability (%).
  - 💬 **Freeform Q&A:** Ask any custom question directly against the uploaded notes.

### 📅 Feature 3 — Study Planner
- **What it does:** Student says: *"I have Calculus exam in 7 days"*.
- **Autonomous Blueprint:**
  - Powered by **Nemotron 3 Ultra** for deep planning reasoning.
  - Generates a day-by-day exam roadmap with morning/afternoon study blocks, problem quotas, and daily milestones.
  - **Interactive Progress Bar & Daily Checklist:** Students check off days as they complete their study sessions.

### 🎯 Feature 4 — Quiz Mode & Professor Evaluation
- **Mode A: Multiple Choice Quiz (MCQ):**
  - Generates 5 tailored college-level questions.
  - Interactive radio selections, instant explanations, and scoring percentage.
- **Mode B: Written Viva & Professor Evaluation:**
  - Presents challenging exam questions.
  - Student types their written response.
  - Evaluated by **Nemotron 3 Ultra** using a strict academic grading rubric: Score / 10, Letter Grade, Strengths, Lost Marks, and Model A+ answer.

---

## ⚡ Nebius Token Factory Model Tiering Architecture

CampusCopilot implements smart tiered model routing to maximize performance while minimizing cost:

| Tier | Model | Speed / Latency | Relative Compute Cost | Role in CampusCopilot |
| :--- | :--- | :--- | :--- | :--- |
| **Fast** | `nvidia/nemotron-3-nano` | ~300ms | 95% Cheaper | Fast concept explanations, notes triage, hints |
| **Balanced** | `nvidia/nemotron-3-super` | ~650ms | 75% Cheaper | High-yield topics, 10 questions generation, MCQ quiz |
| **Deep Reasoning** | `nvidia/nemotron-3-ultra` | ~1400ms | Flagship 550B | Complex math proofs, day-by-day study plans, viva grading |

### Live Token Savings Gauge
The top navigation bar displays a live **Token Savings Meter**, showing how much latency and tokens are saved by routing routine queries to Nano/Super instead of calling Ultra for everything.

---

## 🛠️ Quick Start Guide

### 1. Backend Setup
```bash
cd server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs on http://localhost:8000*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend runs on http://localhost:5173*

### 3. Or Launch Both Together (Windows PowerShell)
```powershell
.\start.ps1
```

### 4. Configure Nebius API Key
Click the ⚙️ icon in the top right of the UI or edit `server/.env`:
```env
NEBIUS_API_KEY=your_key_here
NEBIUS_API_BASE=https://api.tokenfactory.nebius.com/v1
```
*(If no API key is set, CampusCopilot seamlessly uses the built-in Intelligent Engine for instant offline evaluation).*
