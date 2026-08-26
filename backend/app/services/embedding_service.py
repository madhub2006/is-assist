import hashlib
import math
import os
import re
from typing import Iterable, List


class EmbeddingService:
    """Configurable embeddings with a deterministic dependency-free fallback."""

    model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    _model = None

    @classmethod
    def _load_model(cls):
        if cls._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                cls._model = SentenceTransformer(cls.model_name)
            except (ImportError, OSError, RuntimeError):
                cls._model = False
        return cls._model

    @staticmethod
    def _fallback(text: str, dimensions: int = 384) -> List[float]:
        values = [0.0] * dimensions
        tokens = re.findall(r"\w+", (text or "").lower(), flags=re.UNICODE)
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % dimensions
            values[index] += 1.0
        norm = math.sqrt(sum(value * value for value in values)) or 1.0
        return [round(value / norm, 8) for value in values]

    @classmethod
    def generate_embedding(cls, text: str) -> List[float]:
        model = cls._load_model()
        if model:
            return [float(value) for value in model.encode(text or "", normalize_embeddings=True)]
        return cls._fallback(text)

    @classmethod
    def batch_generate_embeddings(cls, texts: Iterable[str]) -> List[List[float]]:
        return [cls.generate_embedding(text) for text in texts]