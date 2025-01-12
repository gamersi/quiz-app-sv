<script lang="ts">
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Eye from 'lucide-svelte/icons/eye';
	import TimerReset from 'lucide-svelte/icons/timer-reset';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash from 'lucide-svelte/icons/trash';
	import type { ActionData, PageServerData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Admin</title>
	<meta name="description" content="Admin page" />
</svelte:head>

<section>
	<Card.Root>
		<Card.Header>
			<Card.Title>Welcome {data.admin.username}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Sheet.Root>
				<Sheet.Trigger class={buttonVariants({ variant: 'outline' })}>Add new</Sheet.Trigger>
				<Sheet.Content>
					<Sheet.Header>
						<Sheet.Title>Add quiz</Sheet.Title>
					</Sheet.Header>
					<form method="post" action="?/add" use:enhance>
						<div class="flex flex-col gap-4">
							<Label for="name">Name</Label>
							<Input name="name" id="name" />
							<Label for="heading">Heading</Label>
							<Input name="heading" id="heading" />
							<Label for="body">Body</Label>
							<Textarea name="body" id="description" />
							<Label for="submittext">Submit text</Label>
							<Input name="submittext" id="submittext" />
							<Label for="answer">Answer (regex)</Label>
							<Input name="answer" id="answer" />
							<Button type="submit">Add</Button>
							<p style="color: red">{form?.message ?? ''}</p>
						</div>
					</form>
				</Sheet.Content>
			</Sheet.Root>

			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Heading</Table.Head>
						<Table.Head>Body</Table.Head>
						<Table.Head>Submit text</Table.Head>
						<Table.Head>Answer</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.quizzes as quiz}
						<Table.Row>
							<Table.Cell>{quiz.name}</Table.Cell>
							<Table.Cell>{quiz.heading}</Table.Cell>
							<Table.Cell>{quiz.body}</Table.Cell>
							<Table.Cell>{quiz.submitText}</Table.Cell>
							<Table.Cell>{quiz.answer}</Table.Cell>
							<Table.Cell>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}
										><ChevronDown /></DropdownMenu.Trigger
									>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.GroupHeading>Quiz Actions</DropdownMenu.GroupHeading>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												class="cursor-pointer text-blue-500 data-[highlighted]:text-blue-700"
												onclick={() => {
													window.location.href = `/${quiz.name}`;
												}}><Eye />View</DropdownMenu.Item
											>
											<DropdownMenu.Item
												class="cursor-pointer text-green-500 data-[highlighted]:text-green-700"
												onclick={async () => {
													const res = await fetch(`/api/reset`, {
														method: 'POST',
														body: JSON.stringify({ id: quiz.id })
													});
													if (!res.ok) {
														console.error('Failed to reset submissions');
													}
												}}><TimerReset />Reset Submissions</DropdownMenu.Item
											>
											<DropdownMenu.Item
												class="cursor-pointer text-yellow-500 data-[highlighted]:text-yellow-700"
												onclick={() => {
													window.location.href = `/admin/${quiz.id}`;
												}}><Pencil />Edit</DropdownMenu.Item
											>
											<DropdownMenu.Item
												class="cursor-pointer text-red-500 data-[highlighted]:text-red-700"
												onclick={async () => {
													const res = await fetch(`/api/delete`, {
														method: 'DELETE',
														body: JSON.stringify({ id: quiz.id })
													});
													if (res.ok) {
														location.reload();
													} else {
														console.error('Failed to delete quiz');
													}
												}}><Trash />Delete</DropdownMenu.Item
											>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
		<Card.Footer>
			<div class="flex items-center justify-between gap-2">
				<form method="post" action="?/logout" use:enhance>
					<Button type="submit">Logout</Button>
				</form>
			</div>
		</Card.Footer>
	</Card.Root>
</section>
