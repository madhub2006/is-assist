# IS-Assist Phase 2 Technical Roadmap

This roadmap outlines how **Phase 2** builds directly on top of the **Phase 1** foundation without requiring architecture rewrites.

---

## 1. Sentence Transformers & pgvector Embedding Pipeline

In Phase 1, the `standards` table includes `embedding_placeholder`, and `app/services/stubs/embedding_service.py` provides the interface definition.

### Phase 2 Implementation Steps:
1. **Enable pgvector extension**:
   ```sql
   CREATE EXTENSION vector;
   ALTER TABLE standards ADD COLUMN embedding vector(384);
   ```
2. **Embedding Model Integration**:
   - Integrate `sentence-transformers` (`BAAI/bge-base-en-v1.5` or `all-MiniLM-L6-v2`) in `app/services/embedding_service.py`.
   - Implement background chunking and embedding generation for full standard scopes and individual clauses.
3. **Cosine Similarity Index**:
   ```sql
   CREATE INDEX ON standards USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   ```

---

## 2. Hybrid Retrieval-Augmented Generation (RAG)

In Phase 1, `app/services/stubs/retrieval_service.py` defines the retrieval contract.

### Phase 2 Implementation Steps:
1. **Hybrid Search**:
   - Combine PostgreSQL full-text search (BM25) with pgvector cosine distance:
   $$\text{Score} = \alpha \cdot \text{VectorScore} + (1 - \alpha) \cdot \text{BM25Score}$$
2. **Re-ranking**:
   - Cross-encoder reranking with `bge-reranker-large` for top-20 retrieved standard clauses.
3. **Context Construction**:
   - Feed top retrieved standard clauses into the LLM prompt context window.

---

## 3. LLM Reasoning Layer & Clause Gap Detection

In Phase 1, `app/services/stubs/ai_services.py` defines the LLM interface.

### Phase 2 Implementation Steps:
1. **Tender Compliance Checking**:
   - Compare tender requirement parameters against mandatory Indian Standard clauses.
   - Detect missing testing methods (e.g. surge withstand, hydrostatic test, fire retardancy).
2. **Interactive Procurement Assistant**:
   - Conversational assistant grounded exclusively in BIS standard references with exact clause citations.

---

## 4. Standard Relationship Graph Intelligence

- In Phase 1, `standard_relationships` tracks normative dependencies and test methods.
- In Phase 2, an interactive graph visualizer (using D3.js or React Force Graph) will allow officers to explore multi-level standard hierarchies.
