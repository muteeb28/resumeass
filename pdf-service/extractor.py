import fitz  # PyMuPDF
import pymupdf4llm
from typing import Tuple


def extract_text(pdf_bytes: bytes) -> Tuple[str, int]:
    """Extract raw text from PDF via pymupdf4llm markdown conversion."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(doc)
    doc.close()

    markdown_text = pymupdf4llm.to_markdown(
        fitz.open(stream=pdf_bytes, filetype="pdf")
    )

    return markdown_text.strip(), page_count
