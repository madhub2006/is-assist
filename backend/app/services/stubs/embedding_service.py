from typing import List


class EmbeddingService:
    """
    Phase 2 Architecture Extension Point:
    Will integrate SentenceTransformers (e.g. all-MiniLM-L6-v2 or BAAI/bge-base-en-v1.5)
    to generate dense vector embeddings for standards scopes, clauses, and procurement text.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name

    def generate_embedding(self, text: str) -> List[float]:
        """Placeholder for Phase 2 vector generation."""
        # Phase 2 implementation will return 384 or 768 dimensional float vector
        return [0.0] * 384

    def batch_generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Placeholder for Phase 2 batch vector generation."""
        return [[0.0] * 384 for _ in texts]
