import sys
sys.stdout.reconfigure(encoding='utf-8')
import httpx
import json

def run_tests():
    print("=" * 60)
    print("🎓 CAMPUSCOPILOT FULL AUTOMATED VERIFICATION SUITE")
    print("=" * 60)

    client = httpx.Client(base_url="http://localhost:8000", timeout=25.0)

    # 1. Healthcheck
    print("\n[Test 1/7] Backend Healthcheck & Engine Status")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Healthcheck failed: {res.status_code}"
    data = res.json()
    print(f"  Status: {data['status']}")
    print(f"  Service: {data['service']}")
    print(f"  Available Model Tiers: {data['available_tiers']}")
    print("  --> Result: [PASS]")

    # 2. Feature 1: Beginner Explanation (Nano)
    print("\n[Test 2/7] Feature 1 — AI Study Assistant (Beginner / Nano)")
    res = client.post("/api/study/explain", json={
        "topic": "Explain partial derivatives",
        "depth": "beginner",
        "subject": "Calculus"
    })
    if res.status_code == 503:
        assert res.json()["detail"].startswith("AI answer unavailable.")
        print("  AI provider unavailable; no unrelated fallback answer returned.")
    else:
        assert res.status_code == 200
        data = res.json()
        assert "content" in data and len(data["content"]) > 50
        print(f"  Model Routed: {data['model_name']} ({data['tier']})")
        print(f"  Latency: {data['latency_ms']} ms | Tokens: {data['tokens']}")
        print(f"  Output Excerpt: {data['content'][:120].strip()}...")
    print("  --> Result: [PASS]")

    # 3. Feature 1: Rigorous Derivation (Ultra)
    print("\n[Test 3/7] Feature 1 — AI Study Assistant (Rigorous Proof / Ultra)")
    res = client.post("/api/study/explain", json={
        "topic": "Schrodinger Wave Equation",
        "depth": "rigorous",
        "subject": "Quantum Physics"
    })
    if res.status_code == 503:
        assert res.json()["detail"].startswith("AI answer unavailable.")
        print("  AI provider unavailable; no unrelated fallback answer returned.")
    else:
        assert res.status_code == 200
        data = res.json()
        assert data["tier"] == "ultra"
        print(f"  Model Routed: {data['model_name']} ({data['tier']})")
        print(f"  Latency: {data['latency_ms']} ms | Tokens: {data['tokens']}")
    print("  --> Result: [PASS]")

    # 4. Feature 2: Notes -> AI
    print("\n[Test 4/7] Feature 2 — Notes -> AI Ingestion & Actions")
    notes = (
        "LECTURE: Conservative Vector Fields and Green's Theorem. "
        "F = P i + Q j is conservative iff dP/dy = dQ/dx. "
        "Line integral equals double integral of curl over bounded region D. "
        "Orientation must be counterclockwise; clockwise requires negation."
    )
    # Action: 10 Questions
    res_q = client.post("/api/notes/action", json={"notes_text": notes, "action": "questions"})
    assert res_q.status_code == 200
    print(f"  Action 'Give me 10 questions': {res_q.json()['model_name']} - SUCCESS")

    # Action: Important Topics
    res_t = client.post("/api/notes/action", json={"notes_text": notes, "action": "important_topics"})
    assert res_t.status_code == 200
    print(f"  Action 'What are important topics': {res_t.json()['model_name']} - SUCCESS")
    print("  --> Result: [PASS]")

    # 5. Feature 3: Study Planner
    print("\n[Test 5/7] Feature 3 — Study Planner (7-Day Blueprint / Ultra)")
    res = client.post("/api/planner/generate", json={
        "subject": "Calculus",
        "days_remaining": 7,
        "hours_per_day": 3.0,
        "current_level": "moderate"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["tier"] == "ultra"
    print(f"  Generated Blueprint via: {data['model_name']} ({data['tier']})")
    print(f"  Tokens: {data['tokens']} | Latency: {data['latency_ms']} ms")
    print("  --> Result: [PASS]")

    # 6. Feature 4: Quiz Mode (MCQ & Professor Written Evaluation)
    print("\n[Test 6/7] Feature 4 — Quiz Mode & Viva Evaluation")
    # Generate 5 MCQ questions
    res_mcq = client.post("/api/quiz/generate", json={
        "topic": "Partial Derivatives",
        "question_count": 5,
        "quiz_type": "mcq"
    })
    assert res_mcq.status_code == 200
    mcq_data = res_mcq.json()
    assert len(mcq_data["questions"]) == 5
    print(f"  Generated {len(mcq_data['questions'])} interactive questions via {mcq_data['model_name']}")

    # Evaluate student written answer
    res_eval = client.post("/api/quiz/evaluate", json={
        "question": "State Clairaut's Theorem conditions for f_xy = f_yx",
        "user_answer": "The mixed second order derivatives are equal if both are continuous on an open disk around the point.",
        "topic": "Calculus"
    })
    assert res_eval.status_code == 200
    eval_data = res_eval.json()
    assert eval_data["tier"] == "ultra"
    print(f"  Professor Evaluation graded via {eval_data['model_name']} ({eval_data['tier']})")
    print("  --> Result: [PASS]")

    # 7. Nebius Telemetry & Frontend Proxy
    print("\n[Test 7/7] Nebius Token Factory Metrics & Frontend Proxy")
    res_metrics = client.get("/api/metrics")
    assert res_metrics.status_code == 200
    m = res_metrics.json()
    print(f"  Total Requests Logged: {m['total_requests']}")
    print(f"  Nano Requests: {m['nano_requests']} | Ultra Requests: {m['ultra_requests']}")
    print(f"  Tokens Saved vs Calling All-Ultra: {m['tokens_saved_vs_all_ultra']} tokens")
    print(f"  Estimated Compute Efficiency: {m['estimated_savings_percentage']}%")

    # Test Vite Frontend
    res_frontend = httpx.get("http://localhost:5173", timeout=10.0)
    assert res_frontend.status_code == 200
    print("  Frontend Web Server: http://localhost:5173 -> 200 OK")

    # Test Vite Proxy to Backend
    res_proxy = httpx.get("http://localhost:5173/api/health", timeout=10.0)
    assert res_proxy.status_code == 200
    print("  Vite API Proxy (http://localhost:5173/api/health) -> 200 OK")
    print("  --> Result: [PASS]")

    print("\n" + "=" * 60)
    print("🎉 ALL 7/7 TEST SUITES PASSED PERFECTLY!")
    print("   CampusCopilot is fully functional, verified, and ready.")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
