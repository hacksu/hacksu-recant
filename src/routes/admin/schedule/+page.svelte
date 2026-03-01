<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const courses = $derived(data.courses);

	let search = $state('');
	let refreshing = $state(false);

	const filtered = $derived(
		search.trim() === ''
			? courses
			: courses.filter(
					(c) =>
						c.code.toLowerCase().includes(search.toLowerCase()) ||
						c.name.toLowerCase().includes(search.toLowerCase()) ||
						(c.lecturer ?? '').toLowerCase().includes(search.toLowerCase())
				)
	);

	const lastScraped = $derived(
		courses.length > 0
			? new Date(courses[0].scrapedAt).toLocaleString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			: null
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-3xl font-bold">Course Schedule</h1>
			{#if lastScraped}
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Last scraped: {lastScraped}</p>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No data yet — click Refresh to scrape.</p>
			{/if}
		</div>

		<form
			method="POST"
			action="?/refresh"
			use:enhance={() => {
				refreshing = true;
				return async ({ update }) => {
					await update();
					refreshing = false;
				};
			}}
		>
			<button
				type="submit"
				disabled={refreshing}
				class="bg-hacksu-green hover:bg-hacksu-green/90 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				{refreshing ? 'Refreshing…' : 'Refresh'}
			</button>
		</form>
	</div>

	{#if form?.error}
		<div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
			{form.error}
		</div>
	{/if}

	{#if courses.length > 0}
		<div class="mb-4 relative max-w-sm">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
			</svg>
			<input
				type="text"
				bind:value={search}
				placeholder="Search by code, name, or lecturer…"
				class="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-hacksu-green focus:border-transparent transition-colors"
			/>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
						<tr>
							<th class="px-4 py-3 text-left">Code</th>
							<th class="px-4 py-3 text-left">Name</th>
							<th class="px-4 py-3 text-left">Day</th>
							<th class="px-4 py-3 text-left">Time</th>
							<th class="px-4 py-3 text-left">Lecturer</th>
							<th class="px-4 py-3 text-left">Email</th>
							<th class="px-4 py-3 text-left">Location</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each filtered as course (course.id)}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
								<td class="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap">{course.code}</td>
								<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{course.name}</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{course.day ?? '—'}</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{course.time ?? '—'}</td>
								<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{course.lecturer ?? '—'}</td>
								<td class="px-4 py-3">
									{#if course.email}
										<a
											href="mailto:{course.email}"
											class="text-hacksu-green hover:underline"
										>{course.email}</a>
									{:else}
										<span class="text-gray-400">—</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-400">{course.location ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
				{filtered.length} of {courses.length} courses
			</div>
		</div>
	{:else if !form?.error}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
			<p class="text-gray-600 dark:text-gray-400">No schedule data yet. Click <strong>Refresh</strong> to scrape the current schedule.</p>
		</div>
	{/if}
</div>
