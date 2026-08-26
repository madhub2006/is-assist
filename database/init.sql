-- ==========================================================
-- IS-Assist Database Initialization Script (PostgreSQL)
-- AI-Powered Indian Standards & Procurement Intelligence
-- ==========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Phase 2 semantic search extension. The application falls back to SQLite/local
-- deterministic embeddings when PostgreSQL or pgvector is not available.
CREATE EXTENSION IF NOT EXISTS vector;

-- Standard database comments
COMMENT ON DATABASE is_assist IS 'IS-Assist: AI-Powered Indian Standards & Procurement Intelligence Platform';
