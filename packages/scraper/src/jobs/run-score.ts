import { runScoreJob } from './score-job.js';
runScoreJob().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
