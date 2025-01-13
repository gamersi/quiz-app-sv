import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	const name = event.params.name;

	const quiz = (
		await db
			.select({
				id: table.quiz.id,
				name: table.quiz.name,
				heading: table.quiz.heading,
				body: table.quiz.body,
				submitText: table.quiz.submitText,
				adminId: table.quiz.adminId
			})
			.from(table.quiz)
			.where(eq(table.quiz.name, name))
	).at(0);

	return { quiz };
};

export const actions: Actions = {
	submit: async (event) => {
		const formData = await event.request.formData();
		const answer = formData.get('answer')?.toString().trim();
		const quizId = Number(formData.get('id'));

		if (!quizId) {
			return fail(400, { message: 'Invalid quiz ID' });
		}

		if (!answer) {
			return fail(400, { message: 'Answer cannot be empty' });
		}

		const recentSubmission = (
			await db
				.select({
					createdAt: table.submission.createdAt,
					correct: table.submission.correct
				})
				.from(table.submission)
				.where(eq(table.submission.quizId, quizId))
				.orderBy(desc(table.submission.createdAt))
		).at(0);

		if (
			recentSubmission &&
			new Date().getTime() - recentSubmission.createdAt.getTime() < 5 * 60 * 1000 &&
			!recentSubmission.correct
		) {
			return fail(400, {
				message:
					'You can only submit once every 5 minutes (next submission available in ' +
					formatTime(
						5 * 60 * 1000 - (new Date().getTime() - recentSubmission.createdAt.getTime())
					) +
					' minutes)'
			});
		}

		const quiz = (
			await db
				.select({
					answer: table.quiz.answer
				})
				.from(table.quiz)
				.where(eq(table.quiz.id, quizId))
		).at(0);

		if (!quiz) {
			return fail(400, { message: 'Quiz not found' });
		}

		if (RegExp(quiz.answer).test(answer)) {
			await db
				.insert(table.submission)
				.values({ quizId, answer, correct: true, createdAt: new Date() });
			return { success: true, message: answer + ' is correct' };
		} else {
			await db
				.insert(table.submission)
				.values({ quizId, answer, correct: false, createdAt: new Date() });
			return fail(400, { message: 'Wrong, try again in 5 minutes' });
		}
	}
};

function formatTime(ms: number) {
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
