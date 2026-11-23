<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import ImagePicker from '$lib/components/ImagePicker.svelte';

	let { data, form }: { data: PageData; form?: { error?: string } } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-2">Default Meeting Poster</h1>
	<p class="text-sm text-gray-500 mb-6">
		Shown on the TV / marketing poster feed when the next meeting doesn't have its own poster.
	</p>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-6">
		<ImagePicker
			images={data.images}
			value={data.defaultPoster}
			name="posterPhoto"
			label="Default poster / TV / marketing photo"
		/>

		<div class="flex gap-4">
			<button
				type="submit"
				class="bg-hacksu-green hover:bg-hacksu-green/90 text-hacksu-grey font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Save Default Poster
			</button>
			<a
				href="/admin/meetings"
				class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
