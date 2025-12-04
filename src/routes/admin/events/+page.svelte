<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import favicon from '$lib/assets/favicon.svg';

	let { data }: { data: PageData } = $props();

	const eventsList = data.events;

	function getPhotoUrl(event: typeof eventsList[0]): string {
		if (event.photo) {
			return event.photo;
		}
		return favicon; // Fallback
	}

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		target.src = favicon;
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
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
		<h1 class="text-3xl font-bold">Events Management</h1>
		<a
			href="/admin/events/new"
			class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
		>
			Add New Event
		</a>
	</div>

	{#if eventsList.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
			<p class="text-gray-600 dark:text-gray-400 mb-4">No events yet.</p>
			<a
				href="/admin/events/new"
				class="inline-block bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Add First Event
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each eventsList as event}
				<div
					class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700"
				>
					<div class="flex items-start gap-4 mb-4">
						<img
							src={getPhotoUrl(event)}
							alt={event.title}
							class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
							onerror={handleImageError}
						/>
						<div class="flex-1 min-w-0">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
								{event.title}
							</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{formatDate(event.date)}
							</p>
							{#if event.presenter}
								<p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
									by {event.presenter}
								</p>
							{/if}
						</div>
					</div>

					{#if event.descriptionMD}
						<div class="mb-4">
							<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
								{event.descriptionMD.substring(0, 100)}
								{#if event.descriptionMD.length > 100}...{/if}
							</p>
						</div>
					{/if}

					<div class="flex gap-2">
						<a
							href="/admin/events/{event.id}"
							class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
						>
							Edit
						</a>
						<form
							method="POST"
							action="/admin/events/{event.id}/delete"
							use:enhance={() => {
								return ({ update }) => {
									if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
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
