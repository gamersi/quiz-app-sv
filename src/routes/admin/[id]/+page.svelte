<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { PageServerData, ActionData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Admin Edit</title>
	<meta name="description" content="Admin edit page" />
</svelte:head>

<section>
	{#if !data.quiz}
		<Card.Root>
			<Card.Header>
				<Card.Title>Quiz not found</Card.Title>
			</Card.Header>
			<Card.Content>
				<p>This quiz does not exist.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Header>
				<Card.Title>Edit quiz</Card.Title>
			</Card.Header>
			<Card.Content>
				<form method="post" action="?/edit" use:enhance>
					<div class="flex flex-col gap-4">
						<Label for="name">Name</Label>
						<Input name="name" id="name" value={data.quiz.name} />
						<Label for="heading">Heading</Label>
						<Input name="heading" id="heading" value={data.quiz.heading} />
						<Label for="body">Body</Label>
						<Textarea name="body" id="description" value={data.quiz.body} />
						<Label for="submittext">Submit text</Label>
						<Input name="submittext" id="submittext" value={data.quiz.submitText} />
						<Label for="answer">Answer (regex)</Label>
						<Input name="answer" id="answer" value={data.quiz.answer} />
						<Button type="submit">Edit</Button>
						<p style="color: red">{form?.message ?? ''}</p>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}
</section>
