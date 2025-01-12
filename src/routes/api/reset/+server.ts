import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
	if (!locals.session) {
		return new Response(null, { status: 401 });
	}
	if (!locals.admin) {
		return new Response(null, { status: 403 });
	}

	const data = await request.json();
	const { id } = data;
	if (!id) {
		return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
			status: 400
		});
	}

	const quiz = (
		await db
			.select({
				adminId: table.quiz.adminId
			})
			.from(table.quiz)
			.where(eq(table.quiz.id, id))
	).at(0);

	if (!quiz || quiz.adminId !== locals.admin.id) {
		return new Response(JSON.stringify({ success: false, message: 'Quiz not found' }), {
			status: 400
		});
	}

	await db.delete(table.submission).where(eq(table.submission.quizId, id));

	return new Response(JSON.stringify({ success: true }));
}
