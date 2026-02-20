import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { SCORE_MAX_TEXT_CHARS, SCORER_TEMPERATURE } from '../constants.js';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface UsefulnessGeneralityScore {
	usefulness: number;
	generality: number;
}

const SYSTEM_PROMPT = `You are a classifier. Your ONLY job is to output two numbers between 0.0 and 1.0 for the given text.

**How these scores are used:** This comment will be grouped with other comments from the same discussion into a "bundle." Only comments above the usefulness and generality thresholds are included. A separate step then reads the full bundle and derives one pain point or product yearning for the whole discussion. Score usefulness as: "If this comment were in that bundle, would it contribute a concrete pain or yearning the analyst could use?" If it would not (e.g. it's just sentiment or filler), score low.

**Output format:** Respond with ONLY a JSON object, no other text: { "usefulness": number, "generality": number }

---

**1. USEFULNESS (0.0–1.0)**  
"If this comment were in a bundle of other comments from a shared thread that gets analyzed for one pain point or product yearning, would it contribute something concrete — or is it just sentiment/filler?" If it would not contribute, score LOW.

- **High (0.7–1.0):** The text names a *concrete* problem, workflow, or desire that could be addressed by building something specific — the kind of thing that would show up in a bundle-level summary. Examples: "I wish there was a tool that…", "The worst part is having to manually…", "Nobody has solved X well yet", "We need a better way to do Y." There must be a buildable "what" — not just sentiment.
- **Low (0.0–0.3):** No actionable signal. Score LOW for: small talk; pure questions; generic praise; **broad industry/society complaints** ("the industry doesn't understand X", "companies should embrace Y", "40 years and they still don't get Z") — these are sentiments, not product opportunities; **hot takes or opinions** with no concrete product angle; anything where a founder could not point to a specific thing to build.
- **Middle (0.4–0.6):** Some implied friction or desire but vague or not specific enough to build for; could go either way.

---

**2. GENERALITY (0.0–1.0)**  
"How broadly relatable is the topic? Would a meaningful number of people (not just a tiny niche) care?"

- **High (0.7–1.0):** Many people could relate. The topic is about everyday workflows, common tools, broad categories (email, calendars, learning, health, money, communication). Examples: "email is overwhelming", "want a simpler way to manage subscriptions", "people struggle to find good local X."
- **Low (0.0–0.3):** Hyper-niche or very technical. Only a tiny audience would care: e.g. a specific bug in an obscure library, a narrow edge case for one tool (e.g. "Proton on Wayland vsync compositor flags"), jargon that 99% of people don't use. Score low even if the text is useful for that niche—we care about *broad* relatability.
- **Middle (0.4–0.6):** A real but somewhat specialized topic (e.g. dev tools used by many developers, or a common problem in one industry).

---

**Rules:**  
- Score independently: usefulness and generality are separate. A text can be useful but narrow (e.g. 0.8 usefulness, 0.2 generality) or broad but vague (0.3 usefulness, 0.8 generality).  
- If the text is only a broad complaint or opinion with no specific thing to build, usefulness must be LOW (0.0–0.3).  
- Use decimals (e.g. 0.7, 0.25).  
- Output ONLY the JSON object. No explanation, no markdown, no other text.`;

export async function scoreUsefulnessGenerality(text: string): Promise<UsefulnessGeneralityScore | null> {
	if (!text || text.trim().length < 10) {
		return { usefulness: 0, generality: 0 };
	}
	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: text.slice(0, SCORE_MAX_TEXT_CHARS) },
			],
			temperature: SCORER_TEMPERATURE,
		});
		const content = completion.choices[0]?.message?.content?.trim();
		if (!content) return null;
		const parsed = JSON.parse(content) as { usefulness?: number; generality?: number };
		const usefulness = Math.max(0, Math.min(1, Number(parsed.usefulness) || 0));
		const generality = Math.max(0, Math.min(1, Number(parsed.generality) || 0));
		return { usefulness, generality };
	} catch (error) {
		console.error('[Score] Error:', error);
		return null;
	}
}
