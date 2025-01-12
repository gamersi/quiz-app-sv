<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";
	
	import { toggleMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button/index.js";
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
			<p class="pb-4">
				Go to a specific route to view or go to <a href="/admin" class="text-blue-500">/admin</a> to
				create quizes
			</p>
			<Button onclick={toggleMode} variant="outline" size="icon">
				<Sun
				  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
				  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			  </Button>
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
