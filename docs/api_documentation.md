# IS-Assist API Reference (Phase 1)

Base URL: `/api`  
Interactive Swagger UI: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticate user with email and password.
- **Request Body**:
  ```json
  {
    "email": "officer@isassist.gov.in",
    "password": "Officer@123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user_id": 2,
    "name": "Smt. Priya Nair",
    "email": "officer@isassist.gov.in",
    "role": "Procurement Officer",
    "department": "Department of Urban Development"
  }
  ```

### `GET /api/auth/me`
Retrieve authenticated user profile. Requires Bearer Token.

### `POST /api/auth/change-password`
Update authenticated user's password.

---

## 2. Procurement Analyses Endpoints

### `POST /api/analyses`
Create new procurement requirement analysis and trigger prototype evaluation.
- **Request Body**:
  ```json
  {
    "title": "Procurement of 100W Smart LED Street Lights",
    "product_name": "LED Street Light 100W",
    "category": "Electrical & Electronics",
    "procurement_type": "Goods",
    "quantity": "1200 Units",
    "application_use": "Highway lighting with centralized CCMS",
    "natural_language_input": "We need to procure 1200 units of energy-efficient 100W LED street lights...",
    "run_mock_analysis": true
  }
  ```
- **Response (201 Created)**: Returns created `Analysis` object with calculated `readiness_score` and `is_mock: true`.

### `GET /api/analyses`
List analyses with optional `query`, `department_id`, `status`, `skip`, and `limit` query parameters.

### `GET /api/analyses/{id}`
Retrieve full analysis workspace details, including nested requirements, recommended standards, risk findings, and uploaded document references.

---

## 3. Documents & PyMuPDF Endpoints

### `POST /api/analyses/{analysis_id}/documents`
Upload tender document (`multipart/form-data`). Validates PDF format, extracts text with PyMuPDF, and attaches to analysis.
- **Response (201 Created)**: Returns `Document` metadata, page count, and status.

### `GET /api/documents/{document_id}/download`
Download stored PDF document.

---

## 4. Standards Directory Endpoints

### `GET /api/standards`
Query Indian Standards registry.
- **Query Params**: `query`, `category`, `sector`, `status`, `skip`, `limit`.

### `GET /api/standards/{id}`
Get full standard metadata, version history, amendments, and normative relationships.

---

## 5. Advisory Reports Endpoints

### `POST /api/reports/generate/{analysis_id}`
Compile a structured procurement advisory briefing from an analysis.

### `GET /api/reports`
List compiled procurement reports.

---

## 6. Dashboard & Audit Endpoints

### `GET /api/dashboard/stats`
Retrieve aggregated statistics, monthly activity charts, status distribution, and attention items.

### `GET /api/audit-logs`
Retrieve administrative compliance log events (Admin only).
