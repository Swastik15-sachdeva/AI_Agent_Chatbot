import { BrowserService } from '@/services/browser/browserService';

export const researchTool = {
  name: 'deep_research',
  description: 'Perform an exhaustive deep research loop about a topic by doing multiple searches and page scrapings.',
  execute: async (args: { topic: string }) => {
    const browserService = new BrowserService();
    try {
      const searchResults = await browserService.searchDuckDuckGo(args.topic);
      if (searchResults.length === 0) {
        return { message: `No search results found for: "${args.topic}"` };
      }

      const pagesToScrape = searchResults.slice(0, 2);
      const contents: string[] = [];

      for (const page of pagesToScrape) {
        const scrapeRes = await browserService.scrapeUrl(page.url);
        contents.push(`
Source: ${page.title} (${page.url})
Content:
${scrapeRes.textContent.slice(0, 3000)}
------------------------------------`);
      }

      return {
        topic: args.topic,
        sourcesAnalyzed: pagesToScrape.map(p => ({ title: p.title, url: p.url })),
        compiledData: contents.join('\n')
      };
    } catch (err: any) {
      return { error: `Deep research tool run failed: ${err.message}` };
    }
  }
};
