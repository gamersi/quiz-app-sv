<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let { form }: { form: ActionData } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Login</Card.Title>
	</Card.Header>
	<form method="post" action="?/register" use:enhance>
		<Card.Content>
			<Label for="username">Username</Label>
			<Input name="username" id="username" />
			<Label for="email">E-Mail</Label>
			<Input type="email" name="email" id="email" />
			<Label for="password">Password</Label>
			<Input type="password" name="password" id="password" />
		</Card.Content>
		<Card.Footer>
			<div class="flex items-center justify-between gap-2">
				<Button type="submit">Login</Button>
				<p style="color: red">{form?.message ?? ''}</p>
			</div>
		</Card.Footer>
	</form>
</Card.Root>
