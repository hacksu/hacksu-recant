<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	const redirects = $derived(data.redirects || []);

	function formatDate(value: Date | null | undefined): string {
		if (!value) return '';
		const d = new Date(value);
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
		<h1 class="text-3xl font-bold">Redirects</h1>
		<a
			href="/admin/redirects/new"
			class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
		>
			Add New Redirect
		</a>
	</div>

	{#if redirects.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
			<p class="text-gray-600 dark:text-gray-400 mb-2">No redirects configured yet.</p>
			<p class="text-sm text-gray-500 dark:text-gray-500">
				Create your first redirect to map a path like <code>/redir/abc</code> to an external URL.
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-900/40">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Slug
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Target URL
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Enabled
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Clicks
						</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Updated
						</th>
						<th class="px-4 py-3" />
					</tr>
				</thead>
				<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
					{#each redirects as redirect}
						<tr>
							<td class="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
								/redir/{redirect.slug}
							</td>
							<td class="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 break-all">
								{redirect.targetUrl}
							</td>
							<td class="px-4 py-3 text-sm">
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${redirect.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
								>
									{redirect.enabled ? 'Enabled' : 'Disabled'}
								</span>
							</td>
							<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
								{redirect.clicks}
							</td>
							<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
								{formatDate(redirect.updatedAt ?? redirect.createdAt)}
							</td>
							<td class="px-4 py-3 text-sm text-right">
								<div class="flex justify-end gap-2">
									<a
										href="/admin/redirects/{redirect.slug}"
										class="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
									>
										Edit
									</a>
									<form
										method="POST"
										action="/admin/redirects/{redirect.slug}/delete"
										use:enhance={() => {
											return ({ update }) => {
												if (confirm(`Delete redirect /redir/${redirect.slug}?`)) {
													return update();
												}
												return () => {};
											};
										}}
									>
										<button
												type="submit"
												class="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
											>
												Delete
											</button>
										</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
