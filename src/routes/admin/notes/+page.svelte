<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	const notes = $derived(data.notes || []);

	function formatDate(date: Date): string {
		const d = new Date(date);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-3xl font-bold">Admin Notes</h1>
		<a
			href="/admin/notes/new"
			class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
		>
			Add New Note
		</a>
	</div>

	{#if notes.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
			<p class="text-gray-600 dark:text-gray-400 mb-4">No notes yet.</p>
			<p class="text-sm text-gray-500 dark:text-gray-500">
				Create notes to keep internal admin-only information in one place.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each notes as note}
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{note.title}</h3>
					<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{formatDate(note.date)}</p>
					{#if note.tags}
						<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Tags: {note.tags}</p>
					{/if}
					<p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 whitespace-pre-line">
						{note.notes}
					</p>

					<div class="mt-4 flex gap-2">
						<a
							href="/admin/notes/{note.id}"
							class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
						>
							Edit
						</a>
						<form
							method="POST"
							action="/admin/notes/{note.id}/delete"
							use:enhance={() => {
								return ({ update }) => {
									if (confirm(`Delete note "${note.title}"?`)) {
										return update();
									}
									return () => {};
								};
							}}
						>
							<button
								type="submit"
								class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
							>
								Delete
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
