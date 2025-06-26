import { CommentContext, InsightAnalysisResult } from './../types.js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { ALLOWED_TAGS, AUDIENCE_TYPES } from '../constants.js';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const systemPrompt = `
	You are an expert market research analyst with a strong sense for viable startup ideas. Your job is to dissect a user comment to find actionable insights that a founder could realistically build a business around. You will be given the original post's title and content, as well as a comment thread.
		
	**Your Process:**
	1.  **Identify the Subject:** First, determine the specific product, company, or technology that the **target_comment** is about. Prioritize the context from the parent/grandparent comments. If they mention a specific subject (e.g., "Duolingo"), use that, even if the main post is about something else. The **post_title** and **post_content** are your fallbacks for context.
	2.  **Describe the Subject:** Briefly describe the identified subject in a few words (e.g., "an AI language tutor", "a vector database").
	3.  **Classify the Audience:** Determine the primary audience for this insight.
	4.  **Evaluate Market Potential:** Assess if the pain point or yearning represents a solvable problem with a reasonably broad market. A problem with an existing, heavily-entrenched monopoly or a problem that only affects a handful of kernel developers is NOT a high-potential opportunity.
	5.  **Analyze the Target Comment:** Based on this context, analyze the **target_comment** for a specific pain point or product yearning.
	6.  **Be Specific & Self-Contained:** Your final summary must be understandable to someone who has NOT read the original post. It should incorporate the subject's name and description.

	**Guiding Principles:**
	- Your analysis is ALWAYS about the **target_comment**.
	- **Prioritize Actionability:** Focus on problems that a new product or service could tangibly solve. A complaint about a fundamental law of physics or a political system is not an actionable insight.
	- **Filter for Viability:** Ignore insights that are hyper-niche (e.g., a bug in a 20-year-old library) or address markets dominated by a near-monopoly (e.g., a slightly better search engine than Google).
	- You MUST only use tags and audience types from the provided lists.
	
	**Output Specification (Tool Calling):**
	You **MUST** respond with a single function call to \`record_insight\`.
`;

const analysisTool = (allowedTags: string[], allowedAudiences: readonly string[]) => ({
	type: 'function',
	function: {
		name: 'record_insight',
		description: 'Records the analysis of a target comment.',
		parameters: {
			type: 'object',
			properties: {
				contains_insight: { type: 'boolean', description: 'Set to true only if the comment contains an actionable insight.' },
				subject_name: { type: 'string', description: 'The specific name of the product, space, or technology being discussed (e.g., "Microsoft", "Issen", "Clothing", "Acquiring New Users", "Duolingo").' },
				subject_description: { type: 'string', description: 'A brief, generic description of the subject (e.g., "an AI language tutor").' },
				audience_type: {
					type: 'string',
					enum: [...allowedAudiences],
					description: `The primary target audience for this insight.`,
				},
				market_potential: {
					type: 'string',
					enum: ['high', 'medium', 'low'],
					description: "The estimated potential for a startup to solve this problem. 'High' for broad, unmet needs. 'Low' for hyper-niche or unsolvable problems.",
				},
				insight_type: { type: 'string', enum: ['pain-point', 'product-yearning'] },
				summary: { type: 'string', description: 'A concise, self-contained summary of the core insight that includes the subject name.' },
				tags: {
					type: 'array',
					items: { type: 'string' },
					description: `An array of 3-5 relevant lowercase tags from the following list: ${allowedTags.join(', ')}`,
				},
			},
			required: ['contains_insight'],
		},
	},
} as const);

export async function analyzeComment(
	context: CommentContext
): Promise<InsightAnalysisResult | null> {
	try {
		const tool = analysisTool(ALLOWED_TAGS, AUDIENCE_TYPES);
		const chatCompletion = await openai.chat.completions.create({
			model: 'o4-mini',
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: JSON.stringify(context, null, 2),
				},
			],
			tools: [tool],
			tool_choice: { type: 'function', function: { name: 'record_insight' } },
		});
		
		const toolCall = chatCompletion.choices[0]?.message?.tool_calls?.[0];
		if (!toolCall || toolCall.function.name !== 'record_insight') {
			console.error('[Analysis] Invalid tool call received from API.');
			return null;
		}

		const args = JSON.parse(toolCall.function.arguments);
		
		const analysisResult: InsightAnalysisResult = {
			contains_insight: args.contains_insight ?? false,
			subject_name: args.subject_name ?? null,
			subject_description: args.subject_description ?? null,
			audience_type: args.audience_type ?? null,
			market_potential: args.market_potential ?? null,
			insight_type: args.insight_type ?? null,
			summary: args.summary ?? null,
			tags: args.tags ?? null,
		};

		return analysisResult;
	} catch (error) {
		console.error('[Analysis] Error calling OpenAI API:', error);
		return null;
	}
}

export async function createEmbedding(text: string): Promise<number[] | null> {
	try {
		const response = await openai.embeddings.create({
			model: 'text-embedding-3-small',
			input: text,
		});
		return response.data[0].embedding;
	} catch (error) {
		console.error('[Embedding] Error creating embedding:', error);
		return null;
	}
}
