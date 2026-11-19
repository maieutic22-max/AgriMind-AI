# AgriMind AI

> **An Agentic AI-Powered Farm Management and Digital Twin Platform**

[![Project Status: Phase 1 Initialized](https://img.shields.io/badge/status-Phase%201%20Initialized-emerald.svg)](documentation/02_PROJECT_PROGRESS.md)
[![License: Academic / Educational](https://img.shields.io/badge/license-Academic-blue.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI: 0.110+](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React: 18+](https://img.shields.io/badge/frontend-React%2018%20%7C%20Vite%20%7C%20TS-61dafb.svg)](https://react.dev/)
[![Three.js: WebGL](https://img.shields.io/badge/3D-Three.js%20%7C%20R3F-black.svg)](https://threejs.org/)
[![Database: PostgreSQL + pgvector](https://img.shields.io/badge/database-PostgreSQL%20%2B%20pgvector-336791.svg)](https://www.postgresql.org/)

---

## 1. Executive Overview

**AgriMind AI** is an intelligent farm management and cyber-physical agricultural simulation ecosystem. It unites physical farm operations with digital intelligence to empower farmers throughout the agricultural lifecycle—from pre-season crop selection and land configuration to daily agronomic management, financial accounting, harvest logistics, and market transactions.

### Core Platform Identity
AgriMind AI is **not** a basic crop recommendation script or an isolated leaf disease classifier. Its primary identity is:

> **An intelligent farm management ecosystem with a 3D Digital Twin, an Agentic AI Farm Manager, persistent farming memory, what-if simulations, farm finance, and complete agricultural operations management.**

---

## 2. Problem Statement

Modern smallholder and commercial agriculture faces systemic informational fragmentation:
1. **Disconnected Data Sources:** Farmers check separate tools for weather, mandi market prices, pest alerts, and subsidies without a unified farm record.
2. **Lack of Spatial Context:** Advisory apps provide generic text without visualizing plot boundaries, soil gradients, or crop growth stages in relation to actual farm topography.
3. **Reactive Practices:** Traditional software diagnoses problems after damage occurs; farmers lack pre-season "what-if" simulation tools to model crop, water, and financial trade-offs before planting.
4. **Agronomic-Financial Disconnect:** Agronomic advice is generated in a vacuum without factoring in the farmer's cash flow, available labor, or input inventory.
5. **Absence of Memory:** Agricultural chat utilities have no recollection of prior crops, historical soil issues, or past yields.

---

## 3. Scope & Feature Taxonomy

AgriMind AI maintains clear architectural boundaries:
- **26 Core Functional Capabilities:** User-facing capabilities delivered across the agricultural lifecycle.
- **34 Implementation Deliverables:** Discrete technical deliverables assigned across the four team members in `AgriMind_AI_Team_Feature_Distribution.pdf`.
- **4 Development Modules:** Full-stack vertical slices owned by each student engineer.

### Development Modules & Team Allocation

| Module | Lead Engineer | Scope of Responsibilities | Deliverables |
| :--- | :--- | :--- | :---: |
| **Module 1: Digital Twin, Simulation & Interface** | **Member 1** | Three.js WebGL virtual farm, setup wizard, what-if simulator, machinery rental marketplace, crop calendar, and spatial ML display. | D01–D10 |
| **Module 2: Crop, Soil & Agricultural Intelligence** | **Member 2** | Smart crop recommendation, soil health card analysis, irrigation water budgeting ($ET_c$), disease API audit & proxy, and experimental multi-task ML. | D11–D18 |
| **Module 3: Farm Business & Operations** | **Member 3** | Double-entry financial accounting, profitability simulator, APMC mandi intelligence, FPO collective selling, inventory tracking, labor management, and time-series price forecasting. | D19–D26 |
| **Module 4: AI Assistant & Farmer Services** | **Member 4** | Central Agentic AI assistant (Gemini tool calling), RAG agricultural knowledge with source citations, AI farming memory, vernacular voice, and government schemes. | D27–D34 |

---

## 4. Current Implementation Status (Phase 1 Baseline)

| Component / Layer | Status | Current Evidence |
| :--- | :---: | :--- |
| **Technical Documentation** | **Completed** | 10 comprehensive architectural specifications in `documentation/` |
| **Frontend UI Prototype** | **Available** | Client-side visual preview in `agrimind_ai_frontend_v5.html` |
| **Frontend Application Shell** | **Foundation Implemented** | React 18 + Vite + TypeScript + Tailwind CSS with responsive navigation |
| **3D Digital Twin Engine** | **Foundation Implemented** | Three.js + React Three Fiber + OrbitControls WebGL canvas with terrain grid |
| **Backend REST API** | **Foundation Implemented** | FastAPI + Pydantic v2 with CORS, logging, health probes, and API v1 router |
| **PostgreSQL Integration** | **Planned (Configured)** | SQLAlchemy models (`User`, `Farm`, `FarmField`) configured; pending local DB instance |
| **Authentication Architecture** | **Foundation Implemented** | JWT utilities, password hashing, and development login/signup workflows |
| **Automated Backend Tests** | **Tested** | Pytest test suite covering health, root, config, and system information |
| **26 Core Agricultural Features** | **Planned / In Development** | Scaffolding prepared; full business logic to be developed in Phase 2 |

---

## 5. Technology Stack

### Frontend & 3D Visualization
- **React 18** with **TypeScript** and **Vite**
- **Tailwind CSS** for responsive agricultural styling
- **Three.js** + **React Three Fiber (R3F)** + **@react-three/drei** for hardware-accelerated 3D WebGL scenes
- **React Router v6** for client-side routing
- **Lucide React** for iconography
- **Axios** for API communication

### Backend & Data Persistence
- **Python 3.10+** with **FastAPI**
- **Pydantic v2** for request/response schema validation
- **SQLAlchemy 2.0** for relational ORM
- **PostgreSQL 15+** with **pgvector** extension for vector similarity search
- **Python-Jose** & **Passlib (Bcrypt)** for JWT authentication

### Machine Learning & Artificial Intelligence
- **Scikit-learn** & **XGBoost** for classical tabular baselines
- **PyTorch** (only when genuinely necessary for experimental multi-task networks)
- **Google Gemini API** for Agentic AI via native tool calling
- **Sentence-Transformers** for dense RAG knowledge embeddings

---

## 6. Repository Structure

```text
AgriMind-AI/
├── frontend/                   # React + Vite + TypeScript Application
│   ├── public/                 # Static 3D models and assets
│   ├── src/
│   │   ├── components/         # Common, layout, and UI components
│   │   ├── layouts/            # AppLayout and AuthLayout
│   │   ├── modules/            # Member-owned feature modules
│   │   │   ├── digital-twin/   # Three.js WebGL scene and 3D controls
│   │   │   ├── crop-intelligence/
│   │   │   ├── farm-management/
│   │   │   └── ai-assistant/
│   │   ├── pages/              # Application views (Dashboard, DigitalTwin, etc.)
│   │   ├── services/           # Axios API client and health probes
│   │   ├── context/            # Authentication and session state
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Route definitions
│   │   └── main.tsx            # Vite entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                    # FastAPI REST API Backend
│   ├── app/
│   │   ├── api/v1/             # Versioned REST endpoints (health, system, auth)
│   │   ├── core/               # App configuration, security, and logging
│   │   ├── database/           # Connection probe, base, and models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── main.py             # FastAPI entry point
│   ├── tests/                  # Automated Pytest suite
│   ├── requirements.txt
│   └── pytest.ini
├── ml/                         # Machine learning datasets, notebooks, and models
│   ├── datasets/
│   ├── training/
│   ├── evaluation/
│   └── models/
├── documentation/              # 10 Official Architectural Specifications (Version 2.0.0)
├── agrimind_ai_frontend_v5.html# UI reference prototype
├── .gitignore
├── .env.example
├── README.md
└── LICENSE
```

---

## 7. Local Development Setup

### Prerequisites
- **Node.js:** v20+ LTS
- **Python:** v3.10 or v3.11
- **Git**
- **PostgreSQL 15+** (Optional for Phase 1; backend runs gracefully in disconnected probe mode if absent)

---

### Backend Setup & Execution

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Run automated backend tests
python -m pytest tests -v

# 5. Start the FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API Base URL: `http://localhost:8000/api/v1`
- Swagger Documentation: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/api/v1/health`

---

### Frontend Setup & Execution

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

- Application URL: `http://localhost:5173`

---

## 8. Git Workflow & Branching Guidelines

The team operates using a GitFlow branching model:
- `main`: Production-ready release branch.
- `develop`: Primary staging and integration branch.
- Feature branches (one per member):
  - `feature/member1-digital-twin`
  - `feature/member2-crop-intelligence`
  - `feature/member3-farm-management`
  - `feature/member4-ai-assistant`

Commits must follow Conventional Commits (e.g., `feat(twin): add camera controls`). Direct pushes to `main` and `develop` are prohibited.

---

## 9. Documentation Index

For exhaustive architectural, algorithmic, and engineering details, refer to:
- [`01_PROJECT_OVERVIEW.md`](documentation/01_PROJECT_OVERVIEW.md)
- [`02_PROJECT_PROGRESS.md`](documentation/02_PROJECT_PROGRESS.md)
- [`03_SYSTEM_ARCHITECTURE.md`](documentation/03_SYSTEM_ARCHITECTURE.md)
- [`04_TEAM_RESPONSIBILITIES.md`](documentation/04_TEAM_RESPONSIBILITIES.md)
- [`05_TECH_STACK_AND_SETUP.md`](documentation/05_TECH_STACK_AND_SETUP.md)
- [`06_DATABASE_AND_API_DESIGN.md`](documentation/06_DATABASE_AND_API_DESIGN.md)
- [`07_CODING_STANDARDS.md`](documentation/07_CODING_STANDARDS.md)
- [`08_TESTING_AND_QUALITY_ASSURANCE.md`](documentation/08_TESTING_AND_QUALITY_ASSURANCE.md)
- [`09_ML_AND_AI_DOCUMENTATION.md`](documentation/09_ML_AND_AI_DOCUMENTATION.md)
- [`10_DEPLOYMENT_AND_GIT_WORKFLOW.md`](documentation/10_DEPLOYMENT_AND_GIT_WORKFLOW.md)
