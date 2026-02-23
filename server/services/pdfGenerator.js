import puppeteer from 'puppeteer';

/**
 * Generate PDF from HTML content using Puppeteer
 * @param {string} html - HTML content to convert to PDF
 * @param {object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePDF(html, options = {}) {
  let browser;

  try {
    console.log(' Launching Puppeteer browser with page break optimization...');

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set viewport to exact Letter paper dimensions (8.5" x 11" at 96 DPI)
    // This ensures Puppeteer's layout engine matches the PDF output dimensions
    await page.setViewport({
      width: 816,   // 8.5 inches * 96 DPI = 816px
      height: 1056, // 11 inches * 96 DPI = 1056px
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false
    });

    console.log(' Loading HTML content with page break optimization...');

    // Load the HTML content with better error handling
    try {
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: options.timeout || 30000
      });
      console.log(' HTML content loaded successfully');
    } catch (error) {
      console.error(' Failed to load HTML content:', error.message);
      throw new Error(`Failed to load HTML content: ${error.message}`);
    }

    // Inject optimized CSS for better page flow
    console.log(' Injecting optimized print CSS...');
    await page.addStyleTag({
      content: `
        /* Preserve colors and backgrounds in print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* Reduce spacing for better content flow */
        .space-y-6 > * + * {
          margin-top: 1rem !important;
        }

        .mb-8 {
          margin-bottom: 1.5rem !important;
        }

        .mb-6 {
          margin-bottom: 1.25rem !important;
        }

        .mb-4 {
          margin-bottom: 0.75rem !important;
        }

        .mb-3 {
          margin-bottom: 0.5rem !important;
        }

        /* Smart page breaks - avoid breaking section headers */
        h1, h2 {
          page-break-before: avoid !important;
          page-break-after: avoid !important;
        }

        /* Try to keep job entries together, but allow breaks if needed */
        .space-y-6 > div {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Allow breaking within large content blocks */
        .space-y-6 > div > ul,
        .space-y-6 > div > div:not(.flex) {
          page-break-inside: auto;
          break-inside: auto;
        }
      `
    });

    // Wait for layout to stabilize and fonts to load
    console.log(' Waiting for content to fully render...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Wait for any fonts or resources to finish loading
    await page.evaluate(() => {
      return new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });
    });

    console.log(' Generating PDF with intelligent page breaks...');

    // Get page dimensions for debugging
    const pageInfo = await page.evaluate(() => {
      const body = document.body;
      return {
        scrollWidth: body.scrollWidth,
        scrollHeight: body.scrollHeight,
        offsetWidth: body.offsetWidth,
        offsetHeight: body.offsetHeight,
        contentFound: body.textContent.trim().length > 0
      };
    });
    
    console.log(' Page content info:', pageInfo);
    
    if (!pageInfo.contentFound) {
      console.warn('  No content found in the page!');
    }
    
    // Generate PDF with settings that match the preview
    const format = options.format || 'Letter';
    const marginInput = options.margin || options.margins;
    const defaultMargin = {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in'
    };
    const margin = typeof marginInput === 'string' || typeof marginInput === 'number'
      ? {
        top: String(marginInput),
        right: String(marginInput),
        bottom: String(marginInput),
        left: String(marginInput)
      }
      : marginInput && typeof marginInput === 'object'
        ? {
          top: marginInput.top || defaultMargin.top,
          right: marginInput.right || defaultMargin.right,
          bottom: marginInput.bottom || defaultMargin.bottom,
          left: marginInput.left || defaultMargin.left
        }
        : defaultMargin;

    const toPositiveInt = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value > 0 ? Math.round(value) : null;
      }
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
      }
      return null;
    };

    const toPixels = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value !== 'string') return 0;
      const trimmed = value.trim();
      if (!trimmed) return 0;
      const numeric = Number.parseFloat(trimmed);
      if (!Number.isFinite(numeric)) return 0;
      if (trimmed.endsWith('in')) return numeric * 96;
      if (trimmed.endsWith('cm')) return numeric * 37.7952755906;
      if (trimmed.endsWith('mm')) return numeric * 3.77952755906;
      if (trimmed.endsWith('px')) return numeric;
      return numeric;
    };

    let finalScale = options.scale || 1.0;
    const fitToPage = options.fitToPage !== false;
    const viewport = page.viewport() || { height: 1056 };
    const targetPageCount = toPositiveInt(
      options.targetPageCount ?? options.pageCount ?? options.originalPageCount ?? options.estimatedPageCount
    );
    const marginTopPx = toPixels(margin.top);
    const marginBottomPx = toPixels(margin.bottom);

    if (fitToPage && targetPageCount) {
      const contentMetrics = await page.evaluate(() => {
        const container = document.querySelector('.resume-content') || document.querySelector('.resume-page') || document.body;
        if (!container) {
          return { height: 0 };
        }
        const rect = container.getBoundingClientRect();
        const height = Math.max(container.scrollHeight || 0, rect.height || 0);
        return { height };
      });

      const usableHeight = Math.max(1, viewport.height - marginTopPx - marginBottomPx);
      const targetHeight = usableHeight * targetPageCount;
      const scaleToFit = contentMetrics.height > 0 ? (targetHeight / contentMetrics.height) : 1;

      if (scaleToFit < 0.995) {
        finalScale = Math.min(finalScale, scaleToFit);
        console.log(
          ` Applying page-fit scale: ${finalScale.toFixed(3)} ` +
          `(target pages ${targetPageCount}, content height ${Math.round(contentMetrics.height)}px)`
        );
      }
    }

    const pdfBuffer = await page.pdf({
      format,
      margin,
      printBackground: options.printBackground ?? true,
      displayHeaderFooter: false,
      preferCSSPageSize: options.preferCSSPageSize ?? false,  // Use format + margin instead
      omitBackground: false,
      scale: finalScale,
      timeout: options.timeout || 60000
    });
    
    console.log(` Generated PDF size: ${pdfBuffer.length} bytes`);
    
    if (pdfBuffer.length < 1000) {
      console.warn('  PDF seems very small, might be empty or corrupted');
    }

    console.log(' PDF generated successfully with optimized page breaks');

    return pdfBuffer;

  } catch (error) {
    console.error(' PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Intelligent page break optimization function
 * Measures content and applies smart page break classes
 */
async function optimizePageBreaks(page, options = {}) {
  console.log(' Applying intelligent page break optimization...');
  
  await page.evaluate((opts) => {
    const PAGE_HEIGHT = 11 * 96; // 11 inches at 96 DPI
    const MARGIN_HEIGHT = 0.5 * 96 * 2; // Top and bottom margins
    const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN_HEIGHT;
    
    // Function to measure element height
    function getElementHeight(element) {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
      return rect.height + marginTop + marginBottom;
    }
    
    // Find all resume sections
    const sections = document.querySelectorAll(
      '.resume-section, .experience-item, .education-item, .project-item, section, [class*="section"]'
    );
    
    let currentPageHeight = 0;
    
    sections.forEach((section, index) => {
      const sectionHeight = getElementHeight(section);
      
      // Check if this section would overflow the current page
      if (currentPageHeight + sectionHeight > USABLE_HEIGHT && currentPageHeight > 0) {
        // Force a page break before this section
        section.style.pageBreakBefore = 'always';
        section.style.breakBefore = 'page';
        currentPageHeight = sectionHeight;
      } else {
        currentPageHeight += sectionHeight;
      }
      
      // If section itself is too tall, allow internal breaking
      if (sectionHeight > USABLE_HEIGHT) {
        section.style.pageBreakInside = 'auto';
        section.style.breakInside = 'auto';
        
        // Find sub-elements that can break
        const breakableElements = section.querySelectorAll(
          '.job-description, .project-description, ul, ol, p'
        );
        breakableElements.forEach(el => {
          el.style.pageBreakInside = 'auto';
          el.style.breakInside = 'auto';
        });
      } else {
        // Keep shorter sections together
        section.style.pageBreakInside = 'avoid';
        section.style.breakInside = 'avoid';
      }
    });
    
    // Handle headers - never separate from content
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
      header.style.pageBreakAfter = 'avoid';
      header.style.breakAfter = 'avoid';
      header.style.pageBreakInside = 'avoid';
      header.style.breakInside = 'avoid';
    });
    
    // Handle lists - try to keep items together
    const listItems = document.querySelectorAll('li');
    listItems.forEach(item => {
      const itemHeight = getElementHeight(item);
      if (itemHeight < 1 * 96) { // Less than 1 inch
        item.style.pageBreakInside = 'avoid';
        item.style.breakInside = 'avoid';
      }
    });
    
    console.log(` Optimized ${sections.length} sections for better page breaks`);
  }, options);
  
  // Wait a moment for layout to settle
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Generate PDF from URL
 * @param {string} url - URL to convert to PDF
 * @param {object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePDFFromURL(url, options = {}) {
  let browser;

  try {
    console.log(' Launching Puppeteer browser...');

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log(` Navigating to ${url}...`);

    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    console.log(' Generating PDF...');

    const pdfBuffer = await page.pdf({
      format: options.format || 'Letter',
      margin: {
        top: options.margin || '0.5in',
        right: options.margin || '0.5in',
        bottom: options.margin || '0.5in',
        left: options.margin || '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: false
    });

    console.log(' PDF generated successfully');

    return pdfBuffer;

  } catch (error) {
    console.error(' PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default {
  generatePDF,
  generatePDFFromURL
};
