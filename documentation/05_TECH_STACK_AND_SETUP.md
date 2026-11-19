# 05. Technology Stack & Local Development Setup — AgriMind AI

## Document Information
- **Project Name:** AgriMind AI
- **Document Version:** 2.0.0 (Architecture Finalization Specification)
- **Status:** Finalized Proposed Development Stack
- **Target OS:** Windows 10 / Windows 11 (Development Baseline)
- **Target Audience:** All Team Members, Evaluators, and AI Coding Agents

---

## 1. Finalized Technology Stack Specification

The development stack for AgriMind AI has been finalized as detailed below. All members will use this unified stack to ensure consistency across modules.

### 1.1 Digital Twin & 3D Technologies

| Technology | Purpose | Technical Justification | Status |
| :--- | :--- | :--- | :---: |
| **Three.js** | Core 3D Graphics Library | Industry-standard WebGL abstraction; handles scene graph, geometry, and shaders. | **Finalized** |
| **React Three Fiber (R3F)** | React Renderer for Three.js | Declarative, component-based 3D scene construction with native React state binding. | **Finalized** |
| **@react-three/drei** | Three.js Helper Library | Pre-configured camera controls, loaders, procedural terrain, and environment helpers. | **Finalized** |
| **WebGL 2.0** | Hardware-Accelerated Rendering | Native GPU acceleration rendering terrain, plot polygons, and plants at interactive rates. | **Finalized** |
| **GLTF / GLB Models** | 3D Asset Format | Efficient Khronos Group binary standard packing geometry, textures, and growth stages. | **Finalized** |
| **OrbitControls** | Camera Navigation | Smooth panning, zooming, and rotation with constrained azimuth/polar angles. | **Finalized** |

> [!CAUTION]
> **WebGL vs. CSS 3D Clarification:**  
> The CSS 3D effects (`transform-style: preserve-3d`) in `agrimind_ai_frontend_v5.html` serve strictly as a preliminary prototype. Production builds will render exclusively inside a WebGL `<canvas>` via **Three.js and React Three Fiber**.

---

### 1.2 Frontend Application Technologies

| Technology | Purpose | Technical Justification | Status |
| :--- | :--- | :--- | :---: |
| **React 18+** | UI Component Framework | Reactive state management, declarative component hierarchy, and seamless Three.js integration. | **Finalized** |
| **Vite** | Build Tool & Dev Server | Fast ES module Hot Module Replacement (HMR) and optimized production bundling. | **Finalized** |
| **TypeScript** | Type-Safe JavaScript | Compile-time interface validation, reducing runtime errors and improving API data handling. | **Finalized** |
| **Tailwind CSS** | Utility-First Styling | Rapid responsive UI styling matching prototype design with clean design tokens. | **Finalized** |
| **Lucide React** | Iconography | Lightweight, consistent SVG icon set for agricultural dashboards. | **Finalized** |
| **Web Speech API** | Vernacular Voice Interface | Native browser speech recognition (`webkitSpeechRecognition`) and speech synthesis. | **Finalized** |
| **Dexie.js / IndexedDB** | Offline Client Storage | In-browser database for offline farm profiles, crop calendars, and queued field logs. | **Finalized** |

---

### 1.3 Backend & API Technologies

| Technology | Purpose | Technical Justification | Status |
| :--- | :--- | :--- | :---: |
| **Python 3.10+** | Programming Language | Standard language for AI, data science, and modern async web frameworks. | **Finalized** |
| **FastAPI** | REST API Web Framework | High-speed async endpoints, automatic OpenAPI documentation, and native Python ML interoperability. | **Finalized** |
| **Pydantic v2** | Data Validation & Serialization | Strict schema enforcement, compile-time validation, and fast JSON serialization. | **Finalized** |
| **SQLAlchemy 2.0** | Relational ORM | Robust mapping of domain entities to PostgreSQL tables with relationship management. | **Finalized** |
| **Alembic** | Database Migrations | Version-controlled schema migrations for team-wide database consistency. | **Finalized** |
| **Python-Jose / PyJWT** | Authentication | Stateless JSON Web Token generation and validation with role claims (`FARMER`, `ADMIN`). | **Finalized** |

---

### 1.4 Database & Persistence Technologies

| Technology | Purpose | Technical Justification | Status |
| :--- | :--- | :--- | :---: |
| **PostgreSQL 15+** | Primary Relational Database | ACID compliance, transactional integrity (finances, inventory, labor), and JSONB support. | **Finalized** |
| **pgvector** | Vector Search Extension | Direct high-dimensional vector similarity search in PostgreSQL, eliminating a separate vector DB. | **Finalized** |
| **Local Disk / Cloud S3** | Object Storage | Local filesystem (in development) and S3 bucket (in production) for photos and GLTF assets. | **Finalized** |

---

### 1.5 Machine Learning & Artificial Intelligence Technologies

| Technology | Purpose | Technical Justification | Status |
| :--- | :--- | :--- | :---: |
| **Scikit-learn** | Classical Tabular ML | Efficient Random Forest and preprocessing baselines for crop suitability and soil classification. | **Finalized** |
| **XGBoost** | Gradient Boosted Trees | High-performance tabular regression and classification; benchmark baseline for multi-task ML. | **Finalized** |
| **PyTorch 2.0+** | Multi-Task Deep Learning | Used only when genuinely necessary for experimental shared-backbone multi-task networks. | **Finalized** |
| **Statsmodels / Prophet** | Time-Series Forecasting | Specialized time-series models for forecasting APMC mandi commodity modal price trends. | **Finalized** |
| **Google Gemini API** | Central Agentic AI Core | High-speed reasoning with native function/tool calling over approved FastAPI endpoints. | **Finalized** |
| **Sentence-Transformers** | Dense Text Embeddings | Hugging Face models (`all-MiniLM-L6-v2`) for generating vector embeddings for RAG and Farm Memory. | **Finalized** |
| **Disease Detection API** | Leaf Disease Diagnosis | Predecessor CNN vision service (`Existing Integration – Pending Audit`). | **Finalized** |

*Note on Agent Orchestration:* The AI Assistant will use **native Gemini tool calling** initially. **LangGraph** may be introduced later if complex, stateful multi-step agent workflows require it.

---

### 1.6 Deployment Technologies

| Component | Target Platform | Justification | Status |
| :--- | :--- | :--- | :---: |
| **Frontend** | **Vercel** | Automated Git-triggered builds, global CDN edge caching, optimized for React+Vite. | **Finalized** |
| **Backend** | **Railway** | Simple containerized Python hosting with native environment variable management and persistent logging. | **Finalized** |
| **Database** | **PostgreSQL on Railway / Supabase** | Managed PostgreSQL instance with built-in `pgvector` extension support. | **Finalized** |

---

## 2. Local Development Setup (Windows 10 / 11)

### 2.1 Prerequisites Installation

1. **Node.js (LTS v20+):**
   - Download installer from [nodejs.org](https://nodejs.org/). Ensure `Add to PATH` is selected.
   - Verify: `node -v` and `npm -v`.

2. **Python (v3.10 or v3.11):**
   - Download installer from [python.org](https://www.python.org/).
   - **Crucial:** Check **"Add python.exe to PATH"** before installing.
   - Verify: `python --version` and `pip --version`.

3. **Git for Windows:**
   - Download installer from [git-scm.com](https://git-scm.com/).
   - Configure identity:
     ```powershell
     git config --global user.name "Your Name"
     git config --global user.email "your.email@example.com"
     ```

4. **PostgreSQL 15+ with pgvector:**
   - Install PostgreSQL 15+ from [enterprisedb.com](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
   - Set password for superuser `postgres` (default port: `5432`).
   - Enable `pgvector` extension in your database:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```

---

### 2.2 Frontend Project Setup (React + Vite + TypeScript)

```powershell
# Navigate to project root
cd c:\Users\HP\OneDrive\Desktop\"AgriMind AI"

# Scaffold React + Vite + TypeScript application
npm create vite@latest frontend -- --template react-ts

cd frontend
npm install

# Install 3D Digital Twin dependencies
npm install three @types/three @react-three/fiber @react-three/drei

# Install UI, Icons, and Utility libraries
npm install lucide-react clsx tailwind-merge dexie

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start local dev server
npm run dev
```

---

### 2.3 Backend Virtual Environment Setup (FastAPI + Python)

```powershell
# Navigate to backend directory
cd c:\Users\HP\OneDrive\Desktop\"AgriMind AI"\backend

# Create dedicated virtual environment
python -m venv venv

# Activate virtual environment in PowerShell
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip setuptools wheel
```

#### Finalized `requirements.txt`
```text
# Web Framework & API
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
python-multipart>=0.0.9
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4

# Database & ORM
psycopg2-binary>=2.9.9
sqlalchemy>=2.0.28
alembic>=1.13.1
pgvector>=0.2.5

# Machine Learning & Tabular Analytics
numpy>=1.26.0
pandas>=2.2.0
scikit-learn>=1.4.0
xgboost>=2.0.3
joblib>=1.3.2

# Time-Series Forecasting
statsmodels>=0.14.1
prophet>=1.1.5

# Deep Learning (Only when genuinely necessary for multi-task model)
torch>=2.2.0 --index-url https://download.pytorch.org/whl/cpu

# AI Assistant, Embeddings & RAG
google-generativeai>=0.4.0
sentence-transformers>=2.5.1

# HTTP Clients & Utilities
httpx>=0.27.0
requests>=2.31.0
python-dotenv>=1.0.1
```

Install packages inside the virtual environment:
```powershell
pip install -r requirements.txt
```

---

### 2.4 Environment Variables Template (`.env.example`)

Create a `.env` file in the `backend/` directory:

```ini
# Application Configuration
APP_NAME="AgriMind AI API"
APP_ENV="development"
DEBUG=True
PORT=8000
SECRET_KEY="temporary-local-insecure-dev-secret-key-change-in-prod"
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Relational Database (PostgreSQL with pgvector)
DB_HOST="localhost"
DB_PORT=5432
DB_USER="postgres"
DB_PASSWORD="your_postgres_password"
DB_NAME="agrimind_db"

# LLM Core (Google Gemini API)
GEMINI_API_KEY="your-gemini-api-key-here"

# Existing Disease Detection API (Pending Audit)
DISEASE_API_URL="http://localhost:5000/api/v1/diagnose"
DISEASE_API_KEY="your-disease-api-key-if-required"

# External Meteorological & Market Feeds
WEATHER_API_KEY="your-openweathermap-api-key"
MANDI_API_KEY="your-data-gov-in-api-key"

# Storage
MEDIA_UPLOAD_DIR="./uploads"
```
