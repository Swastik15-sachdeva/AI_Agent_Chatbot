import { BrowserService } from '@/services/browser/browserService';

export const browserTool = {
  name: 'web_scrape',
  description: 'Scrape a specific URL to extract its main text content and take a screenshot.',
  execute: async (args: { url: string }) => {
    const service = new BrowserService();
    return await service.scrapeUrl(args.url);
  }
};
