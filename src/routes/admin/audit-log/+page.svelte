<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	function formatDate(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleString();
	}

	function formatAction(action: string) {
		const colors = {
			CREATE: 'bg-green-100 text-green-800',
			UPDATE: 'bg-blue-100 text-blue-800',
			DELETE: 'bg-red-100 text-red-800'
		};
		return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
	}

	function formatResourceType(resourceType: string) {
		return resourceType
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	function hasChanges(log: typeof data.logs[0]) {
		// For CREATE actions, always show changesAfter even if changesBefore is null
		// For UPDATE/DELETE, show if either before or after exists
		return log.changesBefore || log.changesAfter;
	}

	function getChangeSummary(log: typeof data.logs[0]) {
		if (!hasChanges(log)) return null;

		const before = log.changesBefore || {};
		const after = log.changesAfter || {};

		const changedFields = Object.keys({ ...before, ...after }).filter(
			(key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])
		);

		return changedFields;
	}
</script>

<svelte:head>
	<title>Admin Audit Log - HackSU</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6">
		<h1 class="text-3xl font-bold mb-2">Admin Audit Log</h1>
		<p class="text-gray-600">Track all changes made in the admin panel</p>
	</div>

	{#if data.logs.length === 0}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
			<p class="text-gray-500">No audit log entries found.</p>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Timestamp
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Admin User
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Action
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Resource
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Resource ID
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Route
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Changes
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.logs as log}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatDate(log.createdAt)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{#if log.adminUsername}
										<span class="font-medium">{log.adminUsername}</span>
										<code class="text-xs text-gray-500 ml-2">({log.adminUserId})</code>
									{:else}
										<code class="text-xs bg-gray-100 px-2 py-1 rounded">{log.adminUserId}</code>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="px-2 py-1 text-xs font-semibold rounded-full {formatAction(log.action)}"
									>
										{log.action}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatResourceType(log.resourceType)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{#if log.resourceId}
										<code class="text-xs bg-gray-100 px-2 py-1 rounded">{log.resourceId}</code>
									{:else}
										<span class="text-gray-400">—</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
									<code class="text-xs">{log.routePath}</code>
								</td>
								<td class="px-6 py-4 text-sm">
									{#if hasChanges(log)}
										<details class="cursor-pointer">
											<summary class="text-blue-600 hover:text-blue-800">
												{#if log.action === 'CREATE'}
													View Created Data ({Object.keys(log.changesAfter || {}).length} fields)
												{:else if log.action === 'DELETE'}
													View Deleted Data ({Object.keys(log.changesBefore || {}).length} fields)
												{:else}
													View Changes ({getChangeSummary(log)?.length || 0} fields)
												{/if}
											</summary>
											<div class="mt-2 space-y-2">
												{#if log.changesBefore}
													<div>
														<p class="text-xs font-semibold text-red-600 mb-1">Before:</p>
														<pre
															class="text-xs bg-red-50 p-2 rounded overflow-auto max-h-40"
														>{JSON.stringify(log.changesBefore, null, 2)}</pre>
													</div>
												{/if}
												{#if log.changesAfter}
													<div>
														<p class="text-xs font-semibold text-green-600 mb-1">
															{log.action === 'CREATE' ? 'Created:' : 'After:'}
														</p>
														<pre
															class="text-xs bg-green-50 p-2 rounded overflow-auto max-h-40"
														>{JSON.stringify(log.changesAfter, null, 2)}</pre>
													</div>
												{/if}
											</div>
										</details>
									{:else}
										<span class="text-gray-400">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

