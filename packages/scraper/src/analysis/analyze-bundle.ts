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
- Provide: (1) a short **title** for card display (a few words, punchy), (2) a **short descriptor** (one line, for card layout), (3) a **synopsis** (2-4 sentences for the detail page).
- Do NOT output insights that are: (a) hyper-specific to one product or narrow technical niche, (b) mainly a feature request for a dominant incumbent (e.g. Google, Microsoft) with no clear wedge, (c) trivial or already widely solved.
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
				synopsis: { type: 'string', description: 'A concise, self-contained summary (2-4 sentences) of the core pain point or product yearning. Shown on the detail page.' },
				subject_name: { type: 'string', description: 'Short title for the card (a few words, punchy). E.g. "Friction in onboarding" or "Demand for lightweight CRM".' },
				subject_description: { type: 'string', description: 'One-line descriptor for card layout; even shorter than synopsis. E.g. "Users want fewer steps to first value."' },
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
