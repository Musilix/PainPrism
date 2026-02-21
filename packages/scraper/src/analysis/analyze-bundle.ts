import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { ALLOWED_TAGS, AUDIENCE_TYPES, BUNDLE_ANALYZER_MAX_SCRIPT_CHARS } from '../constants.js';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface BundleAnalysisResult {
	type: 'pain-point' | 'product-yearning';
	synopsis: string;
	subjectName: string | null;
	subjectDescription: string | null;
	audienceType: string | null;
	marketPotential: string | null;
	tags: string[] | null;
}

const SYSTEM_PROMPT = `You are an expert market research analyst. You are given a single conversation thread (a post and its comments) and must produce ONE bite-sized pain point or product yearning that captures what this whole discussion is about.

**Rules:**
- Output exactly ONE insight (pain-point OR product-yearning) for the entire thread. Do not list multiple.
- **Title:** Maximum 4 words; aim for 3 when possible. Punchy, scannable (e.g. "Onboarding friction", "Lightweight CRM demand").
- **Short descriptor:** Exactly 2 sentences for the card. Summarize the core point in a bit more detail than the title.
- **Synopsis:** Write like a short journalist piece for the detail page—accurate and grounded in the thread, but readable and human. Vary sentence length (mix short punchy lines with longer ones). Use contractions where natural (it's, don't, they're). Lead with what's interesting; avoid opening with "The discussion focuses on..." or similar. Do not use stock phrases like "It's important to note," "Furthermore," "In conclusion," "This highlights," or "The key takeaway is." Prefer concrete, specific language over vague summary-speak. Typically 3–5 sentences. Use paragraph breaks (a blank line between blocks) where it helps the reader—e.g. after setting up the situation, before the implication or "so what." Don't break after every sentence; only where the thought naturally shifts. Output actual newlines in the synopsis so paragraphs render correctly on the page.
- Do NOT output insights that are: (a) hyper-specific to one product or narrow technical niche, (b) mainly a feature request for a dominant incumbent (e.g. Google, Microsoft) with no clear wedge, (c) trivial or already widely solved.
- **Show HN / showcase threads:** If the thread is someone showcasing a product they built (e.g. "Show HN: I built X"), do NOT produce a product-yearning that simply describes that same product. Either extract a broader pain or category need from the discussion, or classify as a pain-point if the conversation reveals one. The insight should add value beyond "people want this thing the OP built."
- Prefer pains/yearnings that are broadly relatable and suggest a realistic product or category opportunity.
- Use only the provided audience types and tags from the lists.

**Output:** You MUST respond with a single function call to \`record_bundle_insight\`.`;

const analysisTool = (allowedTags: string[], allowedAudiences: readonly string[]) => ({
	type: 'function' as const,
	function: {
		name: 'record_bundle_insight',
		description: 'Records the single insight for this conversation bundle.',
		parameters: {
			type: 'object',
			properties: {
				insight_type: { type: 'string', enum: ['pain-point', 'product-yearning'] },
				synopsis: { type: 'string', description: 'Short journalist-style summary for the detail page. Human, readable voice: vary sentence length, use contractions, concrete language. No stock phrases (Furthermore, In conclusion, etc.). Include newline-separated paragraphs between distinct ideas where it aids readability. Typically 3–5 sentences total.' },
				subject_name: { type: 'string', description: 'Card title. Maximum 4 words; prefer 3. Punchy and scannable (e.g. "Onboarding friction", "Lightweight CRM demand").' },
				subject_description: { type: 'string', description: 'Exactly 2 sentences for the card. Summarize the core point in a bit more detail than the title.' },
				audience_type: { type: 'string', enum: [...allowedAudiences] },
				market_potential: { type: 'string', enum: ['high', 'medium', 'low'] },
				tags: { type: 'array', items: { type: 'string' } },
			},
			required: ['insight_type', 'synopsis', 'subject_name', 'subject_description'],
		},
	},
});

export async function analyzeBundle(conversationScript: string): Promise<BundleAnalysisResult | null> {
	try {
		const tool = analysisTool(ALLOWED_TAGS, AUDIENCE_TYPES);
		const chatCompletion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: conversationScript.slice(0, BUNDLE_ANALYZER_MAX_SCRIPT_CHARS) },
			],
			tools: [tool],
			tool_choice: { type: 'function', function: { name: 'record_bundle_insight' } },
		});

		const toolCall = chatCompletion.choices[0]?.message?.tool_calls?.[0];
		if (!toolCall || toolCall.function.name !== 'record_bundle_insight') {
			console.error('[Bundle Analysis] Invalid tool call.');
			return null;
		}

		const args = JSON.parse(toolCall.function.arguments);
		return {
			type: args.insight_type ?? 'pain-point',
			synopsis: args.synopsis ?? '',
			subjectName: args.subject_name ?? null,
			subjectDescription: args.subject_description ?? null,
			audienceType: args.audience_type ?? null,
			marketPotential: args.market_potential ?? null,
			tags: args.tags ?? null,
		};
	} catch (error) {
		console.error('[Bundle Analysis] Error:', error);
		return null;
	}
}
