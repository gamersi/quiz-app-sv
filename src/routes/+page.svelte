<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Quizapp home page" />
</svelte:head>

<section>
	<Card.Root>
		<Card.Header>
			<Card.Title>Welcome to my quizapp</Card.Title>
		</Card.Header>
		<Card.Content>
			<p>
				Go to a specific route to view or go to <a href="/admin" class="text-blue-500">/admin</a> to
				create quizes
			</p>
		</Card.Content>
	</Card.Root>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
