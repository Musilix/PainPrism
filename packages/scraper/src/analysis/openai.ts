import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { ALLOWED_TAGS } from '../constants.js';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export interface InsightAnalysisResult {
	contains_insight: boolean;
	subject_name: string | null;
	subject_description: string | null;
	insight_type: 'pain-point' | 'product-yearning' | null;
	summary: string | null;
	tags: string[] | null;
}

// The context now includes the full post content for better subject identification.
interface CommentContext {
	post_title: string;
	post_content: string;
	grandparent_comment: string | null;
	parent_comment: string | null;
	target_comment: string;
}

const systemPrompt = `
	You are an expert market research analyst. Your job is to dissect a Hacker News comment to find actionable insights. You will be given the original post's title and content, as well as a comment thread.
	
	**Your Process:**
	1.  **Identify the Subject:** First, determine the specific product, company, or technology that the **target_comment** is about. Prioritize the context from the parent/grandparent comments. If they mention a specific subject (e.g., "Duolingo"), use that, even if the main post is about something else. The **post_title** and **post_content** are your fallbacks for context.
	2.  **Describe the Subject:** Briefly describe the identified subject in a few words (e.g., "an AI language tutor", "a vector database").
	3.  **Analyze the Target Comment:** Based on this context, analyze the **target_comment** for a specific pain point or product yearning.
	4.  **Be Specific & Self-Contained:** Your final summary must be understandable to someone who has NOT read the original post. It should incorporate the subject's name and description.
	
	**Guiding Principles:**
	- Your analysis is ALWAYS about the **target_comment**.
	- Ignore generic complaints. Find specific, actionable insights.
	- You MUST only use tags from the provided list.
	
	**Output Specification (Tool Calling):**
	You **MUST** respond with a single function call to \`record_insight\`.
`;

const analysisTool = (allowedTags: string[]) =>
	({
		type: 'function',
		function: {
			name: 'record_insight',
			description: 'Records the analysis of a target comment.',
			parameters: {
				type: 'object',
				properties: {
					contains_insight: {
						type: 'boolean',
						description:
							'Set to true only if the comment contains an actionable insight.',
					},
					subject_name: {
						type: 'string',
						description:
							'The specific name of the product or technology being discussed (e.g., "Issen", "Duolingo").',
					},
					subject_description: {
						type: 'string',
						description:
							'A brief, generic description of the subject (e.g., "an AI language tutor").',
					},
					insight_type: {
						type: 'string',
						enum: ['pain-point', 'product-yearning'],
					},
					summary: {
						type: 'string',
						description:
							'A concise, self-contained summary of the core insight that includes the subject name.',
					},
					tags: {
						type: 'array',
						items: { type: 'string' },
						description: `An array of 3-5 relevant lowercase tags from the following list: ${allowedTags.join(
							', '
						)}`,
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
		const tool = analysisTool(ALLOWED_TAGS);
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
			tool_choice: {
				type: 'function',
				function: { name: 'record_insight' },
			},
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
	// ... (no changes here)
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
