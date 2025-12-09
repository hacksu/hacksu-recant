<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	const icons = $derived(data.icons || []);

	// State for new icon form
	let newCategoryName = $state('');
	let newIconifyId = $state('');

	// State for editing existing icons
	const editingIcons = $state<Record<string, string>>({});

	// Initialize editing state with current values
	$effect(() => {
		for (const icon of icons) {
			if (!(icon.categoryName in editingIcons)) {
				editingIcons[icon.categoryName] = icon.iconifyId;
			}
		}
	});

	/**
	 * Generates the Iconify API URL for an icon ID
	 */
	function getIconUrl(iconifyId: string | null | undefined): string | null {
		if (!iconifyId || !iconifyId.trim()) {
			return null;
		}
		const trimmed = iconifyId.trim();
		// Validate format (should be like "collection:icon")
		if (!/^[^:]+:[^:]+$/.test(trimmed)) {
			return null;
		}
		return `https://api.iconify.design/${trimmed.replace(':', '/')}.svg?width=64&height=64&color=white`;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<div class="mb-8 pt-20">
		<h1 class="text-3xl font-bold mb-2">Lesson Icons Editor</h1>
		<p class="text-gray-600">Manage icon mappings for lesson categories</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<!-- New Icon Card -->
		<div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-200">
			<div class="h-32 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
				<div class="text-white text-5xl font-light opacity-50">?</div>
			</div>

			<div class="p-6 flex flex-col gap-4 flex-1">
				<div class="flex flex-col gap-2">
					<label class="text-gray-700 font-medium text-sm" for="new-category-name">Category Name</label>
					<input
						type="text"
						id="new-category-name"
						bind:value={newCategoryName}
						class="px-3 py-2 border border-gray-300 rounded-lg text-base transition-colors focus:border-hacksu-blue focus:outline-none placeholder:text-gray-400"
						placeholder="e.g., react, python, docker"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-gray-700 font-medium text-sm" for="new-iconify-id">Iconify ID</label>
					<input
						type="text"
						id="new-iconify-id"
						bind:value={newIconifyId}
						class="px-3 py-2 border border-gray-300 rounded-lg text-base transition-colors focus:border-hacksu-blue focus:outline-none placeholder:text-gray-400"
						placeholder="e.g., logos:react, logos:python"
					/>
					<a
						href="https://icon-sets.iconify.design/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-hacksu-blue hover:underline"
					>
						Browse Iconify Icons →
					</a>
				</div>

				<button
					type="button"
					class="bg-hacksu-blue hover:bg-[#3570e6] text-white px-4 py-2 rounded-lg font-medium transition-colors mt-2"
					onclick={async () => {
						const categoryName = newCategoryName.trim();
						const iconifyId = newIconifyId.trim();

						if (!categoryName || !iconifyId) {
							alert('Please fill in both category name and iconify ID');
							return;
						}

						try {
							const response = await fetch('/admin/lesson-icons/api', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ categoryName, iconifyId })
							});

							if (!response.ok) {
								const error = await response.json();
								throw new Error(error.error || 'Failed to create icon');
							}

							// Reset form
							newCategoryName = '';
							newIconifyId = '';

							// Reload page to show new icon
							window.location.reload();
						} catch (error) {
							alert('Error creating icon: ' + (error instanceof Error ? error.message : String(error)));
						}
					}}
				>
					Add New Icon
				</button>
			</div>
		</div>

		<!-- Existing Icon Cards -->
		{#each icons as icon}
			{@const previewUrl = getIconUrl(icon.iconifyId)}
			<div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-200">
				<div class="h-32 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
					{#if previewUrl}
						<img
							src={previewUrl}
							alt={icon.categoryName}
							class="w-16 h-16"
							onerror={(e) => {
								// Hide image on error, show placeholder instead
								e.currentTarget.style.display = 'none';
							}}
						/>
					{:else}
						<div class="text-white text-5xl font-light opacity-50">?</div>
					{/if}
				</div>

				<div class="p-6 flex flex-col gap-4 flex-1">
					<div class="flex flex-col gap-2">
						<label class="text-gray-700 font-medium text-sm" for={`category-${icon.categoryName}`}>Category Name</label>
						<input
							type="text"
							id={`category-${icon.categoryName}`}
							value={icon.categoryName}
							disabled
							class="px-3 py-2 border border-gray-300 rounded-lg text-base bg-gray-50 cursor-not-allowed"
						/>
					</div>

					<div class="flex flex-col gap-2">
						<label class="text-gray-700 font-medium text-sm" for={`iconify-${icon.categoryName}`}>Iconify ID</label>
						<input
							type="text"
							id={`iconify-${icon.categoryName}`}
							bind:value={editingIcons[icon.categoryName]}
							class="px-3 py-2 border border-gray-300 rounded-lg text-base transition-colors focus:border-hacksu-blue focus:outline-none"
							placeholder="e.g., logos:react, logos:python"
						/>
						<a
							href="https://icon-sets.iconify.design/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-hacksu-blue hover:underline"
						>
							Browse Iconify Icons →
						</a>
					</div>

					<div class="flex gap-2 mt-2">
						<button
							type="button"
							class="bg-hacksu-blue hover:bg-[#3570e6] text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1"
							onclick={async () => {
								const iconifyId = editingIcons[icon.categoryName]?.trim();

								if (!iconifyId) {
									alert('Please enter an iconify ID');
									return;
								}

								try {
									const response = await fetch(`/admin/lesson-icons/api/${icon.categoryName}`, {
										method: 'PUT',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({ iconifyId })
									});

									if (!response.ok) {
										const error = await response.json();
										throw new Error(error.error || 'Failed to update icon');
									}

									// Reload page to show updated icon
									window.location.reload();
								} catch (error) {
									alert('Error updating icon: ' + (error instanceof Error ? error.message : String(error)));
								}
							}}
						>
							Save Changes
						</button>
						<form
							method="POST"
							action="/admin/lesson-icons/{icon.categoryName}/delete"
							use:enhance={() => {
								return ({ update }) => {
									if (confirm(`Really delete icon mapping for "${icon.categoryName}"?`)) {
										return update();
									}
									return () => {};
								};
							}}
							class="flex-1"
						>
							<button
								type="submit"
								class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full"
							>
								Delete
							</button>
						</form>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

