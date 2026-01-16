<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/images/favicon.svg';
	import Navbar from '$lib/Navbar.svelte';
	import { page } from '$app/state';
	let { children } = $props();

	// Hide navbar and chrome for the printable hotcard route
	const hideChrome = $derived(page.url.pathname.startsWith('/resources/hotcard'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>HacKSU - Kent State's Coding Club</title>
	<meta name="description" content="HacKSU teaches anyone, regardless of skill level or major, how to code. Join us every Tuesday!" />
	
	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="HacKSU" />
	<meta property="og:title" content="HacKSU - Kent State's Coding Club" />
	<meta property="og:description" content="HacKSU teaches anyone, regardless of skill level or major, how to code. Join us every Tuesday!" />
	<meta property="og:image" content="https://hacksu.com/social-preview.png" />
	<meta property="og:url" content="https://hacksu.com" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="HacKSU - Kent State's Coding Club" />
	<meta name="twitter:description" content="HacKSU teaches anyone, regardless of skill level or major, how to code. Join us every Tuesday!" />
	<meta name="twitter:image" content="https://hacksu.com/social-preview.png" />
</svelte:head>

{#if !hideChrome}
	<Navbar />
{/if}

<main class={hideChrome ? '' : 'min-h-screen'}>
	{@render children()}
</main>
