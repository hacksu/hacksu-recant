<script lang="ts">
	import Landing from '$lib/Landing.svelte';
	import AudienceSection from '$lib/AudienceSection.svelte';
	import LocationSection from '$lib/LocationSection.svelte';
	import Footer from '$lib/Footer.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Landing />
<AudienceSection />
<LocationSection location={data.location} />
<Footer />
