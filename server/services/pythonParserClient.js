import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.PYTHON_PDF_SERVICE_URL || 'http://localhost:8100';

/**
 * Check if the Python PDF service is running.
 * @returns {Promise<boolean>}
 */
export async function isPythonServiceHealthy() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send a PDF file to the Python service for text extraction.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{rawText: string, pageCount: number}>}
 */
export async function extractResumeWithPython(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const form = new FormData();
  form.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), fileName);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const res = await fetch(`${BASE_URL}/extract`, {
    method: 'POST',
    body: form,
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Python PDF service error (${res.status}): ${body}`);
  }

  return res.json();
}
