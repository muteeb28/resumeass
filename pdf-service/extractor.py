"""
PDF-to-Markdown extractor using pymupdf4llm.

Instead of manually reconstructing layout from coordinates, we delegate
to pymupdf4llm which produces clean LLM-friendly markdown with:
- Headings (#, ##, ###)
- Bullet lists
- Bold/italic
- Proper reading order across columns

Then we parse the markdown into structured TextBlocks for section classification.
"""

import re
import fitz  # PyMuPDF
import pymupdf4llm
from typing import List, Tuple
from models import TextBlock

# Patterns for classifying markdown lines
HEADING_RE = re.compile(r"^(#{1,3})\s+(.+)$")
BULLET_RE = re.compile(r"^[\s]*[-*•▪▸►○●◦‣⁃]\s+(.+)$")
NUMBERED_RE = re.compile(r"^[\s]*\d{1,2}[.)]\s+(.+)$")
BOLD_LINE_RE = re.compile(r"^\*\*(.+?)\*\*\s*$")
SEPARATOR_RE = re.compile(r"^[-_=*]{3,}\s*$")
EMPTY_RE = re.compile(r"^\s*$")


def _fitz_fallback_text(pdf_bytes: bytes) -> str:
    """Fallback: extract plain text via PyMuPDF page.get_text() when pymupdf4llm returns nothing."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_text = []
    for page in doc:
        pages_text.append(page.get_text("text"))
    doc.close()
    return "\n".join(pages_text)


def extract_blocks(pdf_bytes: bytes) -> Tuple[List[TextBlock], int, str]:
    """Extract text blocks from PDF via pymupdf4llm markdown conversion."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(doc)
    doc.close()

    # Convert PDF to markdown using pymupdf4llm
    markdown_text = pymupdf4llm.to_markdown(
        fitz.open(stream=pdf_bytes, filetype="pdf")
    )

    # If pymupdf4llm returned nothing, try plain PyMuPDF text extraction as fallback
    if not markdown_text or not markdown_text.strip():
        fallback = _fitz_fallback_text(pdf_bytes)
        if fallback.strip():
            markdown_text = fallback
        else:
            return [], page_count, ""

    # Parse markdown lines into TextBlocks
    all_blocks: list[TextBlock] = []
    lines = markdown_text.split("\n")

    for i, line in enumerate(lines):
        stripped = line.rstrip()

        # Skip empty lines and separators
        if EMPTY_RE.match(stripped) or SEPARATOR_RE.match(stripped):
            continue

        block_type, text, font_size, bold = _classify_markdown_line(stripped)

        if not text.strip():
            continue

        all_blocks.append(TextBlock(
            type=block_type,
            text=text.strip(),
            fontSize=font_size,
            bold=bold,
            x=0,
            y=float(i),  # use line number as y-position proxy
            page=0,
        ))

    return all_blocks, page_count, markdown_text


def _classify_markdown_line(line: str) -> tuple:
    """Classify a markdown line and return (type, cleaned_text, font_size, bold)."""

    # Heading: # Title, ## Title, ### Title
    m = HEADING_RE.match(line)
    if m:
        level = len(m.group(1))
        text = _clean_markdown(m.group(2))
        # H1 = 18pt, H2 = 16pt, H3 = 14pt (approximate)
        size = {1: 18.0, 2: 16.0, 3: 14.0}.get(level, 14.0)
        return "heading", text, size, True

    # Bullet: - item, * item, • item
    m = BULLET_RE.match(line)
    if m:
        text = _clean_markdown(m.group(1))
        return "bullet", text, 11.0, False

    # Numbered list: 1. item, 2) item
    m = NUMBERED_RE.match(line)
    if m:
        text = _clean_markdown(m.group(1))
        return "bullet", text, 11.0, False

    # Bold-only line (often a sub-heading like company name or role)
    m = BOLD_LINE_RE.match(line)
    if m:
        text = m.group(1).strip()
        return "heading", text, 13.0, True

    # Regular line
    text = _clean_markdown(line)
    return "line", text, 11.0, False


def _clean_markdown(text: str) -> str:
    """Remove markdown formatting artifacts from text."""
    # Remove bold markers
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    # Remove italic markers
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"_(.+?)_", r"\1", text)
    # Remove inline code
    text = re.sub(r"`(.+?)`", r"\1", text)
    # Remove link markdown but keep text
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    # Remove image markdown
    text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", text)
    return text.strip()
