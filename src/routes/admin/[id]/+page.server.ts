import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.admin) {
		return fail(401);
	}
	const id = Number(event.params.id);

	const adminId = (
		await db
			.select({
				adminId: table.quiz.adminId
			})
			.from(table.quiz)
			.where(eq(table.quiz.id, id))
	).at(0);

	if (!adminId || adminId.adminId !== event.locals.admin.id) {
		return { status: 404, error: { message: 'Quiz not found' } }; // for some reason, fail(404) doesn't work here
	}

	const quiz = (await db.select().from(table.quiz).where(eq(table.quiz.id, id))).at(0);

	return { quiz: quiz };
};

export const actions: Actions = {
	edit: async (event) => {
		if (!event.locals.admin) {
			return fail(401);
		}
		const id = Number(event.params.id);

		const adminId = (
			await db
				.select({
					adminId: table.quiz.adminId
				})
				.from(table.quiz)
				.where(eq(table.quiz.id, id))
		).at(0);

		if (!adminId || adminId.adminId !== event.locals.admin.id) {
			return fail(400, { message: 'Quiz not found' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		const heading = formData.get('heading') as string;
		const body = formData.get('body') as string;
		const submitText = formData.get('submittext') as string;
		const answer = formData.get('answer') as string;
		if (!name || !heading || !body || !submitText || !answer) {
			return fail(400, { message: 'Missing required fields' });
		}
		if (!isValidRegex(answer)) {
			return fail(400, { message: 'Invalid regex' });
		}
		await db
			.update(table.quiz)
			.set({ name, heading, body, submitText, answer })
			.where(eq(table.quiz.id, id));
		return redirect(302, '/admin');
	}
};

function isValidRegex(pattern: string) {
	try {
		new RegExp(pattern);
		return true;
	} catch (e) {
		return false;
	}
}
