<script lang="ts">
	import type { PageData } from './$types';
	import MeetingCard from '$lib/components/MeetingCard.svelte';
	import { onMount } from 'svelte';
	import { getZonedMonthYear } from '$lib/utils/timezone';

	let { data }: { data: PageData } = $props();

	// Ensure we track data.meetings reactively
	const meetings = $derived(data.meetings || []);

	const sineWaveWidth = 180;

	type ConnectorGroup = {
		width: number;
		height: number;
		paths: string[];
	};

	let cardGroups: HTMLDivElement[][] = $state([]);
	let groupContainers: HTMLDivElement[] = $state([]);
	let translations: string[][] = $state([]);
	let connectorGroups: ConnectorGroup[] = $state([]);
	let connectorFrame: number | undefined;

	function updateContainerPositions() {
		if (typeof window === 'undefined') return;

		if (window.innerWidth < 800) {
			translations = [];
			return;
		}

		translations = [];

		for (let groupIndex = 0; groupIndex < groupedMeetingsArray.length; groupIndex++) {
			const groupCards = cardGroups[groupIndex] || [];
			if (groupCards.length === 0) continue;

			translations.push([]);

			for (const [cardIndex, card] of groupCards.entries()) {
				if (!card) continue;

				const offset = Math.sin((cardIndex * Math.PI) / 4) * (sineWaveWidth / 2);
				translations[groupIndex].push(`translateX(${offset}px)`);
			}
		}
	}

	function updateConnectorPaths() {
		connectorGroups = cardGroups.map((cards, groupIndex) => {
			const container = groupContainers[groupIndex];
			if (!container) return { width: 0, height: 0, paths: [] };

			const containerRect = container.getBoundingClientRect();
			const segments: Array<{
				fromX: number;
				fromY: number;
				toX: number;
				toY: number;
				verticalGap: number;
			}> = [];

			for (let index = 0; index < cards.length - 1; index++) {
				const from = cards[index]?.getBoundingClientRect();
				const to = cards[index + 1]?.getBoundingClientRect();
				if (!from || !to) continue;

				const fromX = from.left + from.width / 2 - containerRect.left;
				const fromY = from.bottom - containerRect.top;
				const toX = to.left + to.width / 2 - containerRect.left;
				const toY = to.top - containerRect.top;

				segments.push({ fromX, fromY, toX, toY, verticalGap: toY - fromY });
			}

			const maximumAbsBend = (initialBend: number) => {
				let bend = initialBend;
				let maximum = Math.abs(bend);

				for (let index = 1; index < segments.length; index++) {
					const previous = segments[index - 1];
					const current = segments[index];
					bend =
						(((previous.toX - previous.fromX) / 2 - bend) * current.verticalGap) /
							previous.verticalGap -
						(current.toX - current.fromX) / 2;
					maximum = Math.max(maximum, Math.abs(bend));
				}

				return maximum;
			};

			let lowerBend = -Math.max(128, containerRect.width);
			let upperBend = Math.max(128, containerRect.width);
			for (let iteration = 0; iteration < 32; iteration++) {
				const firstThird = (2 * lowerBend + upperBend) / 3;
				const secondThird = (lowerBend + 2 * upperBend) / 3;

				if (maximumAbsBend(firstThird) < maximumAbsBend(secondThird)) {
					upperBend = secondThird;
				} else {
					lowerBend = firstThird;
				}
			}

			const paths: string[] = [];
			let bend = (lowerBend + upperBend) / 2;
			for (let index = 0; index < segments.length; index++) {
				const { fromX, fromY, toX, toY, verticalGap } = segments[index];
				const centerX = (fromX + toX) / 2;
				const centerY = (fromY + toY) / 2;

				paths.push(`M ${fromX} ${fromY} Q ${centerX + bend} ${centerY}, ${toX} ${toY}`);

				const next = segments[index + 1];
				if (next) {
					bend =
						(((toX - fromX) / 2 - bend) * next.verticalGap) / verticalGap -
						(next.toX - next.fromX) / 2;
				}
			}

			return {
				width: Math.ceil(containerRect.width),
				height: Math.ceil(containerRect.height),
				paths
			};
		});
	}

	function scheduleConnectorPaths() {
		if (typeof window === 'undefined') return;
		if (connectorFrame !== undefined) {
			window.cancelAnimationFrame(connectorFrame);
		}

		connectorFrame = window.requestAnimationFrame(() => {
			connectorFrame = undefined;
			updateConnectorPaths();
		});
	}

	function updateMeetingLayout() {
		updateContainerPositions();
		scheduleConnectorPaths();
	}

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

				const { month, year } = getZonedMonthYear(date);
				const label = (month < 6 ? 'Spring' : 'Fall') + ' ' + year;

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

	$effect(() => {
		const groupCount = groupedMeetingsArray.length;
		if (cardGroups.length !== groupCount) {
			cardGroups = Array.from({ length: groupCount }, () => []);
		}
	});

	onMount(() => {
		const connectorObserver = new ResizeObserver(scheduleConnectorPaths);

		window.requestAnimationFrame(() => {
			for (const container of groupContainers) {
				connectorObserver.observe(container);
			}
			updateMeetingLayout();
		});

		window.addEventListener('resize', updateMeetingLayout);
		return () => {
			connectorObserver.disconnect();
			window.removeEventListener('resize', updateMeetingLayout);
			if (connectorFrame !== undefined) {
				window.cancelAnimationFrame(connectorFrame);
			}
		};
	});

	$effect(() => {
		groupedMeetingsArray;
		cardGroups;
		if (typeof window !== 'undefined') {
			setTimeout(updateMeetingLayout, 100);
		}
	});
</script>

<div class="event-page-container">
	<header class="page-header">
		<h1>Meetings</h1>
	</header>

	{#if groupedMeetingsArray.length === 0}
		<div class="text-center py-20">
			<h2 class="page-title">No Meetings Yet</h2>
			<p class="text-white/70 text-lg">Check back soon for upcoming meetings!</p>
		</div>
	{:else}
		{#each groupedMeetingsArray as [label, groupMeetings], i}
			<section class="meeting-group">
				<h2 class="page-title">
					{label}{#if i > 0}
						<span>(Archive)</span>{/if}
				</h2>
				<div class="event-list-container" bind:this={groupContainers[i]}>
					<svg
						class="event-connector"
						viewBox={`0 0 ${connectorGroups[i]?.width ?? 0} ${connectorGroups[i]?.height ?? 0}`}
						aria-hidden="true"
					>
						{#each connectorGroups[i]?.paths ?? [] as path}
							<path d={path} />
						{/each}
					</svg>
					{#each groupMeetings as meeting, j}
						{@const groupCards = cardGroups[i] || []}
						<div
							class="relative z-10"
							bind:this={groupCards[j]}
							style={translations[i]?.[j] ? `transform: ${translations[i][j]};` : ''}
						>
							<MeetingCard {meeting} />
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>

<style>
	* {
		box-sizing: border-box;
	}

	.event-page-container {
		min-height: 100vh;
		padding: 4.5rem 1.5rem 6rem;
	}

	.page-header {
		margin: 0 auto 3rem;
		max-width: 40rem;
		text-align: center;
	}

	.page-header h1 {
		margin: 0;
		color: white;
		font-size: clamp(2rem, 4vw, 2.5rem);
		font-weight: 800;
	}

	.meeting-group {
		max-width: 40rem;
		margin: 0 auto 3.5rem;
	}

	.page-title {
		margin: 0 0 1.25rem;
		color: white;
		font-size: 1.875rem;
		font-weight: 800;
	}

	.page-title span {
		color: rgb(255 255 255 / 0.6);
		font-size: 1rem;
		font-weight: 600;
	}

	.event-list-container {
		position: relative;
	}

	.event-connector {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;
	}

	.event-connector path {
		fill: none;
		stroke: rgb(255 255 255 / 0.32);
		stroke-linecap: round;
		stroke-width: 2.5;
	}
</style>
