<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { renderMarkdown } from '$lib/utils/markdown';

	let { data }: { data: PageData } = $props();

	const readme = $derived(data.readme);
	const repoName = $derived(data.repoName);
	const error = $derived(data.error);
	const repoUrl = $derived(`https://github.com/hacksu/${repoName}`);
	const readmeHtml = $derived(readme ? renderMarkdown(readme) : '');

	function goBack() {
		goto('/lessons');
	}
</script>

<div class="min-h-screen p-8 md:p-4">
	<div class="mx-auto max-w-[900px]">
		<button
			class="mb-8 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-base text-white transition-all duration-200 hover:-translate-x-1 hover:border-hacksu-green"
			onclick={goBack}
		>
			← Back to Lessons
		</button>

		{#if error}
			<div class="flex flex-col items-center justify-center min-h-[60vh] text-white text-center">
				<h1 class="text-3xl mb-4">Error Loading Lesson</h1>
				<p class="text-lg mb-6">{error}</p>
				<button
					class="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-base text-white transition-all duration-200 hover:border-hacksu-green"
					onclick={goBack}
				>
					Go Back
				</button>
			</div>
		{:else if !readme}
			<div class="flex flex-col items-center justify-center min-h-[60vh] text-white text-center">
				<div
					class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"
				></div>
				<p>Loading lesson content...</p>
			</div>
		{:else}
			<div class="rounded-2xl border border-white/10 bg-white/5 p-12 md:p-6">
				<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 class="mb-3 text-4xl font-bold capitalize text-white md:text-3xl">{repoName}</h1>
					</div>
					<a
						class="rounded-[10px] border border-hacksu-blue/30 bg-hacksu-blue/15 px-3.5 py-2 font-bold text-hacksu-blue no-underline transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-hacksu-blue hover:bg-hacksu-blue/25"
						href={repoUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						View on GitHub →
					</a>
				</div>
				<div
					class="prose prose-invert max-w-none prose-headings:text-white prose-a:text-hacksu-blue prose-a:no-underline hover:prose-a:underline prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-white prose-code:text-sm prose-pre:rounded-lg prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/30 prose-img:rounded-lg prose-img:shadow-md"
				>
					{@html readmeHtml}
				</div>
			</div>
		{/if}
	</div>
</div>
