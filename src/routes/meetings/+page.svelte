<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import MeetingCard from '$lib/components/MeetingCard.svelte';

	let { data }: { data: PageData } = $props();

	// Ensure we track data.meetings reactively
	const meetings = $derived(data.meetings || []);

	const sineWavePeriod = 1500;
	const sineWaveWidth = 200;

	let cardGroups: HTMLDivElement[][] = $state([]);
	let translations: string[][] = $state([]);

	function updateContainerPositions() {
		if (typeof window === 'undefined') return;

		if (window.innerWidth < 800) {
			// don't apply a sine wave translation if the window is narrow and there isn't room
			translations = [];
			return;
		}

		const groupCount = groupedMeetingsArray.length;
		translations = [];

		for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
			const groupCards = cardGroups[groupIndex] || [];
			if (groupCards.length === 0) continue;

			translations.push([]);

			// the y-coordinate that the sine wave starts at is the same as the top
			// edge of the first event container in this group
			const start = groupCards[0]?.getBoundingClientRect().top || 0;

			for (const card of groupCards) {
				if (!card) continue;

				const contRect = card.getBoundingClientRect();
				const pos = contRect.top + contRect.height / 2 - start;
				const waveOffset = -Math.sin((pos / sineWavePeriod) * (Math.PI * 2)) * (sineWaveWidth / 2);

				translations[groupIndex].push(`translateX(${waveOffset}px)`);
			}
		}
	}

	const backgroundSize = `${sineWaveWidth}px ${sineWavePeriod}px`;

	// Group meetings by semester - convert to array of [label, meetings] pairs for SSR compatibility
	const groupedMeetingsArray = $derived.by(() => {
		// create a map which will store ordered key-value pairs, where the key is
		// the name of the semester and the value is an array of meetings from that
		// semester
		const result = new Map<string, typeof meetings>();

		// Ensure meetings exists and is an array
		if (!meetings || !Array.isArray(meetings)) {
			return [];
		}

		if (meetings.length === 0) {
			return [];
		}

		// iterate through the meetings (which are fetched in reverse chronological
		// order) and create groups based on the semesters that they fall into
		for (const event of meetings) {
			try {
				// Handle date - it might be a string or Date object
				const date = event.date instanceof Date ? event.date : new Date(event.date);
				
				// Check if date is valid
				if (isNaN(date.getTime())) {
					continue;
				}

				const label = (date.getMonth() < 6 ? 'Spring' : 'Fall') + ' ' + date.getFullYear();

				if (!result.has(label)) {
					result.set(label, [event]);
				} else {
					result.get(label)!.push(event);
				}
			} catch (error) {
				// Silently skip invalid meetings
			}
		}

		// Keep meetings in reverse chronological order (newest first) within each semester
		// Meetings are already in reverse chronological order from the database query
		const entries: Array<[string, typeof meetings]> = [];
		for (const [key, meetings] of result.entries()) {
			entries.push([key, meetings]); // Don't reverse - keep newest first
		}

		return entries;
	});

	// Keep Map version for client-side operations
	const groupedMeetings = $derived(() => {
		const map = new Map<string, typeof meetings>();
		for (const [key, meetings] of groupedMeetingsArray) {
			map.set(key, meetings);
		}
		return map;
	});

	// Initialize card groups when groupedMeetingsArray changes
	$effect(() => {
		const groupCount = groupedMeetingsArray.length;
		if (cardGroups.length !== groupCount) {
			cardGroups = Array(groupCount).fill(null).map(() => []);
		}
		// Ensure each group array exists
		for (let idx = 0; idx < groupCount; idx++) {
			if (!cardGroups[idx]) {
				cardGroups[idx] = [];
			}
		}
	});

	onMount(() => {
		updateContainerPositions();
		window.addEventListener('resize', updateContainerPositions);
		return () => {
			window.removeEventListener('resize', updateContainerPositions);
		};
	});

	// Update positions when groupedMeetingsArray or cardGroups change
	$effect(() => {
		groupedMeetingsArray; // Track dependency
		cardGroups; // Track dependency
		if (typeof window !== 'undefined') {
			setTimeout(updateContainerPositions, 100);
		}
	});
</script>

<div class="event-page-container">
	{#if groupedMeetingsArray.length === 0}
	<div class="text-center py-20">
		<h1 class="page-title">No Meetings Yet</h1>
		<p class="text-white text-lg">Check back soon for upcoming meetings!</p>
	</div>
{:else}
	{#each groupedMeetingsArray as [label, groupMeetings], i}
		<div>
			<h1 class="page-title">
				{label} Meetings{#if i > 0} (Archive){/if}
			</h1>
			<div class="event-list-container" style="background-size: {backgroundSize};">
				{#each groupMeetings as meeting, j}
					{@const groupCards = cardGroups[i] || []}
					<div
						bind:this={groupCards[j]}
						style={translations[i]?.[j] ? `transform: ${translations[i][j]};` : ''}
					>
						<MeetingCard {meeting} />
					</div>
				{/each}
			</div>
		</div>
	{/each}
{/if}
</div>

<style>
	* {
		box-sizing: border-box;
	}

	.event-page-container {
		background: linear-gradient(to top left, #35c982, #4683ff);
		min-height: 100vh;
		padding: 60px 100px 100px 100px;
		overflow: auto;
	}

	@media (max-width: 700px) {
		.event-page-container {
			padding: 100px 10px;
		}
	}

	.page-title {
		text-align: center;
		color: white;
		font-size: 2.5rem;
		font-weight: bold;
		margin-bottom: 2rem;
		padding: 10px;
	}

	.event-list-container {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='1500' viewBox='0 0 200 1500'%3E%3Cpath d='M 100 0 Q 100 375 0 750 T 100 1500' stroke='rgba(255,255,255,0.15)' stroke-width='2' fill='none'/%3E%3C/svg%3E");
		background-repeat: repeat-y;
		background-position: center top;
	}
</style>
