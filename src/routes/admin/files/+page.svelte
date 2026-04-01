<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const files = $derived(data.files || []);

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

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

	function copyLink(filename: string) {
		const url = `${window.location.origin}/f/${filename}`;
		navigator.clipboard.writeText(url);
	}

	let uploading = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-3xl font-bold">File Uploads</h1>
	</div>

	<!-- Upload Form -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-8">
		<h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload a File</h2>
		{#if form?.error}
			<p class="text-red-600 dark:text-red-400 text-sm mb-3">{form.error}</p>
		{/if}
		<form
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			use:enhance={() => {
				uploading = true;
				return async ({ update }) => {
					uploading = false;
					await update();
				};
			}}
			class="flex items-center gap-4"
		>
			<input
				type="file"
				name="file"
				required
				class="flex-1 text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-hacksu-green file:text-white hover:file:bg-hacksu-green/90 file:cursor-pointer"
			/>
			<button
				type="submit"
				disabled={uploading}
				class="bg-hacksu-green hover:bg-hacksu-green/90 disabled:opacity-60 text-white font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
			>
				{uploading ? 'Uploading…' : 'Upload'}
			</button>
		</form>
	</div>

	<!-- File List -->
	{#if files.length === 0}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
			<p class="text-gray-600 dark:text-gray-400">No files uploaded yet.</p>
		</div>
	{:else}
		<div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-900/40">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accesses</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
					{#each files as file}
						<tr>
							<td class="px-4 py-3">
								{#if file.mimeType.startsWith('image/')}
									<img
										src="/uploads/uploads/{file.filename}"
										alt={file.originalName}
										class="h-10 w-10 object-cover rounded"
									/>
								{:else}
									<div class="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 font-mono">
										{file.mimeType.split('/')[1]?.slice(0, 4) ?? 'file'}
									</div>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={file.originalName}>
								{file.originalName}
							</td>
							<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
								{formatBytes(file.sizeBytes)}
							</td>
							<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
								{file.accessCount}
							</td>
							<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
								{formatDate(file.createdAt)}
							</td>
							<td class="px-4 py-3 text-sm text-right">
								<div class="flex justify-end gap-2">
									<button
										type="button"
										onclick={() => copyLink(file.filename)}
										class="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium"
									>
										Copy Link
									</button>
									<form
										method="POST"
										action="?/delete"
										use:enhance={({ cancel }) => {
											if (!confirm(`Delete "${file.originalName}"?`)) {
												cancel();
												return;
											}
											return async ({ update }) => {
												await update();
											};
										}}
									>
										<input type="hidden" name="id" value={file.id} />
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
