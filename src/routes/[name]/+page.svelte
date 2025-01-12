<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ActionData, PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

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
			<Card.Title>{data.quiz.heading}</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-lg">{data.quiz.body}</p>
			{#if !form?.success}
				<form method="post" action="?/submit" use:enhance>
					<div class="flex flex-col gap-4 pt-4">
						<input type="hidden" name="id" value={data.quiz.id} />
						<Label for="answer">{data.quiz.submitText}</Label>
						<Input type="text" name="answer" id="answer" />
						<Button type="submit">Submit</Button>
						<p style="color: red">{form?.message ?? ''}</p>
					</div>
				</form>
			{:else}
				<p style="color: green">{form.message}</p>
			{/if}
		</Card.Content>
	</Card.Root>
{/if}
