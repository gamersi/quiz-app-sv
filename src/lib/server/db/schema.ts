import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const admin = pgTable('admin', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => admin.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const quiz = pgTable('quiz', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	heading: text('heading').notNull(),
	body: text('body').notNull(),
	submitText: text('submitText').notNull(),
	answer: text('answer').notNull(),
	adminId: text('adminId').references(() => admin.id)
});

export const submission = pgTable('submission', {
	id: serial('id').primaryKey(),
	quizId: integer('quizId').references(() => quiz.id),
	answer: text('answer').notNull(),
	correct: boolean('correct').notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true, mode: 'date' }).notNull()
});

export type Admin = typeof admin.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Quiz = typeof quiz.$inferSelect;
export type Submission = typeof submission.$inferSelect;
