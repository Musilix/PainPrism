/**
 * This file contains constant values used across the scraper service,
 * primarily for the analysis pipeline. Centralizing them here makes
 * them easier to manage and modify without changing application logic.
 *
 * v3: The definitive, comprehensive list for the MVP.
 * This list is intentionally broad to maximize insight capture.
 */

// --- Keyword Pre-filtering List ---

const PAIN_POINT_KEYWORDS = [
	// --- Direct Frustration & Strong Emotion ---
	'frustrating',
	'annoying',
	'infuriating',
	'i hate',
	'terrible',
	'awful',
	'horrible',
	'nightmare',
	'headache',
	'sucks',
	'unacceptable',
	'disaster',
	'despise',
	'detest',
	'loathe',
	'painful',
	'a pain',
	'the worst part',

	// --- Problem Identification & Bugs ---
	'the problem is',
	'my issue is',
	'the challenge is',
	'the difficulty is',
	'the main drawback is',
	'biggest complaint',
	'bug with',
	'issue with',
	'glitch',
	'error',
	'crashed',
	'fails to',
	'doesn’t work',
	'is broken',
	'faulty',
	'defective',
	'bug report',

	// --- Friction & Inefficiency ---
	'slow',
	'clunky',
	'sluggish',
	'laggy',
	'difficult to',
	'unintuitive',
	'confusing',
	'hard to use',
	'steep learning curve',
	'takes forever',
	'waste of time',
	'tedious',
	'manual process',
	'workaround',
	'i have to manually',
	'too complicated',
	'over-engineered',
	'bloated',
	'cumbersome',
	'bottleneck',

	// --- Negative Outcomes & Risks ---
	'data loss',
	'security risk',
	'vulnerability',
	'insecure',
	'unreliable',
	'inconsistent',
	'unstable',
	'breaks down',
	'vendor lock-in',
	'compliance issue',

	// --- Usability & Design Flaws ---
	'bad ui',
	'bad ux',
	'ugly interface',
	'poor design',
	'counter-intuitive',
	'hard to navigate',
	'messy',
	'cluttered',
	'hidden feature',
	'hard to find',

	// --- Missing/Poor Documentation & Support ---
	'poor documentation',
	'docs are wrong',
	'no documentation',
	'unclear instructions',
	'confusing docs',
	'lack of examples',
	'no support',
	'bad support',
	'outdated docs',

	// --- Comparative Complaints ---
	'better than', // e.g., "X is better than Y because Y is so slow"
	'is so much better',
	'unlike tool y',
	'switched from',
	'moved away from',
	'migrated from',
	'dropped it for',
	'used to use',
];

const PRODUCT_YEARNING_KEYWORDS = [
	// --- Direct Wishes & Desires ---
	'i wish',
	'if only',
	'i would love',
	'i want a',
	'what i really want is',
	'all i want is',
	'desperately need',
	'dream feature',
	'my kingdom for',
	'really wish',

	// --- Solution Proposals & Hypotheticals ---
	'what if',
	'imagine if',
	"wouldn't it be great if",
	'they should add',
	'a feature for',
	'a way to',
	'needs a way to',
	'could be improved by',
	'potential for',
	'it would be cool if',
	'a simple toggle for',
	'add support for',

	// --- Willingness to Pay ---
	'would pay for',
	'would gladly pay',
	'take my money',
	'shut up and take my money',
	'i would pay good money for',
	'instant buy',
	'would subscribe for',
	'would pay a premium for',
	'name your price',

	// --- Market Gap Identification ---
	'needs a',
	"there's no good tool for",
	"why doesn't xyz exist",
	'someone should build',
	'someone needs to make',
	'the missing piece is',
	'huge opportunity for',
	'surprised no one has built',
	'alternative to',
	'competitor to',
	'a self-hosted',
	'an open-source',
	'a better alternative',

	// --- Direct Ideas & Requests ---
	'idea for',
	'feature request',
	'product idea',
	'a simple app that',
	'a tool that',
	'a service that',
	'a plugin for',
	'an extension for',

	// --- Integration & Compatibility Needs ---
	'integrate with',
	'api for',
	'connect to',
	'works with',
	'plugin system',
	'support for',
	'compatible with',

	// --- Simplification Requests ---
	'a simpler',
	'a lightweight',
	'a minimal',
	'just the essentials',
	'without the bloat',
	'a stripped-down version',
	'a focused tool',
];

// Combine all keywords into a single array for the regex.
// Using a Set to automatically handle any duplicates, then converting back to an array.
export const INSIGHT_KEYWORDS = [
	...new Set([...PAIN_POINT_KEYWORDS, ...PRODUCT_YEARNING_KEYWORDS]),
];
