<script lang="ts">
	import type { PageData } from './$types';
	import InformationCard from '$lib/components/InformationCard.svelte';

	let { data }: { data: PageData } = $props();

	const informations = $derived(data.information || []);
</script>

<div class="info-page-container">
	<h1 class="page-title">Helpful Resources</h1>

	{#if informations.length === 0}
		<div class="empty-state">
			<p>No helpful information has been added yet.</p>
		</div>
	{:else}
		{#each informations as information}
			<InformationCard {information} />
		{/each}
	{/if}
</div>

<style>
	* {
		box-sizing: border-box;
	}

	.info-page-container {
		background: linear-gradient(to top left, #35c982, #4683ff);
		width: 100%;
		background-repeat: repeat;
		min-height: 50vh;
		padding: 100px;
		overflow: auto;
	}

	@media (max-width: 1000px) {
		.info-page-container {
			padding: 100px 10px;
		}
	}

	.page-title {
		margin: 0 auto 40px auto;
		text-align: center;
		color: white;
		font-size: 2.5rem;
		font-weight: bold;
	}

	.empty-state {
		max-width: 600px;
		margin: 0 auto;
		text-align: center;
		color: white;
		background-color: rgba(0, 0, 0, 0.15);
		padding: 24px;
		border-radius: 12px;
	}
</style>
