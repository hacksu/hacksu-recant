<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/Navbar.svelte';
	import { page } from '$app/state';
	let { children } = $props();

	// Hide navbar and chrome for the printable hotcard route
	const hideChrome = $derived(page.url.pathname.startsWith('/resources/hotcard'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !hideChrome}
	<Navbar />
{/if}

<main class={hideChrome ? '' : 'min-h-screen'}>
	{@render children()}
</main>
