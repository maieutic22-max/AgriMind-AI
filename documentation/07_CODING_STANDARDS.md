# 07. Team Coding Standards & Engineering Guidelines — AgriMind AI

## Document Information
- **Project Name:** AgriMind AI
- **Document Version:** 2.0.0 (Architecture Finalization Specification)
- **Scope:** Mandatory Engineering Rules for All 4 Team Members and AI Coding Agents
- **Enforcement:** Code Reviews, Pre-Commit Hooks, and CI/CD Quality Gates

---

## 1. Core Engineering Principles

1. **DRY (Don't Repeat Yourself):** Shared logic (date formatting, currency calculations, API client wrappers, error handlers) must reside in common utility modules rather than duplicated across member codebases.
2. **Type Safety Across Layers:** TypeScript on the frontend and Pydantic v2 schemas on the backend must be strictly maintained to guarantee interface contracts between members.
3. **Fail Early & Gracefully:** Validate inputs at API and form boundaries. Return structured, actionable error envelopes to the client while logging detailed diagnostic stack traces internally.
4. **Explicit Over Implicit:** Write self-documenting code. Never use untyped generic dictionaries, undocumented magic numbers, or global mutable state.

---

## 2. Naming Conventions

All team members must follow uniform naming conventions across languages:

| Context / Layer | Technology | Convention | Example |
| :--- | :--- | :--- | :--- |
| **Backend Classes** | Python | `PascalCase` | `FarmPlotService`, `SoilReportRepository` |
| **Backend Functions & Variables** | Python | `snake_case` | `calculate_water_deficit()`, `plot_area` |
| **Backend Constants** | Python | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_SIZE_BYTES`, `DEFAULT_CURRENCY` |
| **Pydantic Schemas** | Python | `PascalCase` | `CropRecommendRequest`, `FarmResponse` |
| **Database Tables** | PostgreSQL | `snake_case` (Plural) | `farm_plots`, `crop_cycles`, `soil_reports` |
| **Database Columns** | PostgreSQL | `snake_case` | `created_at`, `total_acres`, `nitrogen_kg_ha` |
| **Database Keys** | PostgreSQL | `id` / `[entity]_id` | `id`, `farm_id`, `user_id` |
| **Frontend React Components** | React (TSX) | `PascalCase` | `DigitalTwinCanvas.tsx`, `PlotCard.tsx` |
| **Frontend Custom Hooks** | React (TS) | `camelCase` (`use-` prefix)| `useFarmData.ts`, `useTwinScene.ts` |
| **Frontend Functions & Variables** | TypeScript | `camelCase` | `fetchMandiPrices()`, `selectedPlotId` |
| **Frontend Type Interfaces** | TypeScript | `PascalCase` | `FarmPlot`, `CropCycle`, `InventoryItem` |
| **REST API Routes** | HTTP URLs | `kebab-case` (Plural nouns) | `/api/v1/farm-plots`, `/api/v1/crop-cycles` |
| **Git Feature Branches** | Git | `kebab-case` (Member prefix)| `feature/member1-digital-twin` |

---

## 3. Standard Project Directory Structure (Monorepo)

```text
agrimind-ai/
├── .github/
│   └── workflows/              # CI/CD test and linting pipelines
├── documentation/              # 10 Official Architectural & Planning Markdown Documents
├── frontend/                   # React + Vite + TypeScript Client Application
│   ├── public/                 # Static assets (low-poly 3D GLTF models, textures)
│   │   ├── models/             # 3D models (crops, farm structures, implements)
│   │   └── textures/           # Ground textures, heightmaps
│   ├── src/
│   │   ├── assets/             # Global stylesheets (Tailwind)
│   │   ├── components/         # Reusable UI components (Modals, StatCards, Tables)
│   │   ├── modules/            # Member-owned feature modules
│   │   │   ├── digital-twin/   # Member 1: Three.js/R3F canvas, OrbitControls, 2D fallback
│   │   │   ├── crop-intel/     # Member 2: Crop recommendation, soil cards, disease upload
│   │   │   ├── operations/     # Member 3: Finance, inventory, labor, machinery rental
│   │   │   └── assistant/      # Member 4: Chat UI, voice controls, scheme directory
│   │   ├── hooks/              # Shared custom React hooks
│   │   ├── services/           # Axios/Fetch API client wrappers
│   │   ├── types/              # Shared TypeScript interfaces & types
│   │   ├── App.tsx             # Main Application Shell
│   │   └── main.tsx            # Vite React entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                    # FastAPI REST API Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/  # farm.py, crops.py, finance.py, assistant.py
│   │   │       └── router.py   # Aggregated API router
│   │   ├── core/               # Configuration, security, JWT auth, database session
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic & simulation calculation engines
│   │   └── main.py             # FastAPI application entry point
│   ├── alembic/                # Database migration scripts
│   ├── requirements.txt
│   └── Dockerfile
├── ai_services/                # ML Models, Notebooks & Knowledge Ingestion
│   ├── multitask_model/        # Member 2: Central Agricultural Model (PyTorch/Scikit)
│   ├── market_forecasting/     # Member 3: Time-series price models (Prophet/Statsmodels)
│   ├── rag_pipeline/           # Member 4: Document chunking, sentence embeddings
│   ├── notebooks/              # Exploratory data analysis & baseline benchmark notebooks
│   └── data/                   # Verified agricultural datasets (git-ignored)
├── tests/                      # Automated Test Suites
│   ├── backend/                # Pytest API and unit tests
│   ├── frontend/               # Vitest component and hook tests
│   └── ai_services/            # Model inference benchmark tests
├── .env.example                # Canonical environment variable template
├── .gitignore                  # Git ignore rules for node_modules, venv, .env, build/
└── README.md                   # Repository overview and setup instructions
```

---

## 4. Code Formatting & Style Standards

### 4.1 Python Standards (Backend & ML)
- **Formatter:** `Black` (line length: 88 characters).
- **Linter:** `Flake8` or `Ruff` (enforcing PEP 8).
- **Imports:** `isort` (Standard Library $\to$ Third-Party $\to$ Local Application).
- **Type Annotations:** All functions must include Python type hints:
  ```python
  def calculate_water_deficit(
      soil_moisture_pct: float,
      crop_kc: float,
      et0_mm: float
  ) -> float:
      """Calculate required irrigation deficit in millimeters."""
      etc = crop_kc * et0_mm
      deficit = max(0.0, etc - (soil_moisture_pct * 0.1))
      return round(deficit, 2)
  ```

### 4.2 TypeScript & React Standards (Frontend)
- **Formatter:** `Prettier` (semi: true, singleQuote: true, tabWidth: 2, printWidth: 100).
- **Linter:** `ESLint` with `@typescript-eslint` and `react-hooks` plugins.
- **Strict Mode:** `tsconfig.json` must enforce `"strict": true` (no implicit `any`).
- **Async Code:** Prefer `async/await` over promise chains (`.then().catch()`).

---

## 5. Git & GitHub Workflow Standards

### 5.1 Branch Naming Standard
All development branches must use the format: `feature/<member-or-module>-<short-description>`:
- `feature/member1-digital-twin`
- `feature/member2-crop-intelligence`
- `feature/member3-farm-management`
- `feature/member4-ai-assistant`
- `bugfix/member1-raycaster-touch-fix`

### 5.2 Conventional Commits Standard
Commits must follow the **Conventional Commits v1.0.0** specification:
`<type>(<scope>): <short description in present tense>`

Allowed types:
- `feat`: A new feature or endpoint.
- `fix`: A bug fix.
- `docs`: Documentation updates only.
- `style`: Formatting, semicolons, whitespace (no functional logic changes).
- `refactor`: Code restructuring without functional changes.
- `test`: Adding or updating tests.
- `chore`: Tooling, dependencies, or configuration updates.

*Example:*
```text
feat(digital-twin): add Three.js OrbitControls and ground plane geometry
fix(finance): prevent negative numbers in expense amount input
docs(api): document request schema for /crops/recommend
```

### 5.3 Pull Request & Merge Rules
1. Direct commits to `main` and `develop` are prohibited.
2. PRs require at least **one peer review approval** before merging.
3. PRs must pass automated CI checks (linting, tests, schema validation).
4. Use **Squash and Merge** to maintain a clean linear commit history on `develop`.

---

## 6. AI-Generated Code Verification Policy

Because the team utilizes AI assistants and coding agents during development, the following verification rules are mandatory:

> [!WARNING]
> **Mandatory AI Code Verification Rules:**  
> 1. **No Blind Copy-Pasting:** Every line of code generated by an AI assistant must be read, understood, and verified by the responsible team member.
> 2. **Package Compatibility:** Ensure all imported packages exist in `requirements.txt` or `package.json` and match target versions.
> 3. **Security Audits:** Check that AI code does not introduce security vulnerabilities (e.g., raw SQL strings, unhashed passwords, loose CORS, hardcoded API secrets).
> 4. **Testing Obligation:** Any AI-generated business logic must be accompanied by an automated unit or integration test proving correct behavior.
> 5. **Schema Alignment:** Verify that AI code adheres to the project's Pydantic schemas, TypeScript interfaces, and API response envelopes.
