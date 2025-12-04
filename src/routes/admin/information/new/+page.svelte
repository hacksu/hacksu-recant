<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form?: { error?: string } } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Add Information Block</h1>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-6">
		<!-- Title -->
		<div>
			<label for="title" class="block text-sm font-medium mb-2">Title *</label>
			<input
				type="text"
				id="title"
				name="title"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Link -->
		<div>
			<label for="link" class="block text-sm font-medium mb-2">Link</label>
			<input
				type="url"
				id="link"
				name="link"
				placeholder="https://example.com"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
			<p class="text-xs text-gray-500 mt-1">Optional; if set, the title will link here.</p>
		</div>

		<!-- Photo URL -->
		<div>
			<label for="photo" class="block text-sm font-medium mb-2">Photo URL</label>
			<input
				type="text"
				id="photo"
				name="photo"
				placeholder="/uploads/... or https://..."
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
			<p class="text-xs text-gray-500 mt-1">Optional; image shown alongside the text.</p>
		</div>

		<!-- Sort index -->
		<div>
			<label for="sortIndex" class="block text-sm font-medium mb-2">Sort Index</label>
			<input
				type="number"
				id="sortIndex"
				name="sortIndex"
				value="0"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
			<p class="text-xs text-gray-500 mt-1">Lower numbers appear first on the /info page.</p>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="block text-sm font-medium mb-2">Description (Markdown/Text) *</label>
			<textarea
				id="description"
				name="description"
				rows="6"
				required
				placeholder="Enter the description; markdown is fine and will be rendered later."
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			></textarea>
		</div>

		<!-- Enabled -->
		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				id="enabled"
				name="enabled"
				checked
				class="h-4 w-4 text-hacksu-green border-gray-300 rounded focus:ring-hacksu-green"
			/>
			<label for="enabled" class="text-sm text-gray-700 dark:text-gray-200">Enabled</label>
		</div>

		<!-- Actions -->
		<div class="flex gap-4">
			<button
				type="submit"
				class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Create
			</button>
			<a
				href="/admin/information"
				class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
