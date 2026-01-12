<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form?: { error?: string } } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Add New Redirect</h1>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-6">
		<!-- Slug -->
		<div>
			<label for="slug" class="block text-sm font-medium mb-2">Slug *</label>
			<div class="flex items-center gap-2">
				<span class="text-gray-500 dark:text-gray-400 text-sm">/r/</span>
				<input
					type="text"
					id="slug"
					name="slug"
					required
					placeholder="my-link"
					class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
				/>
			</div>
			<p class="text-xs text-gray-500 mt-1">
				Allowed characters: letters, numbers, dashes and underscores.
			</p>
		</div>

		<!-- Target URL -->
		<div>
			<label for="targetUrl" class="block text-sm font-medium mb-2">Target URL *</label>
			<input
				type="url"
				id="targetUrl"
				name="targetUrl"
				required
				placeholder="https://example.com/my-page"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
			<p class="text-xs text-gray-500 mt-1">
				Must be a full URL starting with http:// or https://
			</p>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="block text-sm font-medium mb-2">Description</label>
			<textarea
				id="description"
				name="description"
				rows="3"
				placeholder="Short internal description of what this link is for..."
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
				Create Redirect
			</button>
			<a
				href="/admin/redirects"
				class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
