import re
from typing import List
from models import TextBlock, Section


# Keyword regex map for section classification
SECTION_PATTERNS = {
    "summary": re.compile(
        r"^(summary|professional\s+summary|executive\s+summary|profile|objective|about(\s+me)?|career\s+summary)$",
        re.IGNORECASE,
    ),
    "experience": re.compile(
        r"^(experience|work\s+experience|professional\s+experience|employment|work\s+history|employment\s+history|career\s+history)$",
        re.IGNORECASE,
    ),
    "education": re.compile(
        r"^(education|academic|academics|academic\s+background|qualifications|education\s*[&and]+\s*training)$",
        re.IGNORECASE,
    ),
    "skills": re.compile(
        r"^(skills|technical\s+skills|core\s+skills|core\s+competencies|competencies|technologies|tech\s+stack|technical\s+expertise|areas?\s+of\s+expertise)$",
        re.IGNORECASE,
    ),
    "projects": re.compile(
        r"^(projects?|portfolio|key\s+projects|notable\s+projects|personal\s+projects|side\s+projects)$",
        re.IGNORECASE,
    ),
    "certifications": re.compile(
        r"^(certifications?|certificates?|licenses?|credentials?)$",
        re.IGNORECASE,
    ),
    "achievements": re.compile(
        r"^(achievements?|awards?|honors?|recognition|accomplishments?)$",
        re.IGNORECASE,
    ),
    "coursework": re.compile(
        r"^(coursework|relevant\s+coursework|undergraduate\s+coursework|courses?)$",
        re.IGNORECASE,
    ),
    "volunteer": re.compile(
        r"^(volunteer(ing|s)?|organizations?|community(\s+service)?|activities|extracurricular(\s+activities)?|leadership|memberships?|clubs?|societies?)$",
        re.IGNORECASE,
    ),
}


def _match_section_type(heading_text: str) -> str | None:
    """Match heading text to a known section type. Returns None if no match."""
    cleaned = re.sub(r"[^a-zA-Z0-9\s&]", "", heading_text).strip()
    if not cleaned:
        return None

    for section_type, pattern in SECTION_PATTERNS.items():
        if pattern.match(cleaned):
            return section_type

    return None


def _is_allcaps_section_candidate(block: TextBlock) -> bool:
    """Return True if a non-heading block looks like an ALL CAPS section header.

    Many resume PDFs render section titles as plain ALL-CAPS text without bold
    or markdown heading markers.  We treat them as headings so they can start
    new sections (e.g. COURSEWORK, ACHIEVEMENTS, TECHNICAL SKILLS).
    """
    if block.type != "line":
        return False
    text = block.text.strip()
    if not text or not text.isupper():
        return False
    words = text.split()
    # Allow 1-4 words, total length ≤ 40 chars, no digits (avoids date lines)
    return 1 <= len(words) <= 4 and len(text) <= 40 and not any(ch.isdigit() for ch in text)


def classify_sections(blocks: List[TextBlock]) -> List[Section]:
    """Group blocks into sections based on heading blocks.

    Only headings that match a known section type start a new section.
    Other headings (role names, project names, company names) stay in the
    current section as content.

    Also detects ALL-CAPS plain-text lines as potential section headers so
    that sections like COURSEWORK and ACHIEVEMENTS are not merged together.
    """
    if not blocks:
        return []

    sections: List[Section] = []
    current_heading = ""
    current_type = "personal_info"
    current_blocks: List[TextBlock] = []

    for block in blocks:
        is_heading = block.type == "heading" or _is_allcaps_section_candidate(block)

        if is_heading:
            matched_type = _match_section_type(block.text)

            if matched_type is not None:
                # This is a known section heading — save current section and start new one
                if current_blocks:
                    raw_text = "\n".join(b.text for b in current_blocks)
                    sections.append(Section(
                        type=current_type,
                        heading=current_heading,
                        rawText=raw_text,
                        blocks=current_blocks,
                    ))

                current_heading = block.text
                current_type = matched_type
                current_blocks = [block]
            elif _is_allcaps_section_candidate(block):
                # Unrecognized ALL-CAPS section heading (e.g. LANGUAGES, INTERESTS, PUBLICATIONS)
                # Treat as its own "extra" section so Mistral sees it separately
                if current_blocks:
                    raw_text = "\n".join(b.text for b in current_blocks)
                    sections.append(Section(
                        type=current_type,
                        heading=current_heading,
                        rawText=raw_text,
                        blocks=current_blocks,
                    ))

                current_heading = block.text
                current_type = "extra"
                current_blocks = [block]
            else:
                # Sub-heading within a section (role name, company name, project name)
                # Keep it in the current section as content
                current_blocks.append(block)
        else:
            current_blocks.append(block)

    # Don't forget the last section
    if current_blocks:
        raw_text = "\n".join(b.text for b in current_blocks)
        sections.append(Section(
            type=current_type,
            heading=current_heading,
            rawText=raw_text,
            blocks=current_blocks,
        ))

    return sections
