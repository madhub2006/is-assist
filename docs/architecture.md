# IS-Assist System Architecture (Phase 1)
**Tagline:** AI-Powered Indian Standards & Procurement Intelligence

---

## 1. System Overview

**IS-Assist** is an enterprise/government-grade procurement support and technical standards intelligence platform designed for public sector undertakings (PSUs), government departments, and procurement officials.

The platform provides:
- Natural language and structured specification requirement analysis.
- PyMuPDF integration for tender document parsing and text extraction.
- Database-backed Indian Standards (IS) directory with version tracking, gazetted amendments, and normative dependency relationships.
- Prototype recommendation engine and specification readiness scoring (0–100).
- Risk radar identifying incomplete testing parameters, surge protection ratings, and regulatory certification gaps.
- Full role-based access control (Admin, Procurement Officer, Reviewer) and immutable compliance audit logging.

```
+-----------------------------------------------------------------------------------+
|                              REACT FRONTEND (Vite + Tailwind)                      |
|  - Enterprise Light Theme     - Recharts Analytics       - Multi-Tab Analysis      |
|  - Role-Based Routing         - Standards Directory       - Reports & Audit UI     |
+------------------------------------------+----------------------------------------+
                                           |
                                 REST API (JSON / JWT)
                                           |
+------------------------------------------v----------------------------------------+
|                               FASTAPI APPLICATION BACKEND                         |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  |  Auth & RBAC Layer  |  | Mock Analysis Engine |  | PyMuPDF Document Extractor|  |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  +---------------------+  +----------------------+  +---------------------------+  |
|  | Standards Service   |  | Reports & Audit Logs |  | Phase 2 AI Stubs (RAG/Vec)|  |
|  +---------------------+  +----------------------+  +---------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                   SQLAlchemy 2.0 ORM
                                           |
+------------------------------------------v----------------------------------------+
|                          DATABASE LAYER (PostgreSQL / SQLite)                      |
|  - Users & Roles          - Standards & Versions      - Analyses & Requirements    |
|  - Departments            - Amendments & Rel Types    - Findings, Docs, Reports    |
|  - Immutable Audit Logs   - (pgvector ready table)                                |
+-----------------------------------------------------------------------------------+
```

---

## 2. Layered Component Architecture

### 2.1 Backend Design (`backend/app/`)
* **API Layer (`app/api/routes/`)**: Modular FastAPI router definitions handling authentication, users, analyses, requirements, documents, standards, recommendations, findings, reports, audit logs, and dashboard statistics.
* **Core Layer (`app/core/`)**: Configuration settings via `pydantic-settings`, password hashing with direct `bcrypt`, JWT encoding/decoding, and standardized exception handling.
* **Services Layer (`app/services/`)**: Encapsulates business logic:
  - `MockAnalysisService`: Domain-aware heuristic evaluation engine mapping requirements to standard sets and generating structured findings.
  - `DocumentService`: Safe file handling and PyMuPDF text extraction.
  - `StandardsService`: Catalog search and relationship graph traversal.
  - `ReportService`: Structured advisory report generator.
  - `AuditService`: Audit trail logger for all state mutations.
  - `Phase 2 Stubs`: Ready-to-implement extension points for `EmbeddingService`, `RecommendationService`, `RetrievalService`, and `LLMService`.
* **Database Models (`app/models/`)**: SQLAlchemy 2.0 declarative models with `TimestampMixin` and foreign key relationships.

### 2.2 Frontend Design (`frontend/src/`)
* **Design System**: Strict government enterprise aesthetics (Navy brand `#0f172a`, crisp `#ffffff` and `#f8fafc` surfaces, `#16a34a` success, `#d97706` warning, `#dc2626` critical alerts).
* **Component Modularity**: Reusable components (`Button`, `Card`, `Badge`, `StatusBadge`, `ScoreCard`, `MetricCard`, `PrototypeBanner`, `Modal`, `Table`, `Tabs`, `Breadcrumb`).
* **State & Query Management**: React Context (`AuthProvider`, `ToastProvider`), React Router v6, and TanStack Query.

---

## 3. Database Schema Overview

| Table | Primary Role |
|---|---|
| `roles` | RBAC roles (`Admin`, `Procurement Officer`, `Reviewer`) |
| `departments` | Government departments / PSU divisions |
| `users` | User accounts with hashed passwords and role linkages |
| `standards` | Indian Standards registry with category, sector, status, and future embedding placeholder |
| `standard_versions` | Publication years, editions, and revisions |
| `amendments` | Gazetted amendments with dates and descriptions |
| `standard_relationships`| Normative references, safety, test methods, and component linkages |
| `analyses` | Procurement requirements, natural text, JSON specs, and readiness score |
| `analysis_requirements`| Parameter-level items with status (`Provided`, `Missing`, `Needs Review`) |
| `analysis_findings` | Risk notices with severity (`CRITICAL`, `WARNING`, `INFO`, `NEEDS_VERIFICATION`) |
| `recommendations` | Standard matches with relevance percentage and rationale |
| `documents` | Uploaded tender PDF metadata and PyMuPDF extracted text |
| `reports` | Generated advisory summaries and structured briefing data |
| `audit_logs` | Immutable audit trail of all system actions |
