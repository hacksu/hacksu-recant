<script lang="ts">
	import type { PageData } from './$types';
	import InformationCard from '$lib/components/InformationCard.svelte';

	let { data }: { data: PageData } = $props();

	const informations = $derived(data.information || []);
</script>

<div class="min-h-screen px-6 py-16 md:px-12 lg:px-24">
	<header class="mx-auto mb-12 max-w-2xl text-center">
		<h1 class="text-4xl font-bold text-white">Helpful Resources</h1>
	</header>

	{#if informations.length === 0}
		<div
			class="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70"
		>
			<p>No helpful information has been added yet.</p>
		</div>
	{:else}
		<div class="mx-auto max-w-6xl columns-1 gap-6 md:columns-2">
			{#each informations as information}
				<div class="mb-6 break-inside-avoid">
					<InformationCard {information} />
				</div>
			{/each}
		</div>
	{/if}
</div>
