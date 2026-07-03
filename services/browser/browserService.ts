import { chromium } from 'playwright';

const isHeadless = process.env.PLAYWRIGHT_HEADLESS !== 'false';

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
   * Performs a query search on Yahoo using Playwright and parses results.
   */
  async searchWeb(query: string): Promise<SearchResult[]> {
    let results = await this.queryYahooDirect(query);
    if (results.length === 0) {
      console.log('Yahoo search returned 0 results. Falling back to Bing Search...');
      results = await this.queryBingDirect(query);
    }
    return results;
  }

  private async queryYahooDirect(query: string): Promise<SearchResult[]> {
    const browser = await chromium.launch({ headless: isHeadless, channel: 'chrome' });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    try {
      const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000); // Wait for JS rendering just in case

      const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.algo-sr, .algo'));
        return items.slice(0, 5).map(item => {
          const a = item.querySelector('.compTitle a') as HTMLAnchorElement;
          const snippetEl = item.querySelector('.compText, .fz-ms');
          
          return {
            title: a ? a.textContent?.replace(/^.*?\\b(http|www|\\.\\w{2,3}\\b)/, '').trim() || a.innerText : '',
            url: a ? a.href : '',
            snippet: snippetEl?.textContent?.trim() || ''
          };
        });
      });

      const filtered = results.filter(r => r.title && r.url);

      if (!isHeadless) {
        console.log('Browser is running in headed mode. Waiting for user to close the browser...');
        await new Promise<void>((resolve) => {
          page.on('close', () => resolve());
          browser.on('disconnected', () => resolve());
        });
      }

      return filtered;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error during Yahoo direct search:', errorMessage);
      return [];
    } finally {
      await browser.close();
    }
  }

  private async queryBingDirect(query: string): Promise<SearchResult[]> {
    const browser = await chromium.launch({ headless: isHeadless, channel: 'chrome' });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    try {
      const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('li.b_algo'));
        return items.slice(0, 5).map(item => {
          const titleEl = item.querySelector('h2 a');
          const snippetEl = item.querySelector('div.b_caption p, p');
          return {
            title: titleEl?.textContent?.trim() || '',
            url: (titleEl as HTMLAnchorElement)?.href || '',
            snippet: snippetEl?.textContent?.trim() || ''
          };
        });
      });
      
      const filtered = results.filter(r => r.title && r.url);
      
      // Clean Bing redirection URLs
      const cleaned = filtered.map(r => {
        try {
          const parsed = new URL(r.url);
          const uParam = parsed.searchParams.get('u');
          if (uParam && uParam.length > 2) {
            const base64Part = uParam.slice(2);
            const decoded = Buffer.from(base64Part, 'base64').toString('utf8');
            if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
              return { ...r, url: decoded };
            }
          }
        } catch {
          // Ignore error and return original URL
        }
        return r;
      });

      if (!isHeadless) {
        console.log('Browser is running in headed mode. Waiting for user to close the browser...');
        await new Promise<void>((resolve) => {
          page.on('close', () => resolve());
          browser.on('disconnected', () => resolve());
        });
      }

      return cleaned;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error during Bing fallback search:', errorMessage);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Navigates to a specific URL, extracts its text content, and takes a screenshot.
   */
  async scrapeUrl(url: string): Promise<ScrapeResult> {
    const browser = await chromium.launch({ headless: isHeadless, channel: 'chrome' });
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

      const result = {
        url,
        title,
        textContent: truncatedText,
        screenshotBase64
      };

      if (!isHeadless) {
        console.log('Browser is running in headed mode. Waiting for user to close the browser...');
        await new Promise<void>((resolve) => {
          page.on('close', () => resolve());
          browser.on('disconnected', () => resolve());
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error scraping URL ${url}:`, errorMessage);
      const errorResult = {
        url,
        title: 'Error Loading Page',
        textContent: `Failed to load the website: ${errorMessage}`,
        screenshotBase64: ''
      };

      if (!isHeadless) {
        console.log('Browser is running in headed mode. Waiting for user to close the browser...');
        await new Promise<void>((resolve) => {
          page.on('close', () => resolve());
          browser.on('disconnected', () => resolve());
        });
      }

      return errorResult;
    } finally {
      await browser.close();
    }
  }
}
