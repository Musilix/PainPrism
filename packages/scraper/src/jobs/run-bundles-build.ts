import { runBundleBuilderJob } from './bundle-builder-job.js';
runBundleBuilderJob().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
