"""Tests for AI Document Intelligence endpoints and services."""

import io
import json
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
import pymupdf as fitz
import pytest

from app.core.config import Settings, settings
from app.main import app
from app.services.document.chunker import chunk_pages
from app.services.document.extractor import PageData, extract_document
from app.services.document.retriever import LightweightRetriever

client = TestClient(app)


def _create_multi_page_pdf() -> bytes:
    doc = fitz.open()
    # Page 1: Introduction
    p1 = doc.new_page(width=300, height=200)
    p1.insert_text((40, 50), "Document Title: Quantum Computing Overview\nAuthor: Dr. Alice Smith", fontsize=12)

    # Page 2: Findings
    p2 = doc.new_page(width=300, height=200)
    p2.insert_text((40, 50), "Section 2: Key Findings\nQuantum entanglement shows 99.8% fidelity in recent tests.", fontsize=12)

    # Page 3: Recommendations
    p3 = doc.new_page(width=300, height=200)
    p3.insert_text((40, 50), "Section 3: Action Items\n1. Upgrade cooling systems to 15 millikelvin.\n2. Calibrate microwave pulses.", fontsize=12)

    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def test_ai_status_unconfigured():
    with patch.object(Settings, "get_api_key", return_value=""):
        response = client.get("/api/ai/status")
        assert response.status_code == 200
        data = response.json()
        assert data["configured"] is False
        assert "not configured yet" in data["message"].lower()


def test_ai_summary_unconfigured_error():
    pdf_bytes = _create_multi_page_pdf()
    files = {"pdf_file": ("test.pdf", pdf_bytes, "application/pdf")}
    with patch.object(Settings, "get_api_key", return_value=""):
        response = client.post("/api/ai/summary", files=files)
        assert response.status_code == 503
        data = response.json()
        assert data["type"] == "AINotConfiguredError"
        assert "API_KEY" in data["detail"]


def test_ai_ask_unconfigured_error():
    pdf_bytes = _create_multi_page_pdf()
    files = {"pdf_file": ("test.pdf", pdf_bytes, "application/pdf")}
    data = {"question": "What is the fidelity?"}
    with patch.object(Settings, "get_api_key", return_value=""):
        response = client.post("/api/ai/ask", files=files, data=data)
        assert response.status_code == 503
        data = response.json()
        assert data["type"] == "AINotConfiguredError"


def test_document_extraction_and_chunking():
    pdf_bytes = _create_multi_page_pdf()
    doc = extract_document(pdf_bytes, filename="test.pdf")
    assert doc.page_count == 3
    assert len(doc.pages) == 3
    assert doc.pages[0].page == 1
    assert "Quantum Computing Overview" in doc.pages[0].text

    chunks = chunk_pages(doc.pages)
    assert len(chunks) >= 3
    # Verify page numbers are preserved on chunks
    assert chunks[0].page == 1
    assert chunks[1].page == 2
    assert chunks[2].page == 3


def test_lightweight_retriever():
    pages = [
        PageData(page=1, text="The solar panel system was installed in June 2024."),
        PageData(page=2, text="Battery storage capacity is rated at 15 kilowatt hours."),
        PageData(page=3, text="Maintenance should be performed annually by certified electricians."),
    ]
    chunks = chunk_pages(pages)
    retriever = LightweightRetriever(chunks)

    results = retriever.retrieve("What is the battery storage capacity?", top_k=2)
    assert len(results) > 0
    # Top result should be from Page 2
    assert results[0].chunk.page == 2
    assert "15 kilowatt hours" in results[0].chunk.text


@pytest.mark.anyio
async def test_ai_summary_mocked_success():
    pdf_bytes = _create_multi_page_pdf()
    mock_ai_json = json.dumps({
        "summary": "This document covers quantum computing overview and fidelity findings.",
        "key_points": ["99.8% fidelity achieved", "Cooling upgrade required"],
        "topics": ["Quantum Computing", "Cooling Systems"],
        "action_items": ["Upgrade cooling to 15mK", "Calibrate pulses"],
    })

    with patch.object(Settings, "get_api_key", return_value="mock_key"):
        with patch("app.services.ai.client.AIClient.chat_completion", new_callable=AsyncMock) as mock_chat:
            mock_chat.return_value = mock_ai_json

            files = {"pdf_file": ("test.pdf", pdf_bytes, "application/pdf")}
            data = {"style": "concise"}
            response = client.post("/api/ai/summary", files=files, data=data)
            assert response.status_code == 200
            res = response.json()
            assert res["success"] is True
            assert "quantum computing" in res["summary"].lower()
            assert len(res["key_points"]) == 2
            assert res["pages_processed"] == 3


@pytest.mark.anyio
async def test_ai_ask_mocked_success():
    pdf_bytes = _create_multi_page_pdf()
    mock_answer = "According to [Page 2], the fidelity achieved in recent tests is 99.8%."

    with patch.object(Settings, "get_api_key", return_value="mock_key"):
        with patch("app.services.ai.client.AIClient.chat_completion", new_callable=AsyncMock) as mock_chat:
            mock_chat.return_value = mock_answer

            files = {"pdf_file": ("test.pdf", pdf_bytes, "application/pdf")}
            data = {"question": "What fidelity was achieved?"}
            response = client.post("/api/ai/ask", files=files, data=data)
            assert response.status_code == 200
            res = response.json()
            assert res["success"] is True
            assert "99.8%" in res["answer"]
            assert len(res["sources"]) > 0
            assert any(s["page"] == 2 for s in res["sources"])


