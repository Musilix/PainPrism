import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const LOCK_DIR = process.cwd();
const STALE_MS = 60 * 60 * 1000; // 1 hour: if lock is older, consider it stale (crashed run)

export function tryAcquireLock(lockName: string): boolean {
	const path = join(LOCK_DIR, `.${lockName}.lock`);
	if (existsSync(path)) {
		try {
			const content = readFileSync(path, 'utf-8').trim();
			const startedAt = parseInt(content, 10);
			if (!Number.isNaN(startedAt) && Date.now() - startedAt < STALE_MS) {
				return false; // fresh lock, another run in progress
			}
		} catch {
			// corrupted or unreadable, take the lock
		}
	}
	writeFileSync(path, String(Date.now()), 'utf-8');
	return true;
}

export function releaseLock(lockName: string): void {
	const path = join(LOCK_DIR, `.${lockName}.lock`);
	try {
		if (existsSync(path)) unlinkSync(path);
	} catch {
		// ignore
	}
}

export function isLockActive(lockName: string): boolean {
	const path = join(LOCK_DIR, `.${lockName}.lock`);
	if (!existsSync(path)) return false;
	try {
		const content = readFileSync(path, 'utf-8').trim();
		const startedAt = parseInt(content, 10);
		return !Number.isNaN(startedAt) && Date.now() - startedAt < STALE_MS;
	} catch {
		return false;
	}
}
