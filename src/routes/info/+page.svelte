<script lang="ts">
	import type { PageData } from './$types';
	import InformationCard from '$lib/components/InformationCard.svelte';

	let { data }: { data: PageData } = $props();

	const informations = $derived(data.information || []);
</script>

<div class="w-full min-h-[50vh] bg-gradient-to-tl from-hacksu-green to-hacksu-blue p-6 md:p-24 overflow-auto">
	<h1 class="mx-auto mb-10 text-center text-white text-4xl font-bold">Helpful Resources</h1>

	{#if informations.length === 0}
		<div class="max-w-2xl mx-auto text-center text-white bg-black/15 p-6 rounded-xl">
			<p>No helpful information has been added yet.</p>
		</div>
	{:else}
		{#each informations as information}
			<InformationCard {information} />
		{/each}
	{/if}
</div>
