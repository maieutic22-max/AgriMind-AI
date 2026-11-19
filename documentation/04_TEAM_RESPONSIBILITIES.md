# 04. Team Member Allocation & Responsibilities — AgriMind AI

## Document Information
- **Project Name:** AgriMind AI
- **Document Version:** 2.0.0 (Architecture Finalization Specification)
- **Source Authority:** Official Team Allocation (`AgriMind_AI_Team_Feature_Distribution.pdf`)
- **Team Size:** 4 Engineering Students
- **Mandate:** Exact preservation of assigned deliverables with end-to-end full-stack module ownership.

---

## 1. Feature Terminology & Structural Overview

AgriMind AI maintains strict alignment between functional needs and team execution:
- **26 Core Functional Capabilities:** User-facing capabilities delivered to farmers across the platform.
- **34 Implementation Deliverables:** Discrete technical deliverables allocated across the 4 members in the official PDF.
- **4 Development Modules:** The vertical development slices owned end-to-end by each member.

### Vertical Slice Ownership Principle
Every team member owns their assigned module **end-to-end**:
1. **Frontend:** React + TypeScript components, forms, and views with Tailwind CSS.
2. **Backend:** FastAPI REST controllers, validation schemas (Pydantic), and business logic.
3. **Database:** PostgreSQL table definitions, migrations, relationships, and queries for owned entities.
4. **AI / ML / Engine:** Developing or integrating specialized models, simulation math, or external API proxies.
5. **Testing & QA:** Writing automated unit, API, and component tests for their module.

---

## 2. Member 1: Digital Twin, Simulation & Farm Interface

### Assigned Deliverables (Official PDF Allocation)
1. **AI Farm Digital Twin** (Deliverable D01)
2. **Farm Creation & Field Configuration** (Deliverable D02)
3. **3D Farm Visualisation** (Deliverable D03)
4. **Interactive Field Management** (Deliverable D04)
5. **Crop Growth Visualisation** (Deliverable D05)
6. **Farm What-If Simulator** (Deliverable D06)
7. **Farm Equipment Sharing & Rental** (Deliverable D07)
8. **Farmer Dashboard & Analytics** (Deliverable D08)
9. **Intelligent Crop Calendar** (Deliverable D09)
10. **ML Prediction Integration** (Deliverable D10)

### Detailed Responsibilities

#### A. Frontend Responsibilities (React + TypeScript + Three.js)
- Build the 3D Agricultural Digital Twin canvas using **React Three Fiber (R3F)**, **Drei**, and **Three.js**.
- Implement camera orbit and navigation with `OrbitControls` (azimuth and elevation limits).
- Build the **Farm Creation Wizard** (`/app/farm/setup`) allowing plot boundary definition and asset configuration.
- Implement plot selection using raycasting (`Raycaster`) to trigger plot inspection modals.
- Render crop growth stages in 3D using low-poly GLTF/GLB models.
- Implement the **2D Fallback View** (SVG/Canvas map) for devices lacking WebGL support or dropping below 20 FPS.
- Build the **Farm What-If Simulator** interactive comparison UI with dynamic input sliders.
- Build the **Farm Equipment Sharing & Rental** portal (listing, searching, filter by distance, booking modal).
- Build the **Farmer Dashboard** displaying farm summary stats, active crops, alerts, and quick actions.
- Build the **Intelligent Crop Calendar** interactive Gantt/timeline view.

#### B. Backend Responsibilities (FastAPI + Pydantic)
- Implement `/api/v1/farms` endpoints (CRUD for farm profiles, location, total acreage).
- Implement `/api/v1/plots` endpoints (creating, splitting, updating plot geometry and soil/crop metadata).
- Implement `/api/v1/equipment` endpoints (equipment catalog, rental listings, booking requests, status transitions).
- Implement `/api/v1/calendar` endpoints (generating dynamic crop calendar events per plot).
- Implement `/api/v1/digital-twin/simulate` calculation service for the **Farm What-If Simulator**.

#### C. Database Responsibilities (PostgreSQL)
- Design and maintain tables: `Farms`, `FarmPlots`, `Equipment`, `EquipmentRental`, `CropCalendarEvents`.
- Store plot geometry coordinates as standard GeoJSON polygon structures in PostgreSQL `JSONB`.

#### D. 3D Engine & Integration Responsibilities
- Source, optimize, and bundle low-poly GLTF/GLB models for crops, farmhouse, storage, trees, and water bodies.
- Ingest and display predictions from Member 2's model as visual overlays on 3D plots (**ML Prediction Integration**).

#### E. Deliverables & Performance Targets
- Digital Twin rendering at $\ge 45\text{ FPS}$ on desktop and $\ge 30\text{ FPS}$ on mid-tier mobile, within $\le 150\text{ MB}$ WebGL memory.
- Graceful degradation to 2D Map View when WebGL is unavailable.
- Functional peer-to-peer equipment rental booking flow.

---

## 3. Member 2: Crop, Soil & Agricultural Intelligence

### Assigned Deliverables (Official PDF Allocation)
1. **Smart Crop Recommendation** (Deliverable D11)
2. **Soil Health Analysis** (Deliverable D12)
3. **Smart Irrigation Management** (Deliverable D13)
4. **Crop Disease & Pest Detection** (Deliverable D14)
5. **Pest & Disease Early Warning** (Deliverable D15)
6. **Weather Intelligence & Alerts** (Deliverable D16)
7. **Agricultural Risk Intelligence** (Deliverable D17)
8. **Central Agricultural Multi-task Model** (Deliverable D18)

### Detailed Responsibilities

#### A. Frontend Responsibilities (React + TypeScript)
- Build the **Smart Crop Recommendation** interface (`/app/crops/recommend`) with input forms and ranked results.
- Build the **Soil Health Analysis** view with NPK visual gauges, pH meters, and amendment advisories.
- Build the **Smart Irrigation Management** dashboard showing daily water requirements ($ET_c$) and watering schedules.
- Build the **Crop Disease & Pest Detection** upload interface with leaf image drag-and-drop, preview, and diagnosis cards.
- Build the **Weather Intelligence & Agricultural Risk Watchlist** views displaying micro-climate forecasts and risk badges.

#### B. Backend Responsibilities (FastAPI + Pydantic)
- Implement `/api/v1/crops/recommend` inference endpoint invoking the crop recommendation model.
- Implement `/api/v1/soil/reports` endpoints (evaluating laboratory soil test data and generating amendment plans).
- Implement `/api/v1/irrigation` endpoints (computing daily crop evapotranspiration $ET_c = K_c \times ET_0$).
- Implement `/api/v1/disease/diagnose` client proxy connecting to the disease detection API.
- Implement `/api/v1/weather` endpoints proxying live weather feeds (OpenWeatherMap / IMD).
- Implement `/api/v1/risks` calculating composite agricultural risk scores (drought, waterlogging, frost).

#### C. Database Responsibilities (PostgreSQL)
- Design and maintain tables: `SoilReports`, `Crops`, `CropCycles`, `IrrigationRecords`, `WeatherRecords`, `PestDiseaseAlerts`.
- Maintain crop coefficient reference tables ($K_c$ per growth stage) and optimal soil chemistry parameters.

#### D. AI & ML Responsibilities
- **Central Multi-Task Model (Experimental):** Formulate and evaluate a multi-task network (crop suitability, yield, fertilizer, water, risk) against individual **Scikit-learn / XGBoost** baseline models. Multi-task architecture is adopted only if verified to be superior or equal to baselines.
- **Disease Detection API Audit:**
  - Status: `Existing Integration – Pending Audit`.
  - Member 2 must audit the predecessor KisanSathi disease endpoint: verify provider, endpoint URL, authentication, input/output formats, rate limits, pricing, reliability, and reusability.
- **Pest Early Warning:** Formulate heuristic and micro-climatic rules linking temperature and humidity spikes to disease outbreak risk.

---

## 4. Member 3: Farm Business & Operations

### Assigned Deliverables (Official PDF Allocation)
1. **Farm Financial Management** (Deliverable D19)
2. **Farm Profitability Simulator** (Deliverable D20)
3. **Smart Market Intelligence** (Deliverable D21)
4. **FPO & Collective Selling** (Deliverable D22)
5. **Harvest & Post-Harvest Management** (Deliverable D23)
6. **Smart Agricultural Inventory** (Deliverable D24)
7. **Farm Labour Management** (Deliverable D25)
8. **Market Price Forecasting** (Deliverable D26)

### Detailed Responsibilities

#### A. Frontend Responsibilities (React + TypeScript)
- Build the **Farm Financial Management** ledger (`/app/finance`) with income/expense logging, category tags, and cash flow charts.
- Build the **Farm Profitability Simulator** interface with sliders for yield variations, production costs, and mandi prices.
- Build the **Smart Market Intelligence** explorer displaying APMC mandi prices, commodity filters, and modal price trends.
- Build the **FPO & Collective Selling** portal displaying active collective pools, committed volumes, and buyer bids.
- Build the **Harvest & Post-Harvest Management** view tracking harvested yields, storage facility status, and moisture levels.
- Build the **Smart Agricultural Inventory** view (`/app/inventory`) with stock meters, reorder thresholds, and expiration badges.
- Build the **Farm Labour Management** roster (`/app/labour`) with worker directory, daily attendance check-ins, and wage logs.

#### B. Backend Responsibilities (FastAPI + Pydantic)
- Implement `/api/v1/finance` endpoints (CRUD for transactions, cash flow summaries, loan obligations).
- Implement `/api/v1/profitability/simulate` economic calculation service.
- Implement `/api/v1/market/prices` and `/api/v1/market/forecast` endpoints.
- Implement `/api/v1/fpo/pools` (creating collective selling pools, committing farmer harvest quantities).
- Implement `/api/v1/harvest` endpoints (logging harvest yields, storage assignments).
- Implement `/api/v1/inventory` endpoints (stock movements, low-stock threshold triggers, expiration checks).
- Implement `/api/v1/labour` endpoints (worker profiles, attendance logging, payroll calculation).

#### C. Database Responsibilities (PostgreSQL)
- Design and maintain tables: `Expenses`, `Income`, `Inventory`, `Labour`, `LabourAttendance`, `MarketPrices`, `HarvestRecords`, `FPOCollectivePools`.
- Enforce exact currency tracking using integer minor units or `NUMERIC(12, 2)` to eliminate rounding errors.

#### D. AI & ML Responsibilities
- **Market Price Forecasting:** Develop, evaluate, and deploy a specialized time-series forecasting model using **Statsmodels (ARIMA/SARIMAX)**, **Prophet**, or **XGBoost with lagged features** on historical APMC mandi data.

---

## 5. Member 4: AI Assistant & Farmer Services

### Assigned Deliverables (Official PDF Allocation)
1. **Central Agentic AI Assistant** (Deliverable D27)
2. **RAG-Based Agricultural Knowledge** (Deliverable D28)
3. **AI Farming Memory** (Deliverable D29)
4. **Multilingual Voice Assistant** (Deliverable D30)
5. **Government Schemes & Agricultural Services** (Deliverable D31)
6. **Expert Consultation** (Deliverable D32)
7. **Offline-First Application** (Deliverable D33)
8. **AI & ML Integration** (Deliverable D34)

### Detailed Responsibilities

#### A. Frontend Responsibilities (React + TypeScript)
- Build the **AI Assistant** chat interface (`/app/assistant`) with message threads, prompt pills, and rich data widget rendering.
- Implement the **Multilingual Voice Assistant** microphone toggle using the browser's native **Web Speech API**.
- Build the **Government Schemes** directory (`/app/schemes`) with eligibility filters, benefit summaries, and application guides.
- Build the **Expert Consultation** modal for packaging farm context, soil cards, and disease photos into an advisory ticket.
- Configure client-side Service Worker registration, offline indicators, and IndexedDB caching (**Offline-First Application**).

#### B. Backend Responsibilities (FastAPI + Pydantic)
- Implement `/api/v1/assistant/chat` orchestrating the Agentic AI tool-calling loop via the **Google Gemini API**.
- Implement `/api/v1/memory` endpoints (capturing and retrieving episodic farm events and longitudinal plot context).
- Implement `/api/v1/knowledge/query` executing dense vector search over agricultural manuals stored in `pgvector`.
- Implement `/api/v1/schemes` endpoints (searching subsidy databases and evaluating farmer eligibility).
- Implement `/api/v1/consultations` endpoints (submitting and tracking expert advisory tickets).
- Build the **AI & ML Integration Layer** exposing approved FastAPI endpoints as structured tool definitions to the LLM.

#### C. Database & Vector Responsibilities (PostgreSQL + pgvector)
- Design and maintain tables: `AIConversations`, `FarmMemory`, `GovernmentSchemes`, `ExpertTickets`.
- Configure the `pgvector` extension and maintain the `knowledge_embeddings` table with cosine similarity indexing.

#### D. AI & Agentic Responsibilities
- **Native Tool Calling:** Implement the single-agent tool-calling loop using Google Gemini API native function calling to query platform endpoints.
- **RAG Pipeline & Hallucination Mitigation:** Ingest verified agricultural handbooks (ICAR, SAU, KVK). Enforce source citation requirements and explicit abstention when document similarity falls below threshold.
- **AI Farming Memory:** Implement dual persistence for farm memory: structured relational logs and semantic vector summaries.

---

## 6. Cross-Member API Integration Matrix

| Consumer Member | Producer Member | Required Data / Capability | Integration Point |
| :--- | :--- | :--- | :--- |
| **Member 1** (Twin) | **Member 2** (Crop Intel) | Predictions to display on 3D plots. | `GET /api/v1/plots/{id}/predictions` |
| **Member 1** (Twin) | **Member 3** (Operations) | Available machinery for rental display. | `GET /api/v1/equipment/available` |
| **Member 3** (Operations) | **Member 1** (Twin) | Plot acreages and active crops for cost modeling. | `GET /api/v1/farms/{id}/summary` |
| **Member 4** (Agentic AI) | **Member 1** (Twin) | Run What-If simulation via natural language. | Tool: `simulate_crop_scenario()` |
| **Member 4** (Agentic AI) | **Member 2** (Crop Intel) | Fetch soil tests and diagnose disease photos. | Tools: `get_soil_report()`, `diagnose_disease()` |
| **Member 4** (Agentic AI) | **Member 3** (Operations) | Query inventory, labor, and mandi prices. | Tools: `check_inventory()`, `get_mandi_price()` |

---

## 7. Individual Ownership Commitments

All four members agree to:
1. Develop and commit code exclusively within their designated feature branches (`feature/member1-...`, `feature/member2-...`, etc.).
2. Adhere to the finalized technology stack (React + Vite + TypeScript, FastAPI, PostgreSQL with pgvector).
3. Maintain clean Pydantic request/response schemas and OpenAPI documentation.
4. Write automated unit and integration tests covering at least 70% of their business logic.
5. Participate in weekly integration syncs and peer review all Pull Requests before merging into `develop`.
