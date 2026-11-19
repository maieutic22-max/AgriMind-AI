# Team Onboarding & Parallel Development Guide — AgriMind AI

## Document Information
- **Project Name:** AgriMind AI
- **Document Version:** 1.0.0 (Phase 1 Baseline)
- **Target Audience:** All Four Engineering Team Members
- **Repository URL:** `https://github.com/maieutic22-max/AgriMind-AI`
- **Default Integration Branch:** `develop`

---

## 1. Welcome to AgriMind AI

Welcome to the development team! AgriMind AI is an **Agentic AI-powered Farm Management and Digital Twin Platform** being engineered by four student software engineers.

The Phase 1 full-stack foundation has been established with:
- A responsive React 18 + Vite + TypeScript + Tailwind CSS application shell.
- A FastAPI backend with versioned routing, health probes, authentication models, and SQLAlchemy ORM structure.
- Hardware-accelerated Three.js WebGL canvas integration.
- 10 comprehensive architectural specifications in `documentation/`.

This document explains how to set up your local development environment on Windows, create and manage your assigned feature branch, develop your module in isolation using mock data, and collaborate safely without merge conflicts.

---

## 2. Prerequisites & Machine Setup (Windows)

Ensure you have the following installed on your Windows development workstation:

1. **Git for Windows:** [git-scm.com](https://git-scm.com/download/win) (Ensure Git Credential Manager is enabled).
2. **Node.js:** v20+ LTS (includes npm v10+) from [nodejs.org](https://nodejs.org/).
3. **Python:** v3.10.x or v3.11.x from [python.org](https://www.python.org/) (Ensure **"Add python.exe to PATH"** was checked during installation).
4. **Visual Studio Code:** [code.visualstudio.com](https://code.visualstudio.com/) with recommended extensions:
   - *Python* & *Pylance* (Microsoft)
   - *ESLint* (Microsoft)
   - *Tailwind CSS IntelliSense* (Brad Cornes)
   - *Prettier - Code formatter*
5. **PostgreSQL 15+ (Optional for Phase 1):** Backend runs gracefully in disconnected probe mode if PostgreSQL is not locally installed yet.

---

## 3. Cloning the Repository & Initial Setup

Open **PowerShell** as your standard user (no Administrator privileges required):

```powershell
# 1. Clone the repository
git clone https://github.com/maieutic22-max/AgriMind-AI.git

# 2. Enter project root
cd "AgriMind-AI"

# 3. Verify branches and remote
git branch -a
git remote -v
```

---

## 4. Environment Variables Configuration

Copy the example environment files into active configuration files:

```powershell
# Root configuration
Copy-Item .env.example .env

# Backend configuration
Copy-Item backend\.env.example backend\.env

# Frontend configuration
Copy-Item frontend\.env.example frontend\.env
```

> **IMPORTANT:** Never commit `.env` files to Git. The `.gitignore` file is configured to exclude `*.env` files across all directories. Keep sensitive API keys local to your machine.

---

## 5. Backend Setup & Local Verification

Follow these steps to configure Python and run backend tests:

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate the virtual environment
# If PowerShell gives an execution policy error, run:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1

# 4. Upgrade pip and install all backend dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 5. Run automated backend test suite
python -m pytest tests -v

# 6. Start the FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Backend Endpoints:
- **API Base:** `http://localhost:8000/api/v1`
- **Swagger Interactive Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/api/v1/health`
- **System Information:** `http://localhost:8000/api/v1/system/info`

---

## 6. Frontend Setup & Local Verification

Open a **second PowerShell terminal** window:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Run TypeScript typecheck and ESLint
npm run lint

# 4. Start the Vite development server
npm run dev
```

### Frontend Endpoint:
- **Application URL:** `http://localhost:5173`

---

## 7. Running Frontend and Backend Simultaneously

For everyday development, keep two side-by-side terminal panes open:

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
| :--- | :--- |
| `cd backend` | `cd frontend` |
| `.\venv\Scripts\Activate.ps1` | `npm run dev` |
| `uvicorn app.main:app --reload` | *(Accessible at http://localhost:5173)* |

The frontend proxy and Axios client (`frontend/src/services/api.ts`) automatically communicate with `http://localhost:8000/api/v1`.

---

## 8. Feature Branch Workflow & Naming Standards

All development must occur on assigned feature branches branched from `develop`. Direct pushes to `main` or `develop` are prohibited.

### Designated Feature Branches:

| Team Member | Module Scope | Assigned Feature Branch |
| :--- | :--- | :--- |
| **Member 1** | Digital Twin, 3D WebGL, What-If Simulation, Farm Setup, Machinery Rental | `feature/member1-digital-twin` |
| **Member 2** | Crop Recommendation, Soil Health, Irrigation, Disease Detection, ML Models | `feature/member2-crop-intelligence` |
| **Member 3** | Farm Accounting, Profitability Simulator, Mandi Prices, Inventory, Labour | `feature/member3-farm-management` |
| **Member 4** | Agentic AI Assistant, Gemini Tools, RAG Knowledge, Voice, Gov Schemes | `feature/member4-ai-assistant` |

### How to Create Your Branch from `develop`:

```powershell
# 1. Checkout the latest develop branch
git checkout develop
git pull origin develop

# 2. Create and switch to your designated feature branch
# Example for Member 1:
git checkout -b feature/member1-digital-twin

# Example for Member 2:
git checkout -b feature/member2-crop-intelligence

# Example for Member 3:
git checkout -b feature/member3-farm-management

# Example for Member 4:
git checkout -b feature/member4-ai-assistant
```

---

## 9. Codebase Ownership & Directory Boundaries

To allow all four members to build simultaneously without git conflicts, each member owns specific directories:

### Directory Ownership Matrix:

```text
AgriMind-AI/
├── frontend/src/modules/
│   ├── digital-twin/          <-- Member 1 OWNS
│   ├── crop-intelligence/     <-- Member 2 OWNS
│   ├── farm-management/       <-- Member 3 OWNS
│   └── ai-assistant/          <-- Member 4 OWNS
│
├── backend/app/modules/
│   ├── digital_twin/          <-- Member 1 OWNS
│   ├── crop_intelligence/     <-- Member 2 OWNS
│   ├── farm_management/       <-- Member 3 OWNS
│   └── ai_assistant/          <-- Member 4 OWNS
│
└── ml/                        <-- Member 2 OWNS (with M3 price models in ml/training/)
    ├── datasets/
    ├── training/
    └── models/
```

### Shared Files (Coordination Required):

The following files are **shared infrastructure**. Do **NOT** modify them without consulting your teammates:

1. `frontend/src/App.tsx` (Route registry)
2. `frontend/src/layouts/AppLayout.tsx` (Sidebar and top navigation)
3. `frontend/package.json` (Adding new frontend libraries requires team sign-off)
4. `backend/app/api/v1/router.py` (Master API route aggregator)
5. `backend/app/database/models/__init__.py` (Master ORM model aggregator)
6. `backend/app/database/connection.py` (Database connection and session factory)
7. `backend/app/core/config.py` (Global application settings)
8. `backend/requirements.txt` (Adding new Python packages requires team sign-off)

---

## 10. Committing and Pushing Changes

Follow **Conventional Commits** format for all commit messages:

- `feat(twin): add Three.js plot boundary rendering`
- `feat(crops): implement crop recommendation form and validation`
- `feat(finance): add double-entry ledger transaction endpoint`
- `feat(ai): configure Gemini tool calling function definitions`
- `fix(weather): resolve temperature unit conversion bug`
- `test(irrigation): add unit tests for ETc calculation formula`

### Staging, Committing, and Pushing:

```powershell
# Check modified files
git status

# Stage only files in your owned module
git add frontend/src/modules/crop-intelligence/
git add backend/app/modules/crop_intelligence/

# Commit with a descriptive conventional commit message
git commit -m "feat(crops): implement soil health analysis form"

# Push your branch to GitHub
git push -u origin feature/member2-crop-intelligence
```

---

## 11. Pull Request (PR) into `develop`

When your feature slice or deliverable is ready for integration:

1. **Rebase on Latest `develop`:**
   ```powershell
   git checkout develop
   git pull origin develop
   git checkout feature/memberX-your-module
   git rebase develop
   ```
2. **Verify Tests & Linting Pass Locally:**
   ```powershell
   # In frontend:
   npm run lint
   npm run build

   # In backend:
   python -m pytest tests -v
   ```
3. **Push Rebased Branch:**
   ```powershell
   git push origin feature/memberX-your-module --force-with-lease
   ```
4. **Open a GitHub Pull Request:**
   - Base branch: `develop`
   - Compare branch: `feature/memberX-your-module`
   - Title: `feat(module): brief description of deliverable`
   - Fill out the PR description with:
     - What deliverable this addresses (e.g., Deliverable D11).
     - Screenshots / API response examples.
     - Testing evidence.
5. **Peer Review:** At least one teammate must review and approve the PR before merging.

---

## 12. Mock Data Strategy (Unblocking Parallel Work)

During Phase 2, frontend development often outpaces backend completion, or Member 1 (3D Twin) may need prediction data before Member 2 finishes training ML models.

### Guidelines for Mock Data:
1. **Define TypeScript Types First:** Consult `documentation/SHARED_API_CONTRACTS.md`.
2. **Place Mock Data in Your Module:** Create a `mockData.ts` file inside your own module directory:
   - Example: `frontend/src/modules/digital-twin/mockData.ts`
   - Example: `frontend/src/modules/crop-intelligence/mockPredictions.ts`
3. **Use Mock Adapters:** Structure your frontend API service to return mock data with a simulated delay if the backend endpoint is not yet connected:
   ```typescript
   export async function getCropRecommendations(params: CropRecommendationRequest): Promise<CropRecommendationResponse> {
     try {
       const res = await apiClient.post('/crops/recommend', params);
       return res.data;
     } catch (err) {
       console.warn('Backend unavailable, using local mock data fallback');
       return MOCK_CROP_RECOMMENDATION_RESPONSE;
     }
   }
   ```
4. **Never Block on Another Member:** If you need an API that another member owns, agree on the JSON contract in `SHARED_API_CONTRACTS.md`, mock the response in your frontend, and proceed immediately.

---

## 13. Resolving Integration Conflicts

If Git reports a merge conflict when rebasing:

1. Open the conflicted files in VS Code.
2. Review the conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`).
3. If the conflict is in a shared file (e.g., `router.py` or `App.tsx`), preserve both members' route registrations.
4. Stage resolved files:
   ```powershell
   git add backend/app/api/v1/router.py
   git rebase --continue
   ```
5. If you are ever unsure, **stop and ask the author of the conflicting commit before forcing a merge**.

---

## 14. Support & Team Communication

- **Documentation Reference:** Check the `documentation/` folder first; 10 architectural specifications detail every feature.
- **Contract Decisions:** Review `documentation/SHARED_API_CONTRACTS.md` before implementing any cross-module endpoint.
- **Status Reporting:** Keep daily standup updates short: (1) What you completed yesterday, (2) What you are building today, (3) Any blockers.
