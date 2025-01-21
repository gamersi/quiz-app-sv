import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { EmailSender, type EmailConfig, type EmailMessage } from '$lib/server/mailer';
import { env } from '$env/dynamic/private';

const emailConfig: EmailConfig = {
	host: env.SMTP_HOST || 'smtp.gmail.com',
	port: parseInt(env.SMTP_PORT || '587'),
	secure: env.SMTP_SECURE === 'true',
	auth: {
		user: env.SMTP_USER || '',
		pass: env.SMTP_PASS || ''
	}
};

const emailSender = new EmailSender(emailConfig);

function parseRegexString(regexStr: string) {
	regexStr = regexStr.trim();
	
	if (regexStr.startsWith('/')) {
	  const lastSlashIndex = regexStr.lastIndexOf('/');
	  
	  if (lastSlashIndex <= 0) {
		return {
		  pattern: regexStr,
		  flags: '',
		  regexp: new RegExp(regexStr, '')
		};
	  }
	  
	  const pattern = regexStr.slice(1, lastSlashIndex);
	  const flags = regexStr.slice(lastSlashIndex + 1);
	  
	  const validFlags = ['g', 'i', 'm', 's', 'u', 'y', 'd'];
	  const uniqueFlags = [...new Set(flags)].join('');
	  
	  if (flags !== uniqueFlags) {
		throw new Error('Invalid regex: duplicate flags are not allowed');
	  }
	  
	  for (const flag of flags) {
		if (!validFlags.includes(flag)) {
		  throw new Error(`Invalid flag: ${flag}`);
		}
	  }
	  
	  return {
		pattern,
		flags,
		regexp: new RegExp(pattern, flags)
	  };
	}
	
	return {
	  pattern: regexStr,
	  flags: '',
	  regexp: new RegExp(regexStr, '')
	};
}

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
					name: table.quiz.name,
					answer: table.quiz.answer,
					adminEmail: table.admin.email
				})
				.from(table.quiz)
				.innerJoin(table.admin, eq(table.quiz.adminId, table.admin.id))
				.where(eq(table.quiz.id, quizId))
		).at(0);

		if (!quiz) {
			return fail(400, { message: 'Quiz not found' });
		}

		if (parseRegexString(quiz.answer).regexp.test(answer)) {
			await db
				.insert(table.submission)
				.values({ quizId, answer, correct: true, createdAt: new Date() });

			const emailPromise = emailSender.sendEmail({
				from: emailConfig.auth.user,
				to: quiz.adminEmail,
				subject: 'Correct answer submitted for ' + quiz.name,
				html: `
					<h2>Correct answer submitted for ${quiz.name}</h2>
					<p>Answer: ${answer}</p>
					<p>Submission time: ${new Date().toLocaleString("de-AT")}</p>
				`
			});

			emailPromise.catch((error) => {
				console.error('Error sending email:', error);
			});
			
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
