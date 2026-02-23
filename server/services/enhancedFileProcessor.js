import fs from 'fs';
import mammoth from 'mammoth';
import { createRequire } from 'module';

// Use createRequire to import CommonJS module in ESM
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
let pdfjsLib = null;
const loadPDFLib = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    console.log(' [Enhanced] PDF.js library loaded');
  }
  return pdfjsLib;
};

/**
 * Enhanced file processor that preserves original page count and structure
 */

/**
 * Extract text content from uploaded resume files with enhanced page tracking
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{text: string, pageCount: number, structure: object}>} Extracted content with metadata
 */
export async function extractTextFromFileWithStructure(filePath, mimeType) {
  try {
    console.log(` [Enhanced] Processing file: ${filePath} (${mimeType})`);
    const fileBuffer = fs.readFileSync(filePath);
    console.log(` [Enhanced] File size: ${fileBuffer.length} bytes`);

    // Switch based on mimeType
    switch (mimeType) {
      case 'application/pdf':
        try {
          return await extractTextFromPDFWithStructure(fileBuffer);
        } catch (pdfError) {
          console.warn('PDF parsing failed, trying alternative approach:', pdfError.message);
          // Fallback: check if it's actually text content misidentified as PDF
          if (isTextFile(fileBuffer)) {
            console.log(' [Enhanced] PDF parsing failed, but content appears to be text. Using as plain text.');
            return {
              text: fileBuffer.toString('utf8'),
              pageCount: 1,
              structure: { format: 'plain_text_fallback', preserveOriginalLayout: true }
            };
          }
          // Re-throw the original error
          throw pdfError;
        }

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractTextFromWordWithStructure(fileBuffer);

      case 'text/plain':
        return {
          text: fileBuffer.toString('utf8'),
          pageCount: 1,
          structure: { format: 'plain_text', preserveOriginalLayout: true }
        };

      default:
        // Try to detect if it's actually text
        if (isTextFile(fileBuffer)) {
          console.log(` [Enhanced] Treating ${mimeType} as plain text`);
          return {
            text: fileBuffer.toString('utf8'),
            pageCount: 1,
            structure: { format: 'unknown_text', preserveOriginalLayout: true }
          };
        }
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Check if a buffer contains plain text
 * @param {Buffer} buffer - File buffer
 * @returns {boolean} True if it appears to be plain text
 */
function isTextFile(buffer) {
  // CRITICAL: Ensure we don't treat PDFs as text files
  const header = buffer.slice(0, 5).toString('utf8');
  if (header === '%PDF-') {
    return false;
  }

  // Check first 512 bytes for binary content
  const sample = buffer.slice(0, Math.min(512, buffer.length));

  // Count printable ASCII characters
  let printableCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    // Printable ASCII (32-126) + common whitespace (9,10,13)
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      printableCount++;
    }
  }

  // If >80% of bytes are printable, consider it text
  const ratio = printableCount / sample.length;
  return ratio > 0.8;
}

/**
 * Enhanced PDF text extraction with structure preservation
 * @param {Buffer} buffer - File buffer
 */
async function extractTextFromPDFWithStructure(buffer) {
  try {
    console.log(' [Enhanced] Starting PDF parsing (positional mode)...');

    const pdfjsLib = await loadPDFLib();
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      disableWorker: true,
      verbosity: 0
    }).promise;

    const pageCount = pdf.numPages || 1;
    const pages = [];
    const pageMeta = [];

    const buildLines = (items) => {
      const lines = new Map();
      items.forEach((item) => {
        if (!item.str || !item.str.trim()) return;
        const x = item.transform[4];
        const y = item.transform[5];
        // Use fine granularity (1 pixel) to avoid merging separate lines that are close together
        const key = Math.round(y);
        if (!lines.has(key)) {
          lines.set(key, []);
        }
        lines.get(key).push({
          text: item.str,
          x,
          width: item.width || 0
        });
      });

      return Array.from(lines.entries()).map(([y, lineItems]) => {
        lineItems.sort((a, b) => a.x - b.x);
        let lineText = '';
        let lastX = null;
        let lastWidth = 0;

        lineItems.forEach((entry) => {
          if (lastX !== null) {
            const gap = entry.x - (lastX + lastWidth);
            // ALWAYS add space between text items unless they're literally overlapping
            // Previous logic with gap > 2px was too aggressive and glued words together
            // PDF text items often don't include trailing spaces, so we need to add them
            const needsSpace = gap >= 0 && !lineText.endsWith(' ') && !entry.text.startsWith(' ');
            if (needsSpace) {
              lineText += ' ';
            }
          }
          lineText += entry.text;
          lastX = entry.x;
          lastWidth = entry.width;
        });

        return {
          y,
          minX: lineItems[0]?.x || 0,
          text: lineText.replace(/\s+/g, ' ').trim()
        };
      }).filter((line) => line.text);
    };

    const detectColumnSplit = (lines, pageWidth) => {
      if (!lines || lines.length < 12) return null;
      const starts = lines.map((line) => line.minX).sort((a, b) => a - b);
      let maxGap = 0;
      let splitIndex = -1;
      for (let i = 0; i < starts.length - 1; i++) {
        const gap = starts[i + 1] - starts[i];
        if (gap > maxGap) {
          maxGap = gap;
          splitIndex = i;
        }
      }
      const gapThreshold = Math.max(60, pageWidth * 0.12);
      if (splitIndex === -1 || maxGap < gapThreshold) return null;
      const splitX = (starts[splitIndex] + starts[splitIndex + 1]) / 2;
      const leftCount = lines.filter((line) => line.minX < splitX).length;
      const rightCount = lines.filter((line) => line.minX >= splitX).length;
      if (leftCount < 4 || rightCount < 4) return null;
      const total = lines.length;
      const leftRatio = leftCount / total;
      const rightRatio = rightCount / total;
      if (leftRatio < 0.3 || rightRatio < 0.3) return null;

      const rightLines = lines.filter((line) => line.minX >= splitX);
      const shortRight = rightLines.filter((line) => (line.text || '').length <= 18).length;
      const rightShortRatio = rightLines.length ? shortRight / rightLines.length : 0;
      const datePattern = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\s*\d{4}|present|current|\d{2}\/\d{4})/i;
      const dateRight = rightLines.filter((line) => datePattern.test(line.text || '')).length;
      const rightDateRatio = rightLines.length ? dateRight / rightLines.length : 0;
      if (rightShortRatio > 0.7 || rightDateRatio > 0.6) return null;
      return { splitX, leftCount, rightCount };
    };

    for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false
      });

      const lines = buildLines(textContent.items);
      const split = detectColumnSplit(lines, viewport.width);
      let ordered = [];
      if (split) {
        const leftLines = lines
          .filter((line) => line.minX < split.splitX)
          .sort((a, b) => b.y - a.y);
        const rightLines = lines
          .filter((line) => line.minX >= split.splitX)
          .sort((a, b) => b.y - a.y);
        ordered = [...leftLines, ...rightLines];
        console.log(` [Enhanced] Page ${pageIndex}: columns detected (left ${split.leftCount}, right ${split.rightCount})`);
        pageMeta.push({
          page: pageIndex,
          columns: 2,
          splitX: split.splitX,
          leftCount: split.leftCount,
          rightCount: split.rightCount
        });
      } else {
        ordered = lines.sort((a, b) => b.y - a.y);
        pageMeta.push({ page: pageIndex, columns: 1 });
      }

      const pageText = ordered.map((line) => line.text).join('\n').trim();
      if (pageText) {
        pages.push(pageText);
      }
    }

    const fullText = pages.join('\n\n--- PAGE BREAK ---\n\n');

    console.log(` [Enhanced] Extraction complete:`);
    console.log(`   - Original pages: ${pageCount}`);
    console.log(`   - Total characters: ${fullText.length}`);

    const cleanedText = cleanExtractedTextWithStructure(fullText, {
      format: 'pdf_positional',
      originalPageCount: pageCount
    });

    return {
      text: cleanedText,
      pageCount: pageCount,
      structure: {
        format: 'pdf_positional',
        originalPageCount: pageCount,
        preserveOriginalLayout: true,
        columnsDetected: pageMeta
      }
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    console.warn(' [Enhanced] Falling back to simple PDF parsing');

    const fallbackData = await pdfParse(buffer);
    const fallbackText = fallbackData.text || '';
    const fallbackPages = fallbackData.numpages || 1;

    const cleanedText = cleanExtractedTextWithStructure(fallbackText, {
      format: 'pdf_simple_fallback',
      originalPageCount: fallbackPages
    });

    return {
      text: cleanedText,
      pageCount: fallbackPages,
      structure: {
        format: 'pdf_simple_fallback',
        originalPageCount: fallbackPages,
        preserveOriginalLayout: true
      }
    };
  }
}

/**
 * Enhanced Word document extraction with structure preservation
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<{text: string, pageCount: number, structure: object}>} Extracted content with metadata
 */
async function extractTextFromWordWithStructure(buffer) {
  try {
    console.log(' [Enhanced] Processing Word document with structure preservation...');

    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    // Estimate page count for Word documents based on content
    const estimatedPages = estimateWordDocumentPages(text);

    console.log(` [Enhanced] Word document processed:`);
    console.log(`   - Estimated pages: ${estimatedPages}`);
    console.log(`   - Characters: ${text.length}`);

    const structure = {
      format: 'word',
      estimatedPageCount: estimatedPages,
      preserveOriginalLayout: true,
      contentLength: text.length,
      lineCount: text.split('\n').filter(line => line.trim().length > 0).length
    };

    return {
      text: text,
      pageCount: estimatedPages,
      structure: structure
    };
  } catch (error) {
    console.error('Word document parsing error:', error);
    throw new Error('Failed to parse Word document. Please ensure the document contains readable text.');
  }
}

/**
 * Estimate page count for Word documents
 * @param {string} text - Document text
 * @returns {number} Estimated page count
 */
function estimateWordDocumentPages(text) {
  const textLength = text.length;
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Word documents roughly 500 words per page, ~3000 characters per page
  let pageEstimate = Math.max(1, Math.ceil(textLength / 3000));

  // Adjust based on line count (roughly 50 lines per page)
  const lineBasedEstimate = Math.max(1, Math.ceil(lines.length / 50));

  // Take the more conservative (higher) estimate
  return Math.max(pageEstimate, lineBasedEstimate);
}

/**
 * Enhanced text cleaning that preserves structure
 * @param {string} text - Raw extracted text
 * @param {object} structure - Structure metadata
 * @returns {string} Cleaned text with structure preserved
 */
export function cleanExtractedTextWithStructure(text, structure = {}) {
  if (!text) return '';

  console.log(` [Enhanced] Cleaning text with structure preservation...`);
  console.log(`   - Input length: ${text.length} characters`);

  // AGGRESSIVE STRIPPING OF PDF METADATA
  // Use a temporary variable to avoid mutating 'text' directly in regex if logical complications arise
  let cleaned = text;

  // 1. Remove PDF File Header if present at start
  if (cleaned.startsWith('%PDF-')) {
    cleaned = cleaned.replace(/^%PDF-\d\.\d[\s\S]*?(?=\n\n|\r\n\r\n|[A-Z])/, '');
  }

  // 2. Remove XML Metadata blocks (common in PDF streams)
  cleaned = cleaned.replace(/<rdf:Description[\s\S]*?<\/rdf:Description>/g, '');
  cleaned = cleaned.replace(/<xmp:[\s\S]*?<\/xmp:[^>]+>/g, '');
  cleaned = cleaned.replace(/xmlns:[^=]+="[^"]+"/g, '');

  // 3. Remove raw PDF object artifacts
  cleaned = cleaned.replace(/^\d+\s+0\s+obj[\s\S]*?endobj/gm, '');
  cleaned = cleaned.replace(/^stream[\s\S]*?endstream/gm, '');
  cleaned = cleaned.replace(/^xref[\s\S]*?trailer/gm, '');
  cleaned = cleaned.replace(/^startxref[\s\S]*?%%EOF/gm, '');

  cleaned = cleaned
    // Remove special characters that might interfere with processing
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Preserve page breaks but clean them up
    .replace(/\n--- PAGE BREAK ---\n\n/g, '\n\n=== PAGE BREAK ===\n\n')
    // Remove excessive consecutive line breaks (but preserve page structure)
    .replace(/\n{4,}/g, '\n\n\n')
    // Clean up excessive spaces within lines but preserve line structure
    .replace(/[ \t]+/g, ' ')
    // Remove trailing spaces from each line
    .replace(/[ \t]+$/gm, '')
    // Trim whitespace
    .trim();

  // Restore page breaks in a cleaner format
  cleaned = cleaned.replace(/\n\n=== PAGE BREAK ===\n\n/g, '\n\n--- PAGE BREAK ---\n\n');

  console.log(` [Enhanced] Text cleaned:`);
  console.log(`   - Output length: ${cleaned.length} characters`);

  return cleaned;
}

/**
 * Validate extracted resume text with enhanced structure awareness
 * @param {string} text - Extracted text
 * @param {object} structure - Structure metadata
 * @returns {object} Enhanced validation result
 */
export function validateResumeTextWithStructure(text, structure = {}) {
  const cleanedText = cleanExtractedTextWithStructure(text, structure);

  const validation = {
    isValid: true,
    wordCount: 0,
    pageCount: structure.originalPageCount || structure.estimatedPageCount || 1,
    errors: [],
    warnings: [],
    structure: structure
  };

  console.log(` [Enhanced] Validating resume with ${validation.pageCount} pages...`);

  // Only fail if truly empty or no content
  if (!cleanedText || cleanedText.trim().length === 0) {
    validation.isValid = false;
    validation.errors.push('No readable text found in the document');
    return validation;
  }

  // Count words
  validation.wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;

  // Only block extremely short content (less than 10 words is clearly not a resume)
  if (validation.wordCount < 10) {
    validation.isValid = false;
    validation.errors.push('Content is too short to be a valid resume');
    return validation;
  }

  // Only block extremely long content (over 50,000 words is likely corrupted)
  const hardWordLimit = 50000;
  const softWordLimit = 15000;

  if (validation.wordCount > hardWordLimit) {
    validation.isValid = false;
    validation.errors.push('Content is too long. Please upload a concise resume with less than 50,000 words.');
    return validation;
  }

  if (validation.wordCount > softWordLimit) {
    validation.warnings.push(`Resume is long (${validation.wordCount} words). Optimization may be slower or trimmed.`);
  }

  // Enhanced validation for multi-page resumes
  if (validation.pageCount > 1) {
    console.log(` [Enhanced] Multi-page resume detected: ${validation.pageCount} pages`);
    validation.warnings.push(`Multi-page resume (${validation.pageCount} pages) - will preserve original structure`);
  }

  // Structure-aware warnings
  if (structure.format === 'pdf' && structure.contentDistribution) {
    const emptyPages = structure.contentDistribution.filter(p => p.isEmpty).length;
    if (emptyPages > 0) {
      validation.warnings.push(`${emptyPages} page(s) appear to have minimal content - consider reviewing file quality`);
    }
  }

  // Warn about short resumes but don't block them
  if (validation.wordCount < 100) {
    validation.warnings.push(`Resume appears short (${validation.wordCount} words). Consider adding more details for better optimization.`);
  }

  // Look for common resume indicators (more flexible patterns)
  const resumeIndicators = [
    /experience|work|job|position|role|employed|company/i,
    /education|degree|university|college|school|graduated/i,
    /skills|technical|programming|software|languages/i,
    /@|email|phone|contact|linkedin|github/i,
    /project|portfolio|achievement|award|certification/i
  ];

  const foundIndicators = resumeIndicators.filter(pattern => pattern.test(cleanedText)).length;

  // Warn but don't block if we don't find typical resume sections
  if (foundIndicators < 2) {
    validation.warnings.push('Resume may benefit from adding standard sections (experience, education, skills, contact info).');
  }

  // Log validation results
  console.log(` [Enhanced] Validation complete:`);
  console.log(`   - Valid: ${validation.isValid}`);
  console.log(`   - Word count: ${validation.wordCount}`);
  console.log(`   - Page count: ${validation.pageCount} (preserved)`);
  console.log(`   - Warnings: ${validation.warnings.length}`);

  return validation;
}

// Legacy compatibility functions
export async function extractTextFromFile(filePath, mimeType) {
  const result = await extractTextFromFileWithStructure(filePath, mimeType);
  return result.text;
}

export function cleanExtractedText(text) {
  return cleanExtractedTextWithStructure(text);
}

export function validateResumeText(text) {
  const result = validateResumeTextWithStructure(text);
  return {
    isValid: result.isValid,
    wordCount: result.wordCount,
    errors: result.errors,
    warnings: result.warnings
  };
}

