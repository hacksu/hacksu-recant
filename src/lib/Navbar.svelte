<script lang="ts">
	import hacksuLogo from '$lib/assets/hacksu_logo.svg';
	import { page } from '$app/stores';

	const pageStore = $derived($page);
	const isAdmin = $derived(Boolean(pageStore.data?.isAdmin));
</script>

<nav class="border-b border-gray-200 bg-hacksu-grey dark:bg-hacksu-grey backdrop-blur">
	<div class="mx-auto max-w-5xl px-4">
		<div class="flex h-16 items-center justify-between">
			<div class="w-32 flex justify-start">
				<a href="/" class="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300">
					Home
				</a>
			</div>

			<a href="/" class="flex items-center justify-center">
				<img src={hacksuLogo} alt="Hacksu" class="h-10 w-auto" />
			</a>

			<div class="w-32 flex justify-end gap-4 text-sm">
				{#if isAdmin}
					<a
						href="/admin"
						class="font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300"
					>
						Admin
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
