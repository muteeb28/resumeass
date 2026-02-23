/**
 * DYNAMIC RESUME PARSER
 * 
 * A completely new approach that:
 * 1. Auto-detects ANY section header (no hardcoding)
 * 2. Preserves ALL content from the resume
 * 3. Intelligently classifies and parses section content
 */

// ============================================================================
// SHARED PATTERNS
// ============================================================================

const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[a-z]*\.?\s*['’]?\d{2,4}|\b\d{4}|\bpresent\b|\bcurrent\b/gi;
const titleKeywords = /\b(engineer|developer|manager|director|lead|senior|junior|analyst|consultant|specialist|architect|designer|intern|associate|coordinator|administrator|executive|officer|head|vp|chief|president|founder|ceo|cto|cfo|stack|mobile|frontend|backend|full\s*stack|scientist|researcher|fellow)\b/i;
const bulletPattern = /^[\x2D\u2022\u25CF\u25CB\u25E6\u25AA\u25B8\u25BA\u2713\u2714\u2192\u2043\u2219\u00B7\x2A]\s*/;
const sectionKeywords = /\b(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|PUBLICATIONS|LANGUAGES|VOLUNTEER|INTERESTS|PROFILE|OBJECTIVE|ABOUT|CONTACT|WORK|HISTORY|EMPLOYMENT|ACADEMIC|QUALIFICATIONS|COMPETENCIES|TECHNOLOGIES|PORTFOLIO|RECITAL|CONTOUR|COMMUNITY|SOCIAL|ACTIVITY|ACTIVITIES|CO-CURRICULAR|CURRICULAR|EXTRA-CURRICULAR)\b/i;

/**
 * PHASE 1: Feature Extraction
 * Analyzes a line and returns its structural characteristics
 */
function extractLineFeatures(line, index, allLines) {
    const trimmed = line.trim();
    if (!trimmed) return { isEmpty: true, text: "", index };

    const words = trimmed.split(/\s+/);
    const leadingSpaces = line.match(/^\s*/)[0].length;

    return {
        index,
        text: trimmed,
        length: trimmed.length,
        wordCount: words.length,
        leadingSpaces,
        isAllCaps: trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed),
        isTitleCase: words.every(w => /^[A-Z(]/.test(w)) && !(trimmed === trimmed.toUpperCase()),
        isBullet: bulletPattern.test(trimmed),
        hasDates: datePattern.test(trimmed),
        hasTitleKeyword: titleKeywords.test(trimmed),
        hasSectionKeyword: sectionKeywords.test(trimmed),
        endsWithColon: trimmed.endsWith(':'),
        hasPipes: trimmed.includes('|'),
        hasCommaDensity: (trimmed.match(/,/g) || []).length > 2,
        isContact: isContactInfoLine(trimmed)
    };
}

/**
 * PHASE 2: Boundary Scoring
 * Calculates a confidence score (0-1) that a line is a section boundary/header
 */
function calculateBoundaryScore(features, prevFeatures, nextFeatures) {
    if (features.isEmpty) return 0;

    let score = 0;
    const signals = [];

    // Positive Signals
    if (features.hasSectionKeyword) { score += 10; signals.push("keyword_match"); }
    if (features.isAllCaps) { score += 4; signals.push("all_caps"); }
    if (features.endsWithColon) { score += 5; signals.push("ends_with_colon"); }
    if (features.length < 35 && features.wordCount <= 4 && features.length > 3) { score += 3; signals.push("short_line"); }
    if (features.isTitleCase && features.length > 5) { score += 2; signals.push("title_case"); }

    // Spacing signals
    if (!prevFeatures || prevFeatures.isEmpty) { score += 2; signals.push("spacing_before"); }
    if (!nextFeatures || nextFeatures.isEmpty) { score += 1; signals.push("spacing_after"); }

    // Negative Signals (Anti-Header)
    if (features.hasDates) { score -= 12; signals.push("anti_has_dates"); }
    if (features.isBullet) { score -= 10; signals.push("anti_is_bullet"); }
    if (features.isContact) { score -= 15; signals.push("anti_is_contact"); }
    if (features.length > 80) { score -= 15; signals.push("anti_too_long"); }
    if (features.hasCommaDensity || features.hasPipes) { score -= 5; signals.push("anti_list_density"); }
    if (/^[a-z]/.test(features.text)) { score -= 5; signals.push("anti_lowercase_start"); }
    if (/^(gpa|graduated|education|degree)/i.test(features.text)) { score -= 8; signals.push("anti_content_keywords"); }

    // Social media noise labels (e.g. "Profile Email LinkedIn")
    const lower = features.text.toLowerCase();
    const noiseKeywords = ['profile', 'email', 'twitter', 'github', 'linkedin', 'contact', 'website', 'portfolio'];
    const noiseMatches = noiseKeywords.filter(k => lower.includes(k));
    if (noiseMatches.length >= 3 && features.length < 100) {
        score -= 20;
        signals.push("anti_noise_labels");
    }

    // Normalize score (0 to 10 scale mapping to 0 to 1)
    // A score of 8+ is very likely a header
    const confidence = Math.max(0, Math.min(1, score / 12));

    return {
        confidence,
        score,
        signals
    };
}

/**
 * PHASE 3: Structural Grouping
 * Segments the document into blocks based on boundary scores
 */
function segmentDocument(lines) {
    const featureLines = lines.map((l, i) => extractLineFeatures(l, i, lines));
    const segments = [];

    // Initial segment for anything before the first header (usually Personal Info)
    let currentSegment = { header: null, blocks: [], boundary: null };

    for (let i = 0; i < featureLines.length; i++) {
        const features = featureLines[i];

        // Always preserve whitespace (Exhaustiveness invariant)
        if (features.isEmpty) {
            currentSegment.blocks.push(features);
            continue;
        }

        const prev = featureLines[i - 1];
        const next = featureLines[i + 1];
        const boundary = calculateBoundaryScore(features, prev, next);

        // If we hit a high-confidence boundary, start a new segment
        // Threshold 0.6 is a good balance for structural breaks
        if (boundary.confidence >= 0.65) {
            if (currentSegment.header || currentSegment.blocks.some(b => !b.isEmpty)) {
                segments.push(currentSegment);
            }
            currentSegment = { header: features, blocks: [], boundary };
        } else {
            currentSegment.blocks.push(features);
        }
    }

    if (currentSegment.header || currentSegment.blocks.some(b => !b.isEmpty)) {
        segments.push(currentSegment);
    }

    // Detect structure for each segment
    return segments.map(seg => ({
        ...seg,
        structureType: detectStructureType(seg.blocks)
    }));
}

/**
 * Detects the structural nature of a block collection
 */
function detectStructureType(blocks) {
    const nonEmpty = blocks.filter(b => !b.isEmpty);
    if (nonEmpty.length === 0) return "EmptyBlock";

    const hasBullets = nonEmpty.some(b => b.isBullet);
    const bulletRatio = nonEmpty.filter(b => b.isBullet).length / nonEmpty.length;
    const dateRatio = nonEmpty.filter(b => b.hasDates).length / nonEmpty.length;
    const titleRatio = nonEmpty.filter(b => b.hasTitleKeyword).length / nonEmpty.length;
    const denseRatio = nonEmpty.filter(b => b.hasCommaDensity || b.hasPipes).length / nonEmpty.length;
    const textAvgLength = nonEmpty.reduce((sum, b) => sum + b.length, 0) / nonEmpty.length;

    if (dateRatio > 0.15 || (titleRatio > 0.2 && hasBullets)) return "TimelineBlock";
    if (denseRatio > 0.3) return "DenseSkillMatrix";
    if (bulletRatio > 0.5) return "ListBlock";
    if (textAvgLength > 100) return "NarrativeBlock";

    return "ListBlock"; // Default
}

/**
 * PHASE 4: Semantic Mapping (Late Binding)
 * Assigns ranked labels to segments based on structure and text
 */
function mapSemantics(segments) {
    return segments.map((seg, idx) => {
        const headerText = seg.header ? seg.header.text : "";
        const structure = seg.structureType;
        const candidates = [];

        // Contextual Clues
        if (idx === 0 && !seg.header) {
            candidates.push({ type: "personalInfo", score: 1.0 });
        }

        // Structural Clues
        if (structure === "TimelineBlock") {
            candidates.push({ type: "experience", score: 0.7 });
            candidates.push({ type: "education", score: 0.6 });
            candidates.push({ type: "projects", score: 0.5 });
        } else if (structure === "DenseSkillMatrix") {
            candidates.push({ type: "skills", score: 0.95 });
        } else if (structure === "NarrativeBlock") {
            candidates.push({ type: "summary", score: 0.7 });
        }

        // Keyword Clues (Weighted)
        // Give strong explicit matches highest priority to override structural hints
        if (headerText) {
            const h = headerText.toLowerCase();

            // Explicit "summary" keywords should override structure (boost to 0.99)
            if (/\b(summary|objective|profile|overview|about\s+me)\b/i.test(h)) {
                candidates.push({ type: "summary", score: 0.99 });
            }

            if (/exp|work|history|employ/i.test(h)) candidates.push({ type: "experience", score: 0.95 });
            if (/edu|academic/i.test(h)) candidates.push({ type: "education", score: 0.95 });
            if (/skill|techn|expert|competenc/i.test(h)) candidates.push({ type: "skills", score: 0.95 });
            if (/proj/i.test(h)) candidates.push({ type: "projects", score: 0.95 });
            if (/cert|licens/i.test(h)) candidates.push({ type: "certifications", score: 0.95 });
            if (/award|honor/i.test(h)) candidates.push({ type: "awards", score: 0.95 });
            if (/volunt|commun|activit/i.test(h)) candidates.push({ type: "volunteer", score: 0.9 });
            if (/lang/i.test(h)) candidates.push({ type: "languages", score: 0.9 });
            if (/interest|hobby/i.test(h)) candidates.push({ type: "interests", score: 0.9 });
        }

        candidates.sort((a, b) => b.score - a.score);

        return {
            ...seg,
            name: headerText || (idx === 0 ? "Personal Info" : "Untitled Section"),
            semanticType: candidates[0]?.type || "other",
            semanticCandidates: candidates
        };
    });
}

/**
 * Detect if a line is likely a section header using multiple heuristics
 * Instead of matching specific words, we detect patterns:
 * - ALL CAPS short lines
 * - Title-cased short lines ending with colon
 * - Standalone short lines followed by different content patterns
 */
function isSectionHeader(line, prevLine, nextLine, lineIndex) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) return false;

    // Skip lines that are too long (likely content, not headers)
    if (trimmed.length > 60) return false;

    // Skip lines that look like bullet points
    if (/^[-•●○◦▪▸►✓✔→⁃∙·*]\s/.test(trimmed)) return false;

    // Skip lines that are clearly contact info
    if (isContactInfoLine(trimmed)) return false;

    // Skip lines that look like dates or date ranges
    if (/^\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i.test(trimmed)) return false;
    if (/^\d{4}\s*[-–—]\s*(present|\d{4})/i.test(trimmed)) return false;

    const words = trimmed.split(/\s+/);

    // CRITICAL: Check if this looks like a person's name (first few lines)
    // Names are typically 2-4 words, ALL CAPS or Title Case, and appear in first 5 lines
    if (lineIndex < 5 && words.length >= 2 && words.length <= 4) {
        // Check if next lines have contact info (email, phone, address)
        const looksLikeName = isLikelyPersonName(trimmed, nextLine);
        if (looksLikeName) {
            return false; // It's a name, not a section header
        }
    }

    // Check for ALL CAPS (common header style)
    // Must be at least 2 chars, max 6 words typically
    if (words.length <= 6 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
        // Broad ALL CAPS match - check if it's a known section keyword to be safe
        const sectionKeywords = /\b(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|PUBLICATIONS|LANGUAGES|VOLUNTEER|INTERESTS|PROFILE|OBJECTIVE|ABOUT|CONTACT|WORK|HISTORY|EMPLOYMENT|ACADEMIC|QUALIFICATIONS|COMPETENCIES|TECHNOLOGIES|PORTFOLIO|RECITAL|CONTOUR|COMMUNITY|SOCIAL|ACTIVITY|ACTIVITIES|CO-CURRICULAR|CURRICULAR|EXTRA-CURRICULAR)\b/i;

        if (sectionKeywords.test(trimmed)) {
            return true;
        }

        // If not a common keyword, it's likely a company name or sub-header
        // Only accept if it's very short (1-2 words) AND followed by a line that isn't a bullet
        const bulletPattern = /^[-•●○◦▪▸►✓✔→⁃∙·*]\s*/;
        if (words.length <= 2 && nextLine && !bulletPattern.test(nextLine.trim())) {
            // Also ensure it's not a common job title
            const jobTitlePatterns = [
                /manager/i, /director/i, /engineer/i, /developer/i, /consultant/i
            ];
            if (!jobTitlePatterns.some(p => p.test(trimmed))) {
                return true;
            }
        }

        return false;
    }

    // Check for Title Case with optional colon (e.g., "Work Experience:", "Education")
    // Be more restrictive: max 3 words for Title Case headers (4+ words is usually content)
    // Also ensure it's NOT ALL CAPS (those are handled above)
    const isAllCaps = trimmed === trimmed.toUpperCase();
    const titleCasePattern = /^[A-Z][a-z&\\s]+$/;
    if (!isAllCaps && words.length <= 3 && titleCasePattern.test(trimmed.replace(/:$/, ''))) {
        // Don't match if it looks like a job title
        const jobTitlePatterns = [
            /manager/i, /director/i, /engineer/i, /developer/i, /consultant/i,
            /analyst/i, /lead/i, /head/i, /architect/i, /specialist/i,
            /coordinator/i, /administrator/i, /executive/i, /officer/i,
            /president/i, /founder/i, /owner/i, /supervisor/i, /associate/i
        ];
        if (jobTitlePatterns.some(p => p.test(trimmed))) {
            return false;
        }

        // Don't match common sub-headers in experience sections
        const experienceSubHeaders = [
            /^key\s*(deliverables?|highlights?|responsibilities?|achievements?)$/i,
            /^major\s*(achievements?|accomplishments?)$/i,
            /^domains?\s*handled$/i,
            /^key\s*highlights?$/i,
            /^responsibilities$/i,
            /^achievements$/i
        ];
        if (experienceSubHeaders.some(p => p.test(trimmed))) {
            return false;
        }

        // Don't match skill-like content (management, development, etc.)
        const skillPatterns = [
            /^strategic\s+management$/i,
            /^infrastructure\s+management$/i,
            /^program\s+management$/i,
            /^project\s+management$/i,
            /^business\s+analysis$/i,
            /^client\s+relationship$/i
        ];
        if (skillPatterns.some(p => p.test(trimmed))) {
            return false;
        }

        // Don't match if it looks like skill content (repeated similar words)
        if (words.length >= 3) {
            const wordSet = new Set(words.map(w => w.toLowerCase()));
            if (wordSet.size < words.length - 1) return false;
        }

        return true;
    }

    // Check for lines starting with or containing specific section keywords (even with trailing text)
    // and ending with colon or followed by bullet points
    const headerKeywords = /^(professional\s+)?(summary|experience|education|skills|projects|certifications|awards|publications|languages|volunteer|interests|profile|objective|about|contact|work|history|academic|qualifications|competencies|technologies|expertise|community|activities|co-curricular)/i;
    if (headerKeywords.test(trimmed)) {
        // If it's short or has a colon early on, it's a header
        if (trimmed.length < 40 && (trimmed.includes(':') || (nextLine && /^[•●○◦▪▸►✓✔→⁃∙·*]/.test(nextLine.trim())))) {
            return true;
        }
    }

    // Check for lines ending with colon (explicit headers)
    // But exclude common sub-headers like "Key Deliverables:"
    if (/:/.test(trimmed) && words.length <= 5) {
        const subHeaderPatterns = [
            /delivered:/i, /handled:/i, /results:/i
        ];
        if (subHeaderPatterns.some(p => p.test(trimmed))) {
            return false;
        }

        // Catch things like "Projects:" "Expertise and Skills:"
        const headerKeywords = /project|skill|expert|commun|activit|co-curric|volunt|educ|exp/i;
        if (headerKeywords.test(trimmed)) return true;
    }

    return false;
}

/**
 * Check if a line looks like a person's name
 */
function isLikelyPersonName(line, nextLine) {
    const trimmed = line.trim();
    const words = trimmed.split(/\s+/);

    // Names are typically 2-4 words
    if (words.length < 2 || words.length > 4) return false;

    // Check if all words are capitalized (first letter or all caps)
    const allCapitalized = words.every(w => /^[A-Z]/.test(w));
    if (!allCapitalized) return false;

    // Check if next line contains contact info or address
    if (nextLine) {
        const nextTrimmed = nextLine.trim();
        // Address pattern (contains numbers and commas, or city names)
        const hasAddress = /^[A-Z0-9].*,.*\d{5,6}/.test(nextTrimmed) ||
            /^[A-Z][a-z\-]+\s*,/.test(nextTrimmed) ||
            /\d{5,6}/.test(nextTrimmed);
        // Email or phone right after
        const hasContact = isContactInfoLine(nextTrimmed);
        // URL pattern
        const hasUrl = /linkedin|github|http|www|@/.test(nextTrimmed.toLowerCase());

        if (hasAddress || hasContact || hasUrl) return true;
    }

    // Common section header words that are NOT names
    const sectionKeywords = /summary|experience|education|skills|project|certific|work|career|employ|qualif|award|honor|public|volunt|language|interest|object|profile|about/i;
    if (sectionKeywords.test(trimmed)) return false;

    return false;
}

/**
 * Normalize section name by removing PDF extraction artifacts
 * Handles cases like "C ERTIFICATION" -> "CERTIFICATION", "S KILLS" -> "SKILLS"
 * Preserves normal word spacing like "CAREER RECITAL" -> "CAREER RECITAL"
 */
function normalizeSectionName(name) {
    // Only fix single-letter prefix artifacts from PDF extraction
    // Pattern: single capital letter at start, followed by space, then 2+ caps
    let normalized = name
        .replace(/^([A-Z])\s+([A-Z]{2,})/, '$1$2')  // "C ERTIFICATION" -> "CERTIFICATION" at start only
        .replace(/\s([A-Z])\s+([A-Z]{2,})/g, ' $1$2')  // Handle mid-word artifacts like "SOME C ERT" -> "SOME CERT"
        .replace(/\s+/g, ' ')  // Collapse multiple spaces to single
        .trim();

    return normalized;
}

/**
 * Check if a line contains contact information
 */
function isContactInfoLine(line) {
    const patterns = [
        /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone (US)
        /\+\d{1,3}[-.\s]?\d+[-.\s]?\d+/, // International phone
        /linkedin\.com/i,
        /github\.com/i,
        /twitter\.com|x\.com/i,
        /\b(www\.|https?:\/\/)/i, // URLs
    ];

    return patterns.some(p => p.test(line));
}

// ============================================================================
// SECTION TYPE CLASSIFICATION
// ============================================================================

/**
 * Given a section name, guess what type of content it contains
 * This helps us parse the content appropriately
 */
function classifySectionType(sectionName) {
    // Normalize the name first (remove PDF artifacts like extra spaces)
    const normalized = normalizeSectionName(sectionName);
    const name = normalized.toLowerCase().trim();

    // Summary/Profile sections (paragraph text) - CHECK FIRST to avoid false experience matches
    // "CAREER RECITAL" is a summary, not experience!
    const summaryPatterns = [
        /summary/i, /profile/i, /objective/i, /about/i, /overview/i, /introduction/i,
        /recital/i, /glance/i, /at\s*a\s*glance/i, /highlight/i
    ];
    if (summaryPatterns.some(p => p.test(name))) return 'summary';

    // Experience-like sections (have company, title, dates, bullets)
    // Be more specific: "PROFESSIONAL CONTOUR" or "PROFESSIONAL EXPERIENCE"
    const experiencePatterns = [
        /^experience$/i, /work\s*experience/i, /professional\s*experience/i,
        /employment/i, /work\s*history/i, /professional\s*contour/i,
        /professional\s*background/i, /positions?\s*held/i, /career\s*history/i
    ];
    if (experiencePatterns.some(p => p.test(name))) return 'experience';

    // Education-like sections (have degree, school, year)
    const educationPatterns = [
        /education/i, /academic/i, /qualification/i, /degree/i,
        /school/i, /university/i, /training/i, /credentials?/i
    ];
    if (educationPatterns.some(p => p.test(name))) return 'education';

    // Project-like sections (have project name, description, technologies)
    const projectPatterns = [
        /project/i, /portfolio/i, /work\s*sample/i
    ];
    if (projectPatterns.some(p => p.test(name))) return 'projects';

    // Skills sections (comma or pipe separated lists)
    const skillsPatterns = [
        /skill/i, /competenc/i, /technolog/i, /expertise/i, /proficienc/i, /tool/i,
        /methodolog/i, /stack/i, /environment/i
    ];
    if (skillsPatterns.some(p => p.test(name))) return 'skills';

    // Default to 'list' for unknown sections
    return 'list';
}

// ============================================================================
// CONTACT INFO EXTRACTION
// ============================================================================

/**
 * Extract personal info from the header area (before first section)
 */
function extractPersonalInfo(headerLines, allLines) {
    const info = {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        website: '',
        location: ''
    };

    // Filter out social media placeholder junk (e.g., "Profile Email Twitter GitHub LinkedIn Contact")
    const noiseFilter = (line) => {
        const lower = line.toLowerCase();
        const keywords = ['profile', 'email', 'twitter', 'github', 'linkedin', 'contact', 'website', 'portfolio'];
        const matches = keywords.filter(k => lower.includes(k));
        // If 3+ keywords in a short line, it's a headers/placeholder line
        return matches.length >= 3 && line.length < 100;
    };

    const headerLinesFiltered = headerLines.filter(line => !datePattern.test(line) && !titleKeywords.test(line) && !noiseFilter(line));
    const allLinesFiltered = allLines.slice(0, 15).filter(line => !datePattern.test(line) && !titleKeywords.test(line) && !noiseFilter(line));

    const searchArea = [...headerLinesFiltered, ...allLinesFiltered].join('\n');

    // Email
    const emailMatch = searchArea.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) info.email = emailMatch[1];

    // Phone (multiple formats) - find all and pick best
    const phonePatterns = [
        /((?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/, // US/International 10-digit
        /(\+91[-.\s]?\d{5}[-.\s]?\d{5})/, // Indian with space/dash
        /(\+91[-.\s]?\d{10})/, // Indian compact
        /(\+\d{1,3}[-.\s]?\d{2,5}[-.\s]?\d{4,})/, // Generalized international
        /(\b\d{10}\b)/ // Flat 10-digit
    ];

    let bestPhone = "";
    for (const pattern of phonePatterns) {
        const matches = searchArea.match(new RegExp(pattern, 'g'));
        if (matches) {
            for (const match of matches) {
                // Prefer +91 or longer numbers
                if (match.includes('+91')) {
                    bestPhone = match;
                    break;
                }
                if (match.length > bestPhone.length) {
                    bestPhone = match;
                }
            }
        }
        if (bestPhone.includes('+91')) break;
    }
    if (bestPhone) {
        info.phone = bestPhone.trim();
    }

    // LinkedIn
    const linkedinMatch = searchArea.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    if (linkedinMatch) {
        info.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    }

    // GitHub
    const githubMatch = searchArea.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    if (githubMatch) {
        info.github = `https://github.com/${githubMatch[1]}`;
    }

    // Website (non-linkedin, non-github URLs)
    const urlMatch = searchArea.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch && !urlMatch[1].includes('linkedin') && !urlMatch[1].includes('github')) {
        info.website = urlMatch[1].replace(/[,;]+$/, '');
    }

    // Location (city, state, pin patterns)
    // Be careful not to match skill lists like "Skill A, Skill B"
    const locationPatterns = [
        /\b([A-Z][a-z]+,\s*[A-Z][a-z]+(?:\s*-\s*\d{5,6})?)\b/, // City, State - PIN
        /\b([A-Z][a-z]+,\s*[A-Z][a-z]+\s*,\s*[A-Z]{2,3})\b/, // City, State, Country
        /\b([A-Z][a-z]+,\s*[A-Z]{2}\b(?:\s*\d{5})?)\b/, // City, ST Zip
        /\b([A-Za-z ]+,\s*[A-Za-z ]+,\s*\d{6}\b)/, // Generic with 6-digit PIN
        /\b([A-Za-z ]+\s*,\s*[A-Za-z ]+\s*-\s*\d{6}\b)/ // Wakad ,Pune - 411033
    ];

    // Filter out obvious skill lists before checking locations
    const searchAreaFiltered = searchArea
        .split('\n')
        .filter(line => {
            const commaCount = (line.match(/,/g) || []).length;
            // Lines with 4+ commas are usually skill lists, not locations
            return commaCount < 4;
        })
        .join('\n');

    // Find all potential location matches and pick the longest/most specific one
    let bestLocation = "";
    for (const pattern of locationPatterns) {
        const matches = searchAreaFiltered.match(new RegExp(pattern, 'g'));
        if (matches) {
            for (const match of matches) {
                // Skills usually have multiple commas or specific keywords
                const lowerMatch = match.toLowerCase();
                // Stricter noise check: only ignore if the line is JUST noise or contains obvious tech stack terms
                const techStackTerms = /authentication|authorization|javascript|typescript|react|firebase|firestore|sql|nosql|api|rest|graphql|docker|kubernetes|aws|azure|gcp/;
                if (techStackTerms.test(lowerMatch) || match.split(',').length > 4) {
                    continue;
                }

                // If it contains a city-like pattern or is short and comma-separated, it's likely a location
                if (match.length > bestLocation.length) {
                    bestLocation = match;
                }
            }
        }
    }
    if (bestLocation) {
        info.location = bestLocation.trim().replace(/^,\s*/, '');
    }

    // Name extraction - improved logic
    // First, look in the first few lines for a name pattern
    const firstFewLines = allLines.slice(0, 10);
    for (let i = 0; i < firstFewLines.length; i++) {
        const trimmed = firstFewLines[i].trim();
        if (!trimmed) continue;
        if (isContactInfoLine(trimmed)) continue;
        if (trimmed.length > 50) continue;

        // Skip lines that look like section headers or common job titles
        const sectionKeywords = /summary|experience|education|skills|project|certific|work|career|employ|qualif|award|honor|public|volunt|language|interest|object|profile|about|agile|scrum|master|methodolog|achievement/i;
        const commonTitles = /\b(CEO|CTO|CFO|COO|MANAGER|DIRECTOR|LEAD|ENGINEER|DEVELOPER|ARCHITECT|OFFICER|PRESIDENT|FOUNDER|CONSULTANT|SPECIALIST|COORDINATOR|ADMINISTRATOR|EXECUTIVE)\b/i;
        if (sectionKeywords.test(trimmed)) continue;

        // If it's a job title, it might be the user's current title, skip it for the NAME but we'll use it for lookahead
        if (commonTitles.test(trimmed)) {
            // But if we're on line 0, and it's short, it COULD be a name. 
            // Usually titles are on line 2+.
            if (i > 0) continue;
        }

        const words = trimmed.split(/\s+/);

        // Check if it looks like a name (2-4 capitalized words)
        if (words.length >= 2 && words.length <= 4) {
            // ALL CAPS name (e.g., "NAVIN MISHRA")
            if (/^[A-Z]+(\s+[A-Z\.]+)+$/.test(trimmed)) {
                // Verify next line has contact info, address, OR a job title
                const nextLine = firstFewLines[i + 1]?.trim() || '';
                const isNextTitle = nextLine && commonTitles.test(nextLine);
                if (i === 0 || (nextLine && (isContactInfoLine(nextLine) || /[,\d]/.test(nextLine) || isNextTitle))) {
                    info.name = trimmed;
                    break;
                }
            }
            // Title Case name (e.g., "John Doe")
            else if (/^[A-Z][a-z]+(\s+[A-Z][a-z\.]+)+$/.test(trimmed)) {
                info.name = trimmed;
                break;
            }
            // First meaningful non-contact line with only letters and spaces
            else if (/^[A-Za-z\s.]+$/.test(trimmed)) {
                const nextLine = firstFewLines[i + 1]?.trim() || '';
                if (nextLine && (isContactInfoLine(nextLine) || /[,@\d]/.test(nextLine) || /\d{5,6}/.test(nextLine))) {
                    info.name = trimmed;
                    break;
                }
            }
        }
    }

    // Fallback: check headerLines if not found yet
    if (!info.name) {
        for (const line of headerLines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (isContactInfoLine(trimmed)) continue;
            if (trimmed.length > 50) continue;
            if (/summary|experience|education|skills|project|certific|work|career|agile|scrum/i.test(trimmed)) continue;

            // First meaningful line is likely the name
            if (/^[A-Za-z\s.]+$/.test(trimmed) && trimmed.split(/\s+/).length <= 4) {
                info.name = trimmed;
                break;
            }
        }
    }

    return info;
}

// ============================================================================
// SECTION CONTENT PARSERS
// ============================================================================

/**
 * Parse experience/work history section
 */
function parseExperienceContent(lines) {
    const jobs = [];
    let currentJob = null;
    let pendingCompanyLine = null; // Track company line that comes before role/dates

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const isBullet = bulletPattern.test(line);
        const hasDates = datePattern.test(line);
        const hasTitle = titleKeywords.test(line);

        // Exclude lines starting with common verbs or lowercase (likely descriptions/continuations)
        const startsWithVerb = /^(built|developed|managed|created|implemented|led|designed|worked|responsible|contributed|assisted|handled|organized)/i.test(line);
        const startsWithLowercase = /^[a-z]/.test(line);

        // Check if this is a short company-only line (no dates, no title keywords)
        // that precedes a role/date line
        const isLikelyCompanyLine = !isBullet && !hasDates && !hasTitle &&
            line.length < 60 && line.length > 2 && !startsWithVerb && !startsWithLowercase &&
            /^[A-Z]/.test(line); // Starts with capital letter

        // Look ahead to see if next lines have title/dates (multi-line header detection)
        const nextLine = lines[i + 1]?.trim() || '';
        const nextNextLine = lines[i + 2]?.trim() || '';
        const nextHasDates = datePattern.test(nextLine);
        const nextHasTitle = titleKeywords.test(nextLine);
        const nextNextHasDates = datePattern.test(nextNextLine);

        // If this looks like a standalone company line followed by role/dates, save it
        if (isLikelyCompanyLine && (nextHasTitle || nextHasDates || nextNextHasDates)) {
            pendingCompanyLine = line;
            continue;
        }

        // Detected a job header (has dates or title keywords, not a bullet)
        // If it looks like a title but has no dates, and we currently have a job with a company but NO title,
        // it's likely the title for that company, not a new job.
        const isFollowupTitle = hasTitle && !hasDates && currentJob && currentJob.company && !currentJob.role && line.length < 100;

        if (!isBullet && (hasDates || hasTitle) && line.length < 170 && !isFollowupTitle && !startsWithVerb && !startsWithLowercase) {
            // Save previous job
            if (currentJob && (currentJob.role || currentJob.company || (currentJob.bullets && currentJob.bullets.length > 0))) {
                jobs.push(currentJob);
            }

            // Parse the header
            currentJob = parseJobHeader(line, lines[i + 1]);

            // If we have a pending company line, use it
            if (pendingCompanyLine && !currentJob.company) {
                currentJob.company = pendingCompanyLine;
                pendingCompanyLine = null;
            } else if (pendingCompanyLine && currentJob.company && !currentJob.company.includes(pendingCompanyLine)) {
                // Company was already set but pending company is different - use pending
                // This handles cases where dates were incorrectly put in company field
                if (datePattern.test(currentJob.company)) {
                    currentJob.dates = currentJob.company;
                    currentJob.company = pendingCompanyLine;
                }
                pendingCompanyLine = null;
            }

            // If parseJobHeader used lines[i+1], it should be skipped in the next iteration
            const nextLineTrimmed = lines[i + 1]?.trim() || "";
            const nextLineWasUsed = nextLineTrimmed && (
                currentJob.role === nextLineTrimmed ||
                currentJob.company === nextLineTrimmed ||
                (currentJob.company && nextLineTrimmed.startsWith(currentJob.company)) || // Company extracted from next line
                (currentJob.company && currentJob.dates && nextLineTrimmed.includes(currentJob.company) && nextLineTrimmed.includes(currentJob.dates.split(/[-–—]/)[0].trim())) // Full match
            );
            if (nextLineWasUsed) {
                i++; // Skip next line as it was used as part of the header
            }

            // Look ahead for dates if we don't have any yet
            if (!currentJob.dates && lines[i + 1]) {
                const nextTrimmed = lines[i + 1].trim();
                const nextDateMatch = nextTrimmed.match(datePattern);
                if (nextDateMatch && nextTrimmed.length < 50) {
                    currentJob.dates = nextTrimmed;
                    i++; // Skip the date line
                }
            }

            // If the header only had a role/dates but no company, check the PREVIOUS line 
            if (!currentJob.company && i > 0 && !pendingCompanyLine) {
                const prevLine = lines[i - 1].trim();
                const prevIsBullet = bulletPattern.test(prevLine);
                const prevHasDates = datePattern.test(prevLine);
                const prevHasTitle = titleKeywords.test(prevLine);

                if (prevLine && !prevIsBullet && !prevHasDates && !prevHasTitle && prevLine.length < 60) {
                    currentJob.company = prevLine;
                }
            }

        } else if (currentJob) {
            // Handle bullet points or extra info
            const cleanedLine = line.replace(bulletPattern, '').trim();
            if (cleanedLine.length > 0) {
                // If it was a followup title, assign it
                if (isFollowupTitle && !currentJob.role) {
                    currentJob.role = cleanedLine;
                } else if (isBullet || (!currentJob.role && cleanedLine.length < 80 && hasTitle && !isBullet) ||
                           (!currentJob.dates && datePattern.test(cleanedLine) && cleanedLine.length < 50)) {
                    // Handle role or dates assignment
                    if (!currentJob.role && cleanedLine.length < 80 && hasTitle && !isBullet) {
                        currentJob.role = cleanedLine;
                    } else if (!currentJob.dates && datePattern.test(cleanedLine) && cleanedLine.length < 50) {
                        currentJob.dates = cleanedLine;
                    } else {
                        // This is a bullet - check if we should merge with previous
                        if (currentJob.bullets.length > 0) {
                            const lastIndex = currentJob.bullets.length - 1;
                            const lastBullet = currentJob.bullets[lastIndex];

                            const lastEndsWithPunctuation = /[.!?]$/.test(lastBullet.trim());
                            const lastEndsWithCommaOrSemicolon = /[,;]$/.test(lastBullet.trim());
                            const lastEndsWithConjunction = /\b(and|or|but|with|for|to|in|on|at|from|by|as|of)\s*$/i.test(lastBullet.trim());
                            const currentStartsLowercase = /^[a-z]/.test(cleanedLine);

                            // Merge if:
                            // 1. Previous line doesn't end with sentence-ending punctuation AND
                            // 2. Either: no bullet on current line, OR current starts lowercase, OR previous ends with comma/semicolon/conjunction
                            const shouldMerge = !lastEndsWithPunctuation &&
                                               (!isBullet || currentStartsLowercase || lastEndsWithCommaOrSemicolon || lastEndsWithConjunction);

                            if (shouldMerge) {
                                currentJob.bullets[lastIndex] = `${lastBullet} ${cleanedLine}`;
                            } else {
                                currentJob.bullets.push(cleanedLine);
                            }
                        } else {
                            currentJob.bullets.push(cleanedLine);
                        }
                    }
                } else {
                    // This is a continuation line or extra info
                    if (currentJob.bullets.length > 0) {
                        const lastIndex = currentJob.bullets.length - 1;
                        const lastBullet = currentJob.bullets[lastIndex];

                        const lastEndsWithPunctuation = /[.!?]$/.test(lastBullet.trim());
                        const lastEndsWithCommaOrSemicolon = /[,;]$/.test(lastBullet.trim());
                        const lastEndsWithConjunction = /\b(and|or|but|with|for|to|in|on|at|from|by|as|of)\s*$/i.test(lastBullet.trim());
                        const currentStartsLowercase = /^[a-z]/.test(cleanedLine);

                        const shouldMerge = !lastEndsWithPunctuation &&
                                           (!isBullet || currentStartsLowercase || lastEndsWithCommaOrSemicolon || lastEndsWithConjunction);

                        if (shouldMerge) {
                            currentJob.bullets[lastIndex] = `${lastBullet} ${cleanedLine}`;
                        } else {
                            currentJob.bullets.push(cleanedLine);
                        }
                    } else {
                        currentJob.bullets.push(cleanedLine);
                    }
                }
            }
        } else if (!currentJob && (hasTitle || hasDates)) {
            // First line might be a job header
            currentJob = parseJobHeader(line, lines[i + 1]);
            if (pendingCompanyLine && !currentJob.company) {
                currentJob.company = pendingCompanyLine;
                pendingCompanyLine = null;
            }
        }
    }

    // Don't forget the last job
    if (currentJob && (currentJob.role || currentJob.company || (currentJob.bullets && currentJob.bullets.length > 0))) {
        jobs.push(currentJob);
    }

    // Post-process jobs to fix any remaining issues
    return jobs.map(job => {
        // If company contains dates, swap them
        if (job.company && datePattern.test(job.company) && !job.dates) {
            job.dates = job.company;
            job.company = '';
        }
        // Clean up SpaceX being added as bullet point
        if (job.bullets && job.bullets.length > 0) {
            const companyInBullets = job.bullets.findIndex(b =>
                b.length < 30 && /^[A-Z]/.test(b) && !bulletPattern.test(b) &&
                !titleKeywords.test(b) && !datePattern.test(b)
            );
            // Don't extract from bullets for now - too risky
        }
        return job;
    }).filter(j => j.role || j.company);
}

/**
 * Parse a job header line to extract title, company, dates, location
 */
function parseJobHeader(line, nextLine) {
    const job = {
        role: '',
        company: '',
        location: '',
        dates: '',
        bullets: []
    };

    let text = line.trim();

    // Extract dates first
    // Extract dates first - handle 'YY format and diverse separators
    const dateRangePattern = /\(?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[a-z]*\.?\s*['’]?\d{0,4}|[\d]{4})\s*[-–—to ]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[a-z]*\.?\s*['’]?\d{0,4}|\d{4}|present|current)\s*\)?/i;
    const dateMatch = text.match(dateRangePattern);
    if (dateMatch) {
        job.dates = dateMatch[0].replace(/[()]/g, '').trim();
        text = text.replace(dateMatch[0], '').trim();
    }

    // Try different separator patterns
    // Pattern: "Title at Company"
    if (text.toLowerCase().includes(' at ')) {
        const parts = text.split(/\s+at\s+/i);
        job.role = parts[0].trim();
        job.company = parts.slice(1).join(' at ').trim();
    }
    // Pattern: "Title | Company | Location"
    else if (text.includes('|')) {
        const parts = text.split('|').map(p => p.trim());
        if (parts.length >= 2) {
            job.role = parts[0];
            job.company = parts[1];
            if (parts[2]) job.location = parts[2];
        }
    }
    // Pattern: "Title - Company" or "Company - Title"
    else if (/\s[-–—]\s/.test(text)) {
        const parts = text.split(/\s[-–—]\s/);
        if (parts.length >= 2) {
            // Guess which is title vs company
            const titleKeywords = /\b(engineer|developer|manager|director|lead|senior|junior|analyst)\b/i;
            if (titleKeywords.test(parts[0])) {
                job.role = parts[0].trim();
                job.company = parts.slice(1).join(' - ').trim();
            } else {
                job.company = parts[0].trim();
                job.role = parts.slice(1).join(' - ').trim();
            }
        }
    }
    // Pattern: "Company, Location"
    else if (text.includes(',')) {
        const parts = text.split(',');
        job.company = parts[0].trim();
        if (parts[1]) job.location = parts.slice(1).join(',').trim();
    }
    // Single item - could be title or company
    else {
        const titleKeywords = /\b(engineer|developer|manager|director|lead|senior|junior|analyst|consultant|specialist)\b/i;
        if (titleKeywords.test(text)) {
            job.role = text;
        } else {
            job.company = text;
        }
    }

    // Post-process: if company was filled but role is empty, title might be inside company
    if (job.company && !job.role) {
        const titleKeywords = /\b(engineer|developer|manager|director|lead|senior|junior|analyst|consultant|specialist|architect|head|intern|stack|mobile|frontend|backend|full\s*stack|engineer)\b/i;

        // Find ALL title keywords and pick the one that ends latest
        let bestMatch = null;
        let lastEnd = -1;

        const regex = new RegExp(titleKeywords.source, 'gi');
        let m;
        while ((m = regex.exec(job.company)) !== null) {
            if (m.index + m[0].length > lastEnd) {
                lastEnd = m.index + m[0].length;
                bestMatch = m;
            }
        }

        if (bestMatch) {
            // Found a title inside the company string
            let rolePart = job.company.substring(0, lastEnd).trim();
            let remainder = job.company.substring(lastEnd).trim();

            // Clean up remainder (remove leading commas, dashes, etc.)
            remainder = remainder.replace(/^[\s,.\-–—()|]+/, '').replace(/[)\s,.\-–—(|]+$/, '').trim();

            // Further clean up rolePart: if it has " (Contract", remove it from here if we want to clean company
            // But usually "(Contract)" is part of the role or company.
            // If remainder starts with "Contract) ", it's an orphan parenthesis
            remainder = remainder.replace(/^contract\)\s*/i, '').trim();

            // Further clean up rolePart if it has orphan parentheses
            rolePart = rolePart.replace(/\s*\(\s*$/, '').trim();
            rolePart = rolePart.replace(/\s*\(contract\s*$/i, '').trim();

            // If remainder looks like a company name (not just "(Contract)"), split it
            if (remainder && remainder.length > 2) {
                if (remainder.toLowerCase().startsWith('at ')) {
                    remainder = remainder.substring(3).trim();
                }

                // If the rolePart ends with words like "(Contract)", it's perfect
                if (rolePart.length < 100) {
                    job.role = rolePart;
                    job.company = remainder;
                }
            }
        }
    }

    // FINAL SCALABLE FALLBACK: Greedy Bi-directional Split
    // If one field is still empty after standard checks, split at the last title keyword in a leading title sequence.
    if (text && (!job.role || !job.company)) {
        let bestMatchEnd = -1;
        const regex = new RegExp(titleKeywords.source, 'gi');
        let m;
        while ((m = regex.exec(text)) !== null) {
            // Only consider keywords at the start of the string (allow some variance for modifiers)
            if (m.index < 35) {
                bestMatchEnd = Math.max(bestMatchEnd, m.index + m[0].length);
            }
        }

        if (bestMatchEnd > 0) {
            const part1 = text.substring(0, bestMatchEnd).trim();
            const part2 = text.substring(bestMatchEnd).trim();

            // Clean up part2 (the potential company name)
            // Remove leading/trailing punctuation and handles orphaned parentheses
            let cleanPart2 = part2.replace(/^[\s,.\-–—()|]+/, '').replace(/[)\s,.\-–—(|]+$/, '').trim();

            // Specifically remove leading closing paren like in "Contract) Company"
            cleanPart2 = cleanPart2.replace(/^\)\s*/, '').trim();

            if (cleanPart2.length > 2) {
                job.role = part1;
                job.company = cleanPart2;
            } else if (!job.role) {
                job.role = part1;
            }
        }
    }

    // Check next line for additional info (sometimes title and company are on separate lines)
    if (nextLine && (!job.role || !job.company)) {
        const nextTrimmed = nextLine.trim();
        // Case: Current line had company, next line has title
        if (!job.role && job.company) {
            if (titleKeywords.test(nextTrimmed) && nextTrimmed.length < 80) {
                job.role = nextTrimmed;
            }
        }
        // Case: Current line had title, next line has company/location/dates
        else if (job.role && !job.company) {
            if (nextTrimmed.length < 100 && !bulletPattern.test(nextTrimmed) && !titleKeywords.test(nextTrimmed)) {
                // Parse the next line to extract dates, company, and location
                let nextLineText = nextTrimmed;

                // Extract dates from parentheses or at the end
                const dateRangePattern = /\(?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[a-z]*\.?\s*['']?\d{0,4}|[\d]{4})\s*[-–—to ]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[a-z]*\.?\s*['']?\d{0,4}|\d{4}|present|current)\s*\)?/i;
                const dateMatch = nextLineText.match(dateRangePattern);
                if (dateMatch) {
                    job.dates = dateMatch[0].replace(/[()]/g, '').trim();
                    nextLineText = nextLineText.replace(dateMatch[0], '').trim();
                }

                // Now parse company and location from remaining text
                // Pattern: "Company, Location" or "Company"
                if (nextLineText.includes(',')) {
                    const parts = nextLineText.split(',').map(p => p.trim());
                    job.company = parts[0];
                    if (parts[1]) {
                        job.location = parts.slice(1).join(', ');
                    }
                } else {
                    job.company = nextLineText;
                }
            }
        }
    }

    return job;
}

/**
 * Parse education section
 */
function parseEducationContent(lines) {
    const education = [];
    let currentEdu = null;
    let pendingSchoolLine = null;

    const degreeKeywords = /\b(bachelor|master|phd|ph\.?d|doctorate|diploma|certificate|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|m\.?b\.?a\.?|b\.?tech|m\.?tech|associate|degree)\b/i;
    const schoolKeywords = /\b(university|college|institute|school|academy|mit|iit|stanford|harvard|yale|princeton|berkeley|caltech|oxford|cambridge|nit|bits|vit|ucla|nyu)\b/i;
    const yearPattern = /\b(19|20)\d{2}\b/;
    const bulletPattern = /^[\x2D\u2022\u25CF\u25CB\u25E6\u25AA\u25B8\u25BA\u2713\u2714\u2192\u2043\u2219\u00B7\x2A]\s*/;
    const graduatedPattern = /\b(graduated?|grad\.?)\s*(\d{4})/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;

        const nextLine = lines[i + 1]?.trim() || '';

        // Multi-line detection: School on one line, Degree on next
        const isLikelySchoolLine = !bulletPattern.test(trimmed) &&
            trimmed.length < 50 && trimmed.length > 2 &&
            /^[A-Z]/.test(trimmed) &&
            (schoolKeywords.test(trimmed) || /^[A-Z]{2,5}$/.test(trimmed)) &&
            !degreeKeywords.test(trimmed) &&
            !yearPattern.test(trimmed);

        const nextHasDegree = degreeKeywords.test(nextLine);
        const nextHasYear = yearPattern.test(nextLine) || graduatedPattern.test(nextLine);

        if (isLikelySchoolLine && (nextHasDegree || nextHasYear)) {
            pendingSchoolLine = trimmed;
            continue;
        }

        // NEW: Handle multiple entries on same line separated by |
        if (trimmed.includes('|') && (degreeKeywords.test(trimmed) || schoolKeywords.test(trimmed))) {
            const subLines = trimmed.split('|').map(s => s.trim()).filter(s => s.length > 5);
            // If it looks like multiple degrees/schools, process them as separate entries
            if (subLines.length >= 2 && subLines.every(s => degreeKeywords.test(s) || schoolKeywords.test(s) || yearPattern.test(s))) {
                for (const sub of subLines) {
                    processEducationLine(sub);
                }
                continue;
            }
        }

        processEducationLine(trimmed);
    }

    function processEducationLine(trimmed) {
        const isBullet = bulletPattern.test(trimmed);
        const hasDegree = degreeKeywords.test(trimmed);
        const hasSchool = schoolKeywords.test(trimmed);
        const hasYear = yearPattern.test(trimmed);
        const hasGraduated = graduatedPattern.test(trimmed);

        // New education entry
        if (!isBullet && (hasDegree || hasSchool || hasYear || hasGraduated)) {
            if (currentEdu) {
                education.push(currentEdu);
            }

            currentEdu = {
                degree: '',
                school: '',
                year: '',
                gpa: '',
                details: []
            };

            // Use pending school line if available
            if (pendingSchoolLine) {
                currentEdu.school = pendingSchoolLine;
                pendingSchoolLine = null;
            }

            // Extract year
            const yearMatch = trimmed.match(yearPattern);
            if (yearMatch) currentEdu.year = yearMatch[0];

            // Check for "Graduated YYYY" pattern
            const gradMatch = trimmed.match(graduatedPattern);
            if (gradMatch) currentEdu.year = gradMatch[2];

            // Extract GPA
            const gpaMatch = trimmed.match(/gpa[:\s]*([\d.]+)/i);
            if (gpaMatch) currentEdu.gpa = gpaMatch[1];

            // Try to separate degree and school
            if (trimmed.includes('|')) {
                const parts = trimmed.split('|').map(p => p.trim());
                for (const part of parts) {
                    if (degreeKeywords.test(part) && !currentEdu.degree) {
                        currentEdu.degree = part;
                    } else if (schoolKeywords.test(part) && !currentEdu.school) {
                        currentEdu.school = part;
                    }
                }
            } else if (trimmed.includes(' - ')) {
                const parts = trimmed.split(' - ').map(p => p.trim());
                currentEdu.degree = parts[0];
                currentEdu.school = parts.slice(1).join(' - ');
            } else if (trimmed.includes(' from ')) {
                const parts = trimmed.split(' from ').map(p => p.trim());
                currentEdu.degree = parts[0];
                currentEdu.school = parts.slice(1).join(' from ');
            } else {
                // Just store the whole line
                if (hasDegree) currentEdu.degree = trimmed;
                else if (hasSchool) currentEdu.school = trimmed;
                else currentEdu.degree = trimmed;
            }
        } else if (currentEdu) {
            // Add details to current education
            const cleaned = trimmed.replace(bulletPattern, '').trim();
            if (cleaned) currentEdu.details.push(cleaned);
        }
    }

    if (currentEdu) {
        education.push(currentEdu);
    }

    return education;
}

/**
 * Parse skills section (comma/pipe separated or bullet list)
 */
function parseSkillsContent(lines) {
    const skills = [];

    // First, identify and skip prose lines at the beginning of the skills section
    let startIndex = 0;
    for (let i = 0; i < Math.min(lines.length, 4); i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) {
            startIndex = i + 1;
            continue;
        }

        const wordCount = trimmed.split(/\s+/).length;
        const hasLowercaseStart = /^[a-z]/.test(trimmed);
        const hasCommonProseWords = /\b(extensive|experience|proven|track|record|leading|managing|complex|diverse|strong|knowledge|with|across|in|of|and|the|that|accomplished)\b/i.test(trimmed);

        // Prose lines are typically: many words + (lowercase start OR common prose words)
        const isLikelyProse = (wordCount > 8 && hasLowercaseStart) || (wordCount > 9 && hasCommonProseWords);

        // console.log(`[SKILLS DEBUG] Line ${i}: wordCount=${wordCount}, lowercase=${hasLowercaseStart}, proseWords=${hasCommonProseWords}, isProse=${isLikelyProse}`);

        if (isLikelyProse) {
            startIndex = i + 1;
        } else {
            // Hit non-prose, stop skipping
            break;
        }
    }

    // console.log(`[SKILLS DEBUG] Starting parse from index ${startIndex} of ${lines.length} total lines`);

    // Now parse the remaining lines as actual skills
    for (let i = startIndex; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;

        // console.log(`[SKILLS DEBUG] Parsing line ${i}: "${trimmed}"`);

        // Remove bullets
        let cleaned = trimmed.replace(/^[-•●○◦▪▸►✓✔→⁃∙·*]\s*/, '');

        // Handle "Category: skill1, skill2, skill3" format
        if (cleaned.includes(':')) {
            const parts = cleaned.split(':');
            if (parts.length >= 2) {
                cleaned = parts.slice(1).join(':'); // Take everything after first colon
            }
        }

        let items = [];

        // Check if line has multiple spaces (common format: "Skill1  Skill2  Skill3")
        if (/\s{2,}/.test(cleaned)) {
            // console.log(`[SKILLS DEBUG] Line has 2+ spaces, splitting...`);
            // Split by 2+ spaces
            items = cleaned.split(/\s{2,}/).map(s => s.trim()).filter(s => s.length > 1);
            // console.log(`[SKILLS DEBUG] Split into ${items.length} items:`, items);
        }
        // Check if line has multiple capitalized phrases (e.g., "Project Management Team Management")
        else if (/^[A-Z]/.test(cleaned) && !cleaned.includes(',') && !cleaned.includes('|') && !/\.\s/.test(cleaned)) {
            // console.log(`[SKILLS DEBUG] Trying to split capitalized phrases: "${cleaned}"`);
            // Simple approach: if line has words that are all Title Case and no delimiters,
            // try splitting every 2-3 words as likely being separate skills
            const words = cleaned.split(/\s+/);
            const allCapitalized = words.every(w => /^[A-Z]/.test(w) || w === '/' || w.length <= 2);

            if (allCapitalized && words.length >= 3) {
                // console.log(`[SKILLS DEBUG] All words capitalized, splitting every 2-3 words`);
                // Try to intelligently group: look for natural phrase boundaries
                // For now, simple approach: split in half or thirds
                if (words.length === 4) {
                    items = [
                        words.slice(0, 2).join(' '),
                        words.slice(2, 4).join(' ')
                    ];
                } else if (words.length === 6) {
                    items = [
                        words.slice(0, 2).join(' '),
                        words.slice(2, 4).join(' '),
                        words.slice(4, 6).join(' ')
                    ];
                } else {
                    // Fallback: treat the whole line as a single skill
                    items = [cleaned];
                }
                // console.log(`[SKILLS DEBUG] Split into ${items.length} items:`, items);
            }
        }

        if (items.length === 0) {
            // console.log(`[SKILLS DEBUG] No split successful, using comma/delimiter split`);

            // Split by common delimiters but NOT inside parentheses
            // Scalable regex for splitting skills while preserving parenthetical info
            let currentItem = '';
            let parenCount = 0;

            for (let i = 0; i < cleaned.length; i++) {
                const char = cleaned[i];
                if (char === '(') parenCount++;
                else if (char === ')') parenCount--;

                if (parenCount === 0 && /[,|;/•·]/.test(char)) {
                    if (currentItem.trim()) items.push(currentItem.trim());
                    currentItem = '';
                } else {
                    currentItem += char;
                }
            }
            if (currentItem.trim()) items.push(currentItem.trim());
        }

        const filteredItems = items
            .map(s => s.trim())
            .filter(s => s.length > 1 && s.length < 150);

        // console.log(`[SKILLS DEBUG] Filtered items (${filteredItems.length}):`, filteredItems);

        // EXTRA CHECK: Stop if hitting projects or other sub-sections
        // messy resumes lumping "Projects: ..." at end of skills
        // Only match if it's "Projects:" with colon, not "Project Management" etc.
        for (const item of filteredItems) {
            const isSubSection = /^(projects?|community|activities?|co-curricular|curricular|extra-curricular|volunteer)\s*:/i.test(item);
            if (isSubSection) {
                // console.log(`[SKILLS DEBUG] Hit sub-section, returning early`);
                return [...new Set(skills)];
            }
            // console.log(`[SKILLS DEBUG] Adding skill: "${item}"`);
            skills.push(item);
        }
    }

    // Deduplicate
    return [...new Set(skills)];
}

/**
 * Parse projects section
 */
function parseProjectsContent(lines) {
    const projects = [];
    let currentProject = null;

    const bulletPattern = /^[-•●○◦▪▸►✓✔→⁃∙·*]\s*/;
    const techPattern = /\b(technologies?|tech\s*stack|built\s*with|tools?|stack)\s*[:\-]/i;
    const linkPattern = /(https?:\/\/[^\s]+)/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isBullet = bulletPattern.test(trimmed);
        const isLongText = trimmed.length > 100;

        // Check if this is a project title (short, not a bullet, not a URL)
        if (!isBullet && !isLongText && !linkPattern.test(trimmed) && !techPattern.test(trimmed)) {
            // Could be a new project title
            if (currentProject) {
                projects.push(currentProject);
            }

            currentProject = {
                name: trimmed.replace(/^[-•●○◦▪▸►✓✔→⁃∙·*]\s*/, '').replace(/:$/, '').trim(),
                description: [],
                technologies: [],
                link: ''
            };
        } else if (currentProject) {
            // Add to current project
            const cleaned = trimmed.replace(bulletPattern, '').trim();

            // Check for technologies
            if (techPattern.test(cleaned)) {
                const techPart = cleaned.replace(techPattern, '').trim();
                const techs = techPart.split(/[,|;/•·]/).map(t => t.trim()).filter(t => t);
                currentProject.technologies.push(...techs);
            }
            // Check for links
            else if (linkPattern.test(cleaned)) {
                const linkMatch = cleaned.match(linkPattern);
                if (linkMatch) currentProject.link = linkMatch[1];
            }
            // Regular description
            else if (cleaned) {
                currentProject.description.push(cleaned);
            }
        }
    }

    if (currentProject) {
        projects.push(currentProject);
    }

    return projects;
}

/**
 * Parse summary/profile section (paragraph text)
 */
function parseSummaryContent(lines) {
    return lines
        .map(l => l.trim())
        .filter(l => l && l.length > 5)
        .map(l => l.replace(/^[-•●○◦▪▸►✓✔→⁃∙·*]\s*/, ''))
        .join(' ')
        .trim();
}

/**
 * Parse generic list section (bullet points or lines)
 */
function parseListContent(lines) {
    const items = [];
    const bulletPattern = /^[-•●○◦▪▸►✓✔→⁃∙·*]\s*/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const cleaned = trimmed.replace(bulletPattern, '').trim();
        if (cleaned) {
            items.push(cleaned);
        }
    }

    return items;
}

// ============================================================================
// MAIN PARSER
// ============================================================================

export function parseResumeDynamic(resumeText) {
    // Guardrail: Ensure critical patterns are defined
    if (!datePattern) {
        throw new Error("Critical Error: datePattern is undefined in dynamicResumeParser. Parser cannot function.");
    }

    console.log('🚀 DYNAMIC PARSER: Starting Structural Analysis');
    const originalCharCount = resumeText.replace(/\s/g, '').length;

    // Phase 0: Quick Name/Personal Info Peek
    const linesPeek = resumeText.split(/\r?\n/).slice(0, 15);
    let personalInfo = extractPersonalInfo(linesPeek, linesPeek);

    // Phase 1-3: Structural Segmentation
    const lines = resumeText.split(/\r?\n/);
    const rawSegments = segmentDocument(lines);

    // Phase 4: Semantic Mapping
    const semanticSegments = mapSemantics(rawSegments);

    // Phase 5: Content Parsing (using existing specific parsers)
    const sections = semanticSegments.map(seg => {
        const contentLines = seg.blocks.map(b => b.text);
        let parsedContent;

        switch (seg.semanticType) {
            case 'experience':
                parsedContent = parseExperienceContent(contentLines);
                break;
            case 'education':
                parsedContent = parseEducationContent(contentLines);
                break;
            case 'projects':
                parsedContent = parseProjectsContent(contentLines);
                break;
            case 'summary':
                parsedContent = parseSummaryContent(contentLines);
                break;
            case 'skills':
                parsedContent = parseSkillsContent(contentLines);
                break;
            default:
                parsedContent = parseListContent(contentLines);
        }

        return {
            name: seg.name,
            originalName: seg.name,
            type: seg.semanticType,
            structure: seg.structureType,
            content: parsedContent,
            rawLines: contentLines
        };
    });

    // Refine Personal Info if the first block has a better name or more detail
    const firstBlock = semanticSegments[0];
    if (firstBlock && (!personalInfo.name || personalInfo.name.length < 3)) {
        const refinedInfo = extractPersonalInfo(
            [firstBlock.header?.text, ...firstBlock.blocks.map(b => b.text)].filter(Boolean),
            lines
        );
        personalInfo = { ...personalInfo, ...refinedInfo };
    }

    // Phase 6: Exhaustiveness Check & Status Calculation
    const finalCharCount = sections.reduce((sum, s) => {
        const headerLen = s.name.replace(/\s/g, '').length;
        const bodyLen = s.rawLines.join('').replace(/\s/g, '').length;
        return sum + headerLen + bodyLen;
    }, 0);

    const integrityRatio = originalCharCount > 0 ? (finalCharCount / originalCharCount) : 0;

    // Status Logic
    const sectionCount = sections.length;
    const knownSections = sections.filter(s => ['experience', 'education', 'skills', 'projects', 'summary', 'personalInfo'].includes(s.type)).length;

    let status = 'failed';
    let confidence = 0;

    if (sectionCount >= 2 && knownSections >= 1 && integrityRatio > 0.8) {
        status = 'success';
        confidence = Math.min(0.95, integrityRatio);
    } else if (sectionCount >= 1 && integrityRatio > 0.5) {
        status = 'partial';
        confidence = integrityRatio * 0.8;
    } else {
        status = 'failed';
        confidence = integrityRatio * 0.5;
    }

    console.log(`✅ Extraction Complete. Integrity: ${Math.round(integrityRatio * 100)}% (${finalCharCount}/${originalCharCount}). Status: ${status}`);

    // Build standard result object
    const result = {
        basics: personalInfo, // Promoting personalInfo to basics for consistency
        personalInfo,
        status,
        confidence,
        allSections: sections,
        originalText: resumeText
    };

    // Dynamically add all sections to the top level
    sections.forEach(s => {
        if (!s.type || s.type === 'personalInfo') return;

        // Use type as key, but aggregate if multiple sections have same type
        if (!result[s.type]) {
            result[s.type] = s.content;
        } else {
            // If already exists, merge (e.g. multiple experience sections)
            if (Array.isArray(result[s.type]) && Array.isArray(s.content)) {
                result[s.type] = [...result[s.type], ...s.content];
            } else if (typeof result[s.type] === 'string' && typeof s.content === 'string') {
                result[s.type] = result[s.type] + '\n' + s.content;
            }
        }
    });

    // Special handling for skills to maintain [{name, items}] format if needed by legacy code
    if (result.skills && Array.isArray(result.skills) && typeof result.skills[0] === 'string') {
        result.skills = [{
            name: "Skills",
            items: result.skills
        }];
    }

    return result;
}

// For backwards compatibility
export { parseResumeDynamic as parseResumeUltimate };
