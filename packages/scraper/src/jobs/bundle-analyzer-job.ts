import {
	getBundlesNeedingAnalysis,
	getBundleWithPostAndComments,
	updateBundleSynopsis,
} from '../db/queries.js';
import { buildBundleScript } from '../pipeline/bundle-script.js';
import { analyzeBundle } from '../analysis/analyze-bundle.js';
import {
	BUNDLE_ANALYZER_MEDIAN_USEFULNESS_MIN,
	BUNDLE_ANALYZER_MEDIAN_GENERALITY_MIN,
	BUNDLE_ANALYZER_BATCH_LIMIT,
	BUNDLE_ANALYZER_DELAY_MS,
} from '../constants.js';

function delay(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

export async function runBundleAnalyzerJob() {
	console.log('[Bundle Analyzer] Starting...');
	const list = await getBundlesNeedingAnalysis(
		BUNDLE_ANALYZER_MEDIAN_USEFULNESS_MIN,
		BUNDLE_ANALYZER_MEDIAN_GENERALITY_MIN,
		BUNDLE_ANALYZER_BATCH_LIMIT
	);
	const total = list.length;
	console.log(`[Bundle Analyzer] ${total} bundles to analyze (batch limit ${BUNDLE_ANALYZER_BATCH_LIMIT}).\n`);

	let done = 0;
	for (let i = 0; i < list.length; i++) {
		const bundle = list[i]!;
		const full = await getBundleWithPostAndComments(bundle.id);
		if (!full?.post) {
			console.log(`   [${i + 1}/${total}] bundle ${bundle.id} - skipped (no post)`);
			await delay(BUNDLE_ANALYZER_DELAY_MS);
			continue;
		}
		const script = buildBundleScript(
			{ title: full.post.title, post_content: full.post.post_content, author: full.post.author },
			full.comments
		);
		const result = await analyzeBundle(script);
		if (result) {
			await updateBundleSynopsis(bundle.id, {
				synopsis: result.synopsis,
				type: result.type,
				subjectName: result.subjectName,
				subjectDescription: result.subjectDescription,
				audienceType: result.audienceType,
				marketPotential: result.marketPotential,
				tags: result.tags,
			});
			done++;
		}
		const titleShort = full.post.title.length > 50 ? full.post.title.slice(0, 47) + '...' : full.post.title;
		console.log(`   [${i + 1}/${total}] bundle ${bundle.id} ${result ? '✓' : '-'} ${titleShort}`);
		await delay(BUNDLE_ANALYZER_DELAY_MS);
	}
	console.log(`\n[Bundle Analyzer] Done. Analyzed ${done}/${total} bundles.`);
}

