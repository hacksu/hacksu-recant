<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import favicon from '$lib/assets/favicon.svg';

	let { data }: { data: PageData } = $props();

	const leaders = $derived(data.leaders);

	function getPhotoUrl(leader: typeof data.leaders[0]): string {
		if (leader.photo) {
			return leader.photo;
		}
		if (leader.github) {
			return `https://github.com/${leader.github}.png`;
		}
		return favicon; // Fallback
	}

	function handleImageError(meeting: Meeting) {
		const target = meeting.target as HTMLImageElement;
		target.src = favicon;
	}
</script>	
	{#if leaders.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
			<p class="text-gray-600 dark:text-gray-400 mb-4">No leadership entries yet.</p>
			<a
				href="/admin/leadership/new"
				class="inline-block bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Add First Leader
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each leaders as leader}
				<div
					class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700"
				>
					<div class="flex items-start gap-4 mb-4">
						<img
							src={getPhotoUrl(leader)}
							alt={leader.name}
							class="w-16 h-16 rounded-full object-cover flex-shrink-0"
							onerror={handleImageError}
						/>
						<div class="flex-1 min-w-0">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
								{leader.name}
							</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Class of {leader.gradYear} ({leader.gradTerm})
							</p>
							{#if leader.isCurrent}
								<span
									class="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-hacksu-green text-white rounded"
								>
									Current
								</span>
							{/if}
						</div>
					</div>

					<div class="mb-4">
						<div class="flex flex-wrap gap-2">
							{#each leader.titles as title}
								<span
									class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
								>
									{title}
								</span>
							{/each}
						</div>
					</div>

					<div class="flex gap-2">
						<a
							href="/admin/leadership/{leader.id}"
							class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
						>
							Edit
						</a>
						<form
							method="POST"
							action="/admin/leadership/{leader.id}/delete"
							use:enhance={() => {
								return ({ update }) => {
									if (confirm(`Are you sure you want to delete ${leader.name}?`)) {
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