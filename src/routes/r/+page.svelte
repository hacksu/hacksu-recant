<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const redirects = $derived(data.redirects || []);
</script>

<div class="bg-hacksu-grey h-screen">
<div class="container mx-auto px-4 py-8 max-w-3xl">
	<h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Active Redirects</h1>
	<p class="text-gray-600 dark:text-gray-400">The redirect you tried did not work. Maybe you were looking for one of these?</p>
	{#if redirects.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
			<p class="text-gray-600 dark:text-gray-400">No active redirects right now.</p>
		</div>
	{:else}
		<ul class="space-y-3">
			{#each redirects as redirect}
				<li class="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
					<div>
						<p class="font-mono text-sm text-gray-900 dark:text-white">/r/{redirect.slug}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 break-all">{redirect.targetUrl}</p>
					</div>
					<a
						href={redirect.targetUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
					>
						Open
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
</div>
