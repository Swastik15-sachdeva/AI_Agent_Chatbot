import { chromium } from 'playwright';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ScrapeResult {
  url: string;
  title: string;
  textContent: string;
  screenshotBase64: string;
}

export class BrowserService {
  /**
   * Performs a query search on DuckDuckGo using Playwright and parses results.
   */
  async searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

      const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.result'));
        return items.slice(0, 5).map(item => {
          const titleEl = item.querySelector('.result__a');
          const snippetEl = item.querySelector('.result__snippet');
          
          return {
            title: titleEl?.textContent?.trim() || '',
            url: (titleEl as HTMLAnchorElement)?.href || '',
            snippet: snippetEl?.textContent?.trim() || ''
          };
        });
      });

      return results.filter(r => r.title && r.url);
    } catch (error: any) {
      console.error('Error during DuckDuckGo search:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Navigates to a specific URL, extracts its text content, and takes a screenshot.
   */
  async scrapeUrl(url: string): Promise<ScrapeResult> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set a viewport size that is standard
    await page.setViewportSize({ width: 1280, height: 800 });

    try {
      await page.goto(url, { waitUntil: 'load', timeout: 25000 });
      
      const title = await page.title();
      
      // Capture screenshot as base64
      const screenshotBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 70
      });
      const screenshotBase64 = screenshotBuffer.toString('base64');

      // Extract clean main body text
      const textContent = await page.evaluate(() => {
        // Temporarily remove distracting UI elements to parse clean text
        const badElements = document.querySelectorAll('script, style, svg, iframe, noscript, nav, footer, header');
        badElements.forEach(el => el.remove());
        
        return document.body.innerText.trim();
      });

      // Truncate to avoid exploding token limits
      const maxChars = 10000;
      const truncatedText = textContent.length > maxChars 
        ? textContent.slice(0, maxChars) + "\n\n[Content Truncated due to length limit]" 
        : textContent;

      return {
        url,
        title,
        textContent: truncatedText,
        screenshotBase64
      };
    } catch (error: any) {
      console.error(`Error scraping URL ${url}:`, error.message);
      return {
        url,
        title: 'Error Loading Page',
        textContent: `Failed to load the website: ${error.message}`,
        screenshotBase64: ''
      };
    } finally {
      await browser.close();
    }
  }
}
