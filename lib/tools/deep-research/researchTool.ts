import { BrowserService } from '@/services/browser/browserService';
import { Type } from '@google/genai';
import { AgentTool } from '../types';

export const researchTool: AgentTool = {
  name: 'deep_research',
  description: 'Perform an exhaustive multi-step research loop about a topic, doing multiple searches and page scrapings, returning a markdown comparison summary.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: 'The topic or query to research in detail.' }
    },
    required: ['topic']
  },
  execute: async (args: Record<string, unknown>) => {
    const { topic } = args as { topic: string };
    const browserService = new BrowserService();
    try {
      const searchResults = await browserService.searchWeb(topic);
      if (searchResults.length === 0) {
        return { message: `No search results found for: "${topic}"` };
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
        topic: topic,
        sourcesAnalyzed: pagesToScrape.map(p => ({ title: p.title, url: p.url })),
        compiledData: contents.join('\n')
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { error: `Deep research tool run failed: ${errorMessage}` };
    }
  }
};
