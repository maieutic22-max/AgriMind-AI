# 08. Testing Strategy & Quality Assurance — AgriMind AI

## Document Information
- **Project Name:** AgriMind AI
- **Document Version:** 2.0.0 (Architecture Finalization Specification)
- **Scope:** Complete Quality Assurance Strategy, RAG Evaluation, and 3D Performance Protocols
- **Target Audience:** All Team Members, QA Engineers, Evaluators, and AI Coding Agents

---

## 1. Quality Assurance Philosophy & Testing Pyramid

AgriMind AI enforces a rigorous multi-tier testing strategy combining automated code tests, 3D WebGL performance profiling on representative hardware, machine learning benchmark comparisons, RAG faithfulness evaluations, and farmer usability testing:

```text
               / \
              / UAT \             -> Field Usability Testing with Farmers & Extension Staff
             /-------\
            /  RAG &  \           -> RAG Evaluation (Faithfulness, Relevance, Abstention)
           /  Security \          -> OWASP Scans, JWT Tenant Isolation Checks
          /-------------\
         /  ML Benchmarks\        -> Multi-Task Model vs. Single-Task Baselines
        /-----------------\
       / 3D Perf Profiling \      -> WebGL Frame Rates, Memory Footprint, 2D Fallback
      /---------------------\
     / Integration & API Tests\   -> Pytest-HTTPX, OpenAPI Contract Verification
    /-------------------------\
   /        Unit Tests         \  -> Business Logic, Formulas (ETc, Profitability, Inventory)
  /-----------------------------\
```

---

## 2. Test Types & Coverage Matrix

| Test Layer | Tools / Frameworks | Scope of Coverage | Target Coverage | Lead Owner |
| :--- | :--- | :--- | :---: | :---: |
| **Backend Unit Testing** | `pytest`, `pytest-mock` | Service formulas ($ET_c$, profit math, inventory deductions). | $\ge 80\%$ | All Members |
| **API Contract Testing** | `httpx`, `pytest` | Pydantic schema validation, status codes, error envelopes. | $100\%$ of routes | All Members |
| **Database Testing** | `pytest`, `alembic` | Migrations, foreign key cascades, tenant isolation. | $100\%$ migrations | All Members |
| **Frontend Component Testing**| `Vitest`, `@testing-library/react` | React forms, user interactions, state transitions. | $\ge 70\%$ | All Members |
| **3D Digital Twin Profiling** | Three.js Profiler, Spector.js | Frame rates, WebGL memory leaks, draw calls, 2D fallback. | Hardware targets | Member 1 |
| **ML Model Evaluation** | `scikit-learn`, `xgboost` | Comparative benchmark: Multi-task vs. Single-task models. | Benchmark suite | Member 2 & 3 |
| **RAG Grounding & Safety** | Custom RAG evaluation harness | Retrieval relevance, faithfulness, citations, abstention. | $\ge 90\%$ faithfulness | Member 4 |
| **Security Auditing** | `bandit`, `OWASP ZAP` | SQL injection, CORS policy, secret leakage, auth bypass. | Zero high-vulns | All Members |
| **Farmer Usability Testing** | Structured user interviews | Vernacular voice, task completion rate, high-contrast UI. | 5+ pilot farmers | Full Team |

---

## 3. Digital Twin Performance Profiling Protocol (Member 1)

> [!IMPORTANT]
> **Performance Verification Mandate:**  
> The 3D Digital Twin must achieve measurable performance targets tested on **representative real-world hardware**, rather than relying on theoretical desktop assumptions.

### 3.1 Measurable Hardware Performance Targets

| Target Hardware | CPU / GPU Specification | Minimum Target FPS | Maximum WebGL Heap | Scene Complexity |
| :--- | :--- | :---: | :---: | :--- |
| **Desktop Workstation** | Discrete GPU (Nvidia/AMD) or Intel Iris Xe | $\ge 55\text{ FPS}$ | $\le 200\text{ MB}$ | 12 plots + buildings + 50 trees |
| **Standard Laptop** | Integrated Graphics (Intel UHD 620/630) | $\ge 45\text{ FPS}$ | $\le 150\text{ MB}$ | 12 plots + procedural crops |
| **Mid-Tier Android Mobile** | Snapdragon 680 / 720G (Adreno GPU) | $\ge 30\text{ FPS}$ | $\le 120\text{ MB}$ | 6 plots + low-poly crops |
| **Low-End / Budget Mobile**| MediaTek Helio G35 / Entry Hardware | $\ge 20\text{ FPS}$ *(or Fallback)* | $\le 80\text{ MB}$ | 3 plots + minimal meshes |

### 3.2 2D Fallback Triggering Conditions
The application automatically degrades to the **2D Canvas / SVG Map View** when:
1. The browser environment lacks WebGL 2.0 or hardware acceleration.
2. WebGL context creation fails (`webglcontextlost` event fires).
3. Frame rate drops below $20\text{ FPS}$ sustained over a 5-second sampling window.
4. Client device reports memory pressure or low-memory browser flags.

---

## 4. RAG Knowledge Evaluation Framework (Member 4)

Because AgriMind AI rejects unverifiable "zero hallucination" claims, all RAG knowledge responses must be audited against a six-metric evaluation framework:

| Metric | Evaluation Definition | Target Threshold | Validation Method |
| :--- | :--- | :---: | :--- |
| **1. Retrieval Relevance** | Proportion of retrieved chunks directly relevant to the farmer's agronomic query. | $\ge 85\%$ | Ground truth test queries with labeled relevant ICAR chunks. |
| **2. Answer Faithfulness** | Proportion of factual claims in the response that are strictly substantiated by retrieved context. | $\ge 90\%$ | Automated fact extraction matching against retrieved text. |
| **3. Citation Accuracy** | Every cited publication, chapter, or section actually contains the asserted advisory. | $100\%$ | Manual spot-checks and automated regex citation verification. |
| **4. Agricultural Correctness** | Agronomic safety of recommendations (e.g., correct chemical dosages, non-toxic advice). | $100\%$ | Agronomist review of top 50 critical advisory outputs. |
| **5. Unsupported Claims** | Frequency of generated claims lacking grounding in retrieved documents. | $\le 5\%$ | Fact-checking evaluator scoring ungrounded statements. |
| **6. Appropriate Abstention** | System correctly admits ignorance and abstains when retrieved evidence is insufficient. | $\ge 95\%$ | Out-of-domain and ungrounded query test suite. |

---

## 5. Disease Detection API Audit Protocol (Member 2)

Prior to production integration, Member 2 must execute and document the pre-implementation audit for the predecessor disease API:

```markdown
### Disease Detection API Audit Checklist (Status: Existing Integration – Pending Audit)
- [ ] **Provider & Endpoint URL:** Verify host server URL, IP, and SSL certificate validity.
- [ ] **Authentication Protocol:** Verify API key header, Bearer token, or open access status.
- [ ] **Input Format:** Verify supported image types (JPEG/PNG), maximum file size, and dimension constraints (e.g., 224x224).
- [ ] **Output Format:** Verify returned JSON structure: class label, confidence float, and advisory text.
- [ ] **Rate Limits & Quota:** Confirm requests-per-minute (RPM) limits and daily quotas.
- [ ] **Inference Latency:** Measure round-trip response time under standard network conditions (target: $\le 2.0\text{s}$).
- [ ] **Error Envelopes:** Verify server response on corrupt images, non-plant images, or oversized uploads.
- [ ] **Service Reliability:** Review historical uptime and fallback procedure in case of service outage.
- [ ] **Reusability Assessment:** Confirm whether the existing KisanSathi integration code can be reused directly as a FastAPI proxy client.
```

---

## 6. Standard Test Case Template

All test cases must use the following standardized structure:

```markdown
### Test Case ID: TC-[MODULE]-[NUMBER]
- **Module:** [Digital Twin / Crop Intelligence / Operations / AI Assistant]
- **Target Deliverable:** [Deliverable ID, e.g., D01, D11, D19, D27]
- **Owner:** [Member 1 / 2 / 3 / 4]
- **Test Title:** [Brief description of test scenario]
- **Preconditions:** [Required database seeds, active JWT token, or mock states]
- **Test Steps:**
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Input Data / Payload:** [JSON request or user input]
- **Expected Outcome:** [Expected HTTP status, data structure, 3D render, or error]
- **Actual Outcome:** [Observed result during execution]
- **Status:** [Planned / In Progress / Passed / Failed]
- **Execution Date:** [YYYY-MM-DD]
```

---

## 7. Executable Test Cases Specification

| Test ID | Module | Scenario Description | Expected Outcome | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-DT-01** | Digital Twin | Render 3D farm scene on standard laptop | $\ge 45\text{ FPS}$, WebGL heap $\le 150\text{ MB}$ | **Planned** |
| **TC-DT-02** | Digital Twin | Simulate WebGL context loss | Gracefully switches to 2D Canvas Map View | **Planned** |
| **TC-DT-03** | Digital Twin | Click raycast on Plot 2 | Selects plot mesh; opens inspection panel | **Planned** |
| **TC-CI-01** | Crop Intelligence | Submit valid NPK soil report | Returns ranked crops with confidence scores | **Planned** |
| **TC-CI-02** | Crop Intelligence | Upload leaf photo to disease endpoint | Returns disease class, confidence, treatment | **Planned** |
| **TC-CI-03** | Crop Intelligence | Benchmark Multi-Task model vs. XGBoost | Records comparative accuracy and MAE | **Planned** |
| **TC-OP-01** | Farm Operations | Record expense of ₹2,500 for seeds | Deducts from cash balance; updates ledger | **Planned** |
| **TC-OP-02** | Farm Operations | Attempt double booking on rented tractor | Rejects with HTTP 409 conflict error | **Planned** |
| **TC-OP-03** | Farm Operations | Deduct stock below minimum threshold | Status updates to `LOW_STOCK` with alert | **Planned** |
| **TC-AI-01** | AI Assistant | Ask assistant for current cash balance | Tool calls `get_farm_finances`; reports balance | **Planned** |
| **TC-AI-02** | AI Assistant | Query out-of-domain topic (cryptocurrency)| Explicitly abstains; redirects to farm scope | **Planned** |
| **TC-AI-03** | AI Assistant | Query with low RAG retrieval confidence | States official guidance is unavailable | **Planned** |

---

## 8. Test Execution & Results Log

| Run ID | Execution Date | Responsible Member | Test Suite | Tests Total | Passed | Failed | Status |
| :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: |
| **RUN-01** | *Pending* | Member 1 | 3D WebGL Performance & Raycasting | — | — | — | **Not Started** |
| **RUN-02** | *Pending* | Member 2 | Disease API Audit & ML Benchmarks | — | — | — | **Not Started** |
| **RUN-03** | *Pending* | Member 3 | Financial Double-Entry & Operations API | — | — | — | **Not Started** |
| **RUN-04** | *Pending* | Member 4 | RAG Grounding, Tool Calling & Abstention| — | — | — | **Not Started** |
| **RUN-05** | *Pending* | Full Team | End-to-End System Integration & Pilot | — | — | — | **Not Started** |
