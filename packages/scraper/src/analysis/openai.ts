import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// This is the structured data we expect back from the model.
// It will be used to create a NewInsight in queries.ts
export interface InsightAnalysisResult {
	contains_insight: boolean;
	insight_type: 'pain-point' | 'product-yearning' | null;
	summary: string | null;
	tags: string[] | null;
}

// This is the context the function will receive
interface CommentContext {
	grandparent_comment: string | null;
	parent_comment: string | null;
	target_comment: string;
}

const systemPrompt = `
	You are an expert market research analyst specializing in identifying user pain points and product yearnings from online conversations. Your task is to analyze a comment from Hacker News within the context of its parent and grandparent comments. Your goal is to determine if the **target comment** contains a genuine insight and, if so, to extract and structure that insight.
	
	**Your Guiding Principles:**
	1.  **Focus on the Target:** Your analysis must be about the **[TARGET]** comment. The **[PARENT]** and **[GRANDPARENT]** comments are for context only. They help you understand sarcasm, nuance, and the topic of discussion.
	2.  **Identify Actionable Insights:** Do not extract generic complaints or simple agreement/disagreement. Look for specific problems users are facing or concrete features/products they wish existed.
	3.  **Be Immune to Noise:** Ignore spam, off-topic conversations, and comments that provide no real substance. If the target comment is noise, you must indicate that.
	4.  **Detect Nuance:** Be highly critical of short, generic phrases like "I agree" or "This is great." Unless the context makes it crystal clear they are endorsing a specific pain point or yearning, classify them as noise. Be on the lookout for sarcasm and irony.
	
	**Input Format:**
	You will receive a JSON object containing the conversation thread:
	{
	  "grandparent_comment": "Text of the grandparent comment, or null if not applicable.",
	  "parent_comment": "Text of the parent comment, or null if not applicable.",
	  "target_comment": "The text of the comment to be analyzed."
	}
	
	**Output Specification (Tool Calling):**
	You **MUST** respond with a single function call to \`record_insight\`.
`;

const analysisTool = {
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
						'Set to true only if the target_comment contains a specific, actionable pain point or product yearning. Otherwise, set to false.',
				},
				insight_type: {
					type: 'string',
					enum: ['pain-point', 'product-yearning'],
					description:
						'Required if contains_insight is true. The type of insight found.',
				},
				summary: {
					type: 'string',
					description:
						'Required if contains_insight is true. A concise, one-sentence summary of the core insight, rewritten in the third person.',
				},
				tags: {
					type: 'array',
					items: {
						type: 'string',
					},
					description:
						'Required if contains_insight is true. An array of 3-5 relevant lowercase tags that categorize the insight.',
				},
			},
			required: ['contains_insight'],
		},
	},
} as const; // Using 'as const' for stronger type inference

/**
 * Analyzes a comment thread to extract a potential insight using the OpenAI API.
 * @param context - An object containing the text of the target comment and its ancestors.
 * @returns An InsightAnalysisResult object, or null if an error occurs.
 */
export async function analyzeComment(
	context: CommentContext
): Promise<InsightAnalysisResult | null> {
	try {
		const chatCompletion = await openai.chat.completions.create({
			model: 'o4-mini', //Expensive as shite
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: JSON.stringify(context),
				},
			],
			tools: [analysisTool],
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

		// Basic validation to ensure the parsed object matches our expected structure.
		const analysisResult: InsightAnalysisResult = {
			contains_insight: args.contains_insight ?? false,
			insight_type: args.insight_type ?? null,
			summary: args.summary ?? null,
			tags: args.tags ?? null,
		};

		return analysisResult;
	} catch (error) {
		console.error('[Analysis] Error calling OpenAI API:', error);
		// Return null to indicate failure so the pipeline can continue.
		return null;
	}
}

/**
 * Creates a vector embedding for a given text using OpenAI's API.
 * @param text - The text to embed.
 * @returns A promise that resolves to an array of numbers (the vector) or null on failure.
 */
export async function createEmbedding(text: string): Promise<number[] | null> {
	try {
		const response = await openai.embeddings.create({
			model: 'text-embedding-3-small', // Cost-effective and powerful
			input: text,
		});
		return response.data[0].embedding;
	} catch (error) {
		console.error('[Embedding] Error creating embedding:', error);
		return null;
	}
}
