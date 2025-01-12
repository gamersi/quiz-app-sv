import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.admin) {
		return redirect(302, '/admin/login');
	}
	const quizzes = await db
		.select()
		.from(table.quiz)
		.where(eq(table.quiz.adminId, event.locals.admin.id));
	return { admin: event.locals.admin, quizzes };
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/');
	},
	add: async (event) => {
		if (!event.locals.session) {
			return fail(401);
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
			.insert(table.quiz)
			.values({ name, heading, body, submitText, answer, adminId: event.locals.admin?.id });
		return { success: true, message: 'Quiz added' };
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
