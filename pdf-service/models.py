from pydantic import BaseModel
from typing import List, Optional


class TextBlock(BaseModel):
    type: str  # "heading", "bullet", "line"
    text: str
    fontSize: float
    bold: bool
    x: float
    y: float
    page: int


class Section(BaseModel):
    type: str  # "personal_info", "summary", "experience", "education", "skills", "projects", "certifications", "achievements", "coursework", "unknown"
    heading: str
    rawText: str
    blocks: List[TextBlock]


class ExtractResponse(BaseModel):
    blocks: List[TextBlock]
    sections: List[Section]
    rawText: str
    pageCount: int
