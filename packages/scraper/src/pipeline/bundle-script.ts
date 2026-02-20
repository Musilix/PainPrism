/**
 * Builds a conversation script from a post and its comments in reply order.
 * Format: "OP said: ...\n\nUser A replied to OP: ...\n\nUser B replied to User A: ..."
 */

interface CommentForScript {
	id: number;
	parentCommentId: number | null;
	author: string | null;
	text: string;
}

interface PostForScript {
	title: string;
	post_content: string | null;
	author: string | null;
}

function getAuthorLabel(author: string | null): string {
	return author?.trim() || 'Anonymous';
}

export function buildBundleScript(
	post: PostForScript,
	comments: CommentForScript[]
): string {
	const lines: string[] = [];
	const postAuthor = getAuthorLabel(post.author);
	const postBody = [post.title, post.post_content].filter(Boolean).join('\n\n').trim() || '(no content)';
	lines.push(`OP (${postAuthor}) said:\n${postBody}`);

	if (comments.length === 0) {
		return lines.join('\n\n---\n\n');
	}

	const byParent = new Map<number | null, CommentForScript[]>();
	for (const c of comments) {
		const pid = c.parentCommentId;
		if (!byParent.has(pid)) byParent.set(pid, []);
		byParent.get(pid)!.push(c);
	}
	const idToAuthor = new Map<number, string>();
	idToAuthor.set(-1, 'OP'); // fake id for post
	for (const c of comments) {
		idToAuthor.set(c.id, getAuthorLabel(c.author));
	}

	function appendReplies(parentId: number | null, depth: number) {
		const kids = byParent.get(parentId) ?? [];
		for (const c of kids) {
			const parentLabel = parentId === null ? 'OP' : idToAuthor.get(parentId) ?? 'OP';
			const authorLabel = getAuthorLabel(c.author);
			lines.push(`${authorLabel} replied to ${parentLabel}:\n${c.text}`);
			appendReplies(c.id, depth + 1);
		}
	}

	appendReplies(null, 0);
	return lines.join('\n\n---\n\n');
}
