"""Page-aware document chunking for retrieval and summarization."""

from dataclasses import dataclass
from typing import List

from app.services.document.extractor import PageData


@dataclass
class DocumentChunk:
    chunk_id: int
    page: int
    text: str
    word_count: int


def chunk_pages(
    pages: list[PageData],
    target_words_per_chunk: int = 400,
    overlap_words: int = 50,
) -> list[DocumentChunk]:
    """Convert page-aware extracted text into structured, page-tagged document chunks."""
    chunks: list[DocumentChunk] = []
    chunk_counter = 0

    for page_data in pages:
        text = page_data.text.strip()
        if not text:
            continue

        words = text.split()
        if len(words) <= target_words_per_chunk + 50:
            # Single chunk for this page
            chunk_counter += 1
            chunks.append(
                DocumentChunk(
                    chunk_id=chunk_counter,
                    page=page_data.page,
                    text=text,
                    word_count=len(words),
                )
            )
        else:
            # Split page into overlapping chunks while retaining the same page number
            start = 0
            step = max(1, target_words_per_chunk - overlap_words)
            while start < len(words):
                chunk_slice = words[start : start + target_words_per_chunk]
                chunk_text = " ".join(chunk_slice)
                chunk_counter += 1
                chunks.append(
                    DocumentChunk(
                        chunk_id=chunk_counter,
                        page=page_data.page,
                        text=chunk_text,
                        word_count=len(chunk_slice),
                    )
                )
                start += step

    return chunks
