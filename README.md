# IS-Assist

### **"AI-Powered Indian Standards & Procurement Intelligence"**

**IS-Assist** is a specialized procurement intelligence platform engineered for government departments, Public Sector Undertakings (PSUs), and procurement agencies. It assists procurement officials in analyzing tender specifications, detecting technical and regulatory gaps, and mapping applicable Indian Standards (IS).

> [!NOTE]
> **PHASE 1 FOUNDATION**: This release establishes the complete enterprise application foundation, database architecture, authentication system, PyMuPDF document extraction, standards directory, mock analysis engine, and reporting workflow. Advanced neural embeddings, pgvector, and LLM reasoning will be introduced in Phase 2.

---

## Key Features Built in Phase 1

1. **Enterprise Design System**:
   - Clean, professional light theme matching government/enterprise portal aesthetics.
   - Recharts visual analytics (Activity line chart, Status donut chart, Specification readiness bar chart).
   - Responsive collapsible navigation shell with RBAC-filtered links.

2. **Role-Based Authentication & Access Control**:
   - JWT token-based authentication with bcrypt password hashing.
   - Roles: `Admin`, `Procurement Officer`, and `Reviewer`.
   - Immutable audit logging for logins, analysis runs, document uploads, and report generation.

3. **Multi-Tab Procurement Analysis Workflow**:
   - **Tab 1: Product Requirement**: Natural language input with domain category classification.
   - **Tab 2: Technical Specifications**: Modular structured form fields for dimensions, performance, safety, and testing.
   - **Tab 3: Tender Document Upload**: Drag & Drop PDF upload with file size validation and PyMuPDF text extraction.

4. **Analysis Workspace & Readiness Scoring**:
   - **Overview**: 0–100 Specification Readiness rating gauge and completeness breakdown.
   - **Requirements**: Granular parameter tracking with status indicators (`Provided`, `Missing`, `Needs Review`).
   - **Standards (IS)**: Algorithmic standard recommendations with match relevance %, rationale, and verification status.
   - **Findings & Risks**: Severity-coded cards (`CRITICAL`, `WARNING`, `INFO`, `NEEDS_VERIFICATION`) with actionable recommendations.
   - **Documents**: Uploaded PDF archive and PyMuPDF raw text inspector modal.
   - **Activity**: Historical audit timeline.

5. **Indian Standards (IS) Directory**:
   - Searchable catalog with category and sector filters.
   - Detailed standard view (`/standards/:id`) with scopes, version history, amendments, and normative dependency relationships.
   - Clear Phase 2 extension points for Semantic Relevance and Relationship Graph visualizers.

6. **Procurement Advisory Reports**:
   - One-click advisory report compilation with printable executive summary modal.

7. **System Administration**:
   - User account provisioning, editing, and deactivation.
   - Full compliance audit trail log viewer with action filters.

---

## Seed Demo Accounts

| Role | Email | Password | Department |
|---|---|---|---|
| **Admin** | `admin@isassist.gov.in` | `Admin@123456` | Ministry of Power & Energy |
| **Procurement Officer** | `officer@isassist.gov.in` | `Officer@123456` | Department of Urban Development |
| **Reviewer** | `reviewer@isassist.gov.in` | `Reviewer@123456` | Public Works Department |

*(Clickable demo account autofill buttons are built directly into the login screen).*

---

## Technology Stack

### Frontend
- **Framework**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State/Query**: TanStack Query v5 + Context API
- **Animations**: Framer Motion

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM & DB**: SQLAlchemy 2.0 + Alembic migrations
- **Validation**: Pydantic v2 + Pydantic-Settings
- **Security**: JWT (`python-jose`), bcrypt hashing
- **PDF Extraction**: PyMuPDF (`fitz`)
- **Testing**: Pytest + HTTPX TestClient

### Database
- **Primary**: PostgreSQL (pgvector schema ready)
- **Zero-Config Dev**: SQLite fallback supported out-of-the-box

---

## Folder Structure

```
is-assist/
├── backend/
│   ├── alembic/              # Alembic database migrations
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/       # Auth, Users, Analyses, Standards, Documents, Reports, Audit, Dashboard
│   │   │   ├── api.py        # API router aggregator
│   │   │   └── deps.py       # JWT auth & RBAC dependencies
│   │   ├── core/             # Settings, security, standardized exceptions
│   │   ├── database/         # Sessionmaker, DeclarativeBase, mixins
│   │   ├── models/           # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── services/         # Business logic & MockAnalysisService
│   │   │   └── stubs/        # Phase 2 Extension Stubs (Embedding, RAG, LLM)
│   │   ├── utils/            # PyMuPDF extractor, safe file storage
│   │   └── main.py           # FastAPI entrypoint & CORS
│   ├── tests/                # Automated pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Common UI, Layout, Dashboard, Analysis, Standards
│   │   ├── pages/            # Login, Dashboard, NewAnalysis, AnalysisDetail, Standards, Reports, Admin
│   │   ├── hooks/            # useAuth, useToast
│   │   ├── services/         # Axios API clients
│   │   ├── lib/              # Utils, constants, theme colors
│   │   ├── App.jsx           # Application routing shell
│   │   └── index.css         # Enterprise Tailwind styling
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── database/
│   ├── init.sql              # PostgreSQL initialization script
│   └── seed_data.py
├── docs/
│   ├── architecture.md       # Detailed technical architecture
│   ├── api_documentation.md  # REST API specification
│   └── phase2_roadmap.md     # Phase 2 AI & Vector roadmap
├── scripts/
│   └── seed_database.py      # Database seeder script
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started Locally

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial roles, demo standards, and test accounts
python ../scripts/seed_database.py

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The backend will be live at `http://127.0.0.1:8000`.
Interactive API documentation:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Running the Automated Test Suite

```bash
# Run backend pytest suite from the project root
pytest backend/tests -v
```

---

## Running with Docker Compose

To start the complete multi-container stack (PostgreSQL, FastAPI Backend, Nginx Frontend):

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

## Deploying to GitHub, Railway, and Vercel

The repository includes `backend/railway.json` and `frontend/vercel.json`.

1. Push this project to GitHub.
2. In Railway, create a PostgreSQL service and enable pgvector, then create a service from the GitHub repository with root directory `backend`.
3. Set Railway variables: `DATABASE_URL`, `SECRET_KEY`, `ENVIRONMENT=production`, `EMBEDDING_MODEL=all-MiniLM-L6-v2`, and optional `LLM_API_KEY`, `LLM_MODEL`, and `LLM_API_URL`.
4. Deploy the backend and copy its public URL.
5. In Vercel, import the same repository with root directory `frontend`.
6. Set Vercel variable `VITE_API_URL` to the Railway URL plus `/api`.
7. Add the Vercel URL to Railway `BACKEND_CORS_ORIGINS` and redeploy the backend.

The application uses clearly marked demo standards and accounts. Replace demo data with an authoritative source before official procurement use.

---

## Phase 2 Roadmap

Phase 1 establishes the complete application shell and data architecture. In **Phase 2**, the following capabilities will be enabled via the prepared service stubs:

1. **Sentence Transformers & pgvector**: Dense vector generation for Indian Standard scopes and individual clauses.
2. **Hybrid RAG Pipeline**: Keyword BM25 + Vector cosine similarity retrieval with cross-encoder reranking.
3. **LLM Reasoning Layer**: Automated tender clause gap analysis and interactive procurement Q&A.
4. **Standard Relationship Graph**: Interactive dependency mapping for multi-part standard hierarchies.
