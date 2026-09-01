<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');
	let editingBodyId = $state<string | null>(null);

	const items = $derived(data.items || []);
	const visibleItems = $derived.by(() => {
		const query = searchQuery.trim().toLocaleLowerCase();
		if (!query) return items;
		return items.filter((item) =>
			`${item.item} ${item.body || ''}`.toLocaleLowerCase().includes(query)
		);
	});

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(date));
	}

	function submitToggle(event: Event) {
		if (event.currentTarget instanceof HTMLInputElement) {
			event.currentTarget.form?.requestSubmit();
		}
	}

	function saveBodyOnBlur(event: FocusEvent, id: string) {
		if (editingBodyId === id && event.currentTarget instanceof HTMLTextAreaElement) {
			event.currentTarget.form?.requestSubmit();
		}
	}

	function handleBodyKeydown(event: KeyboardEvent, id: string) {
		if (event.key === 'Escape') {
			editingBodyId = null;
		} else if (
			(event.ctrlKey || event.metaKey) &&
			event.key === 'Enter' &&
			event.currentTarget instanceof HTMLTextAreaElement
		) {
			event.currentTarget.form?.requestSubmit();
		}
	}

	function enhanceBody() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			editingBodyId = null;
		};
	}
</script>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<div class="container mx-auto max-w-2xl px-4 py-8">
		<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Meeting Checklist</h1>

		<div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
			<div>
				<label
					for="search-items"
					class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Search</label
				>
				<input
					id="search-items"
					type="search"
					placeholder="Search items"
					bind:value={searchQuery}
					class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-hacksu-green focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			<form method="POST" action="?/create" use:enhance>
				<label for="new-item" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					>Add item</label
				>
				<input
					id="new-item"
					name="item"
					type="text"
					placeholder="Type an item and press Enter"
					autocomplete="off"
					class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-hacksu-green focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</form>
		</div>

		{#if visibleItems.length === 0}
			<div class="rounded-lg border border-gray-700 bg-gray-800 p-12 text-center shadow-sm">
				<p class="text-gray-300">
					{searchQuery ? 'No checklist items match your search.' : 'No checklist items yet.'}
				</p>
			</div>
		{:else}
			<ul class="space-y-3">
				{#each visibleItems as item (item.id)}
					<li
						class:opacity-70={Boolean(item.checkedAt)}
						class="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="flex gap-3">
							<form
								method="POST"
								action="?/toggle"
								use:enhance
								class="flex min-w-0 flex-1 items-start gap-3"
							>
								<input type="hidden" name="id" value={item.id} />
								<input
									class="mt-1 h-4 w-4 shrink-0 accent-hacksu-green"
									type="checkbox"
									name="checked"
									value="true"
									checked={Boolean(item.checkedAt)}
									aria-label={`${item.checkedAt ? 'Uncheck' : 'Check'} ${item.item}`}
									onchange={submitToggle}
								/>
								<button
									type="submit"
									name="toggle"
									value={item.checkedAt ? 'false' : 'true'}
									class:line-through={Boolean(item.checkedAt)}
									class="w-full cursor-pointer bg-transparent p-0 text-left text-sm font-semibold text-white"
								>
									{item.item}
								</button>
							</form>
						</div>

						<div class="ml-7 mt-1">
							{#if editingBodyId === item.id}
								<form method="POST" action="?/updateBody" use:enhance={enhanceBody}>
									<input type="hidden" name="id" value={item.id} />
									<textarea
										name="body"
										rows="3"
										onblur={(event) => saveBodyOnBlur(event, item.id)}
										onkeydown={(event) => handleBodyKeydown(event, item.id)}
										class="mt-1 w-full resize-y rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-hacksu-green focus:outline-none"
										>{item.body || ''}</textarea
									>
								</form>
							{:else}
								<button
									type="button"
									onclick={() => (editingBodyId = item.id)}
									class:italic={!item.body}
									class="mt-1 w-full cursor-pointer bg-transparent p-0 text-left text-sm text-gray-300"
								>
									{item.body || 'Add body'}
								</button>
							{/if}
							<p class="mt-2 flex flex-wrap gap-x-3 text-xs text-gray-400">
								<span>Created {formatDate(item.createdAt)}</span>
								<span>Checked {formatDate(item.checkedAt)}</span>
							</p>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
