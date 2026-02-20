import { runBundleAnalyzerJob } from './bundle-analyzer-job.js';
runBundleAnalyzerJob().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
