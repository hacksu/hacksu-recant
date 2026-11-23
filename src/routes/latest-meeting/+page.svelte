<script lang="ts">
	import { onMount } from 'svelte';

	// Full-screen poster display for the TV. Pulls from /api/latest-meeting-poster
	// and re-checks periodically so a newly set poster shows up without a reload.
	const REFRESH_MS = 5 * 60 * 1000;

	type Poster = {
		isDefault: boolean;
		meetingId: string | null;
		title: string | null;
		date: string | null;
		presenter: string | null;
		path: string; // relative, so it always loads from the same host as this page
		url: string;
	};

	let poster = $state<Poster | null>(null);
	let status = $state<'loading' | 'ready' | 'empty' | 'error'>('loading');

	// Preload the image before swapping so the screen never flashes blank.
	function preload(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => reject(new Error(`Failed to load ${src}`));
			img.src = src;
		});
	}

	async function refresh() {
		try {
			const res = await fetch('/api/latest-meeting-poster', { cache: 'no-store' });
			if (res.status === 404) {
				poster = null;
				status = 'empty';
				return;
			}
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const next: Poster = await res.json();
			if (next.path !== poster?.path) await preload(next.path);
			poster = next;
			status = 'ready';
		} catch (err) {
			console.error('Failed to refresh poster:', err);
			// Keep showing the last good poster if we have one.
			if (!poster) status = 'error';
		}
	}

	onMount(() => {
		refresh();
		const timer = setInterval(refresh, REFRESH_MS);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>{poster?.title ? `${poster.title} | HacKSU` : 'HacKSU'}</title>
</svelte:head>

<div class="fixed inset-0 flex items-center justify-center bg-black">
	{#if poster}
		<img src={poster.path} alt={poster.title ?? 'HacKSU poster'} class="h-full w-full object-contain" />
	{:else if status === 'loading'}
		<p class="text-white/50">Loading…</p>
	{:else if status === 'empty'}
		<p class="text-white/50">No poster set.</p>
	{:else}
		<p class="text-white/50">Couldn't load the poster. Retrying…</p>
	{/if}
</div>
