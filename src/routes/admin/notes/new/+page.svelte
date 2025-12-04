<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form?: { error?: string } } = $props();

	function getCurrentDateTimeLocal(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Add New Note</h1>

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

		<!-- Date -->
		<div>
			<label for="date" class="block text-sm font-medium mb-2">Date *</label>
			<input
				type="datetime-local"
				id="date"
				name="date"
				required
				value={getCurrentDateTimeLocal()}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Tags -->
		<div>
			<label for="tags" class="block text-sm font-medium mb-2">Tags</label>
			<input
				type="text"
				id="tags"
				name="tags"
				placeholder="comma,separated,tags"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
			<p class="text-xs text-gray-500 mt-1">Optional, for your own organization.</p>
		</div>

		<!-- Notes body -->
		<div>
			<label for="notes" class="block text-sm font-medium mb-2">Notes *</label>
			<textarea
				id="notes"
				name="notes"
				rows="8"
				required
				placeholder="Write whatever internal notes you need..."
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			></textarea>
			<p class="text-xs text-gray-500 mt-1">Plain text or markdown is fine; this is admin-only.</p>
		</div>

		<!-- Actions -->
		<div class="flex gap-4">
			<button
				type="submit"
				class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Create Note
			</button>
			<a
				href="/admin/notes"
				class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
