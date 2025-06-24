import { Page } from 'playwright';

export interface ScraperSource {
	name: string;
	collectPostUrls(page: Page): Promise<Set<string>>;
	processPost(page: Page, url: string): Promise<void>;
}
