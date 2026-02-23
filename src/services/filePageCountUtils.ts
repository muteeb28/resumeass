import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local worker file from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract page count from a PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('Failed to extract PDF page count:', error);
    return 1; // Default to 1 page if extraction fails
  }
}

/**
 * Estimate page count from DOCX/DOC files based on file size
 * This is a heuristic estimation
 */
function estimateDocPageCount(file: File): number {
  const sizeInKB = file.size / 1024;
  
  // Rough estimation: ~50KB per page for DOCX
  // Adjust based on typical resume sizes
  if (sizeInKB < 30) return 1;
  if (sizeInKB < 80) return 2;
  if (sizeInKB < 130) return 3;
  
  return Math.ceil(sizeInKB / 50);
}

/**
 * Get page count from any supported file type
 */
export async function getFilePageCount(file: File): Promise<number> {
  const mimeType = file.type;
  
  if (mimeType === 'application/pdf') {
    return await getPdfPageCount(file);
  } else if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return estimateDocPageCount(file);
  }
  
  // Default to 1 page for unknown types
  return 1;
}
