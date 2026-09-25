"""Lightweight local retrieval for document chunks using BM25/TF-IDF scoring."""

import math
import re
from dataclasses import dataclass
from typing import List

from app.services.document.chunker import DocumentChunk

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
    "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more",
    "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that",
    "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these",
    "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
    "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while",
    "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd",
    "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
}


def tokenize(text: str) -> list[str]:
    """Tokenize text into lowercase alphanumeric words, filtering stopwords."""
    words = re.findall(r"\b[a-zA-Z0-9_\-\u0900-\u097F]+\b", text.lower())
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]


@dataclass
class ScoredChunk:
    chunk: DocumentChunk
    score: float


class LightweightRetriever:
    """In-memory BM25 retrieval index for document chunks."""

    def __init__(self, chunks: list[DocumentChunk]):
        self.chunks = chunks
        self.num_chunks = len(chunks)
        self.tokenized_chunks = [tokenize(c.text) for c in chunks]
        self.chunk_lengths = [len(tokens) for tokens in self.tokenized_chunks]
        self.avg_dl = (
            sum(self.chunk_lengths) / max(1, self.num_chunks) if self.num_chunks > 0 else 1.0
        )

        # Inverted index: term -> list of chunk indices containing term
        self.doc_freqs: dict[str, int] = {}
        for tokens in self.tokenized_chunks:
            seen_terms = set(tokens)
            for term in seen_terms:
                self.doc_freqs[term] = self.doc_freqs.get(term, 0) + 1

    def retrieve(self, query: str, top_k: int = 5) -> list[ScoredChunk]:
        """Rank and return top_k chunks matching the query using BM25 scoring."""
        if not self.chunks:
            return []

        query_tokens = tokenize(query)
        if not query_tokens:
            # Fallback to first chunks if query has no tokens
            return [ScoredChunk(chunk=c, score=1.0) for c in self.chunks[:top_k]]

        k1 = 1.5
        b = 0.75
        scores = [0.0] * self.num_chunks

        for term in query_tokens:
            df = self.doc_freqs.get(term, 0)
            if df == 0:
                continue

            # Standard BM25 IDF
            idf = math.log(1.0 + (self.num_chunks - df + 0.5) / (df + 0.5))

            for i, tokens in enumerate(self.tokenized_chunks):
                tf = tokens.count(term)
                if tf == 0:
                    continue

                dl = self.chunk_lengths[i]
                numerator = tf * (k1 + 1.0)
                denominator = tf + k1 * (1.0 - b + b * (dl / self.avg_dl))
                scores[i] += idf * (numerator / denominator)

        # Boost exact phrase match if query has multiple words
        clean_q = query.strip().lower()
        if len(query_tokens) > 1 and len(clean_q) > 4:
            for i, chunk in enumerate(self.chunks):
                if clean_q in chunk.text.lower():
                    scores[i] += 5.0

        # Sort by score descending
        ranked_indices = sorted(
            range(self.num_chunks),
            key=lambda idx: scores[idx],
            reverse=True,
        )

        results: list[ScoredChunk] = []
        for idx in ranked_indices[:top_k]:
            results.append(ScoredChunk(chunk=self.chunks[idx], score=round(scores[idx], 4)))

        # If highest score is 0.0 (no overlap with query tokens), return first chunks with 0 score
        if results and results[0].score == 0.0:
            return [ScoredChunk(chunk=c, score=0.0) for c in self.chunks[:top_k]]

        return results
