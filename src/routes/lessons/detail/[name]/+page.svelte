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

<div class="bg-gradient-to-tl from-[#35c982] to-[#4683ff] min-h-screen p-8 md:p-4">
	<div class="max-w-[900px] mx-auto">
		<button
			class="bg-white/10 border border-white/20 rounded-lg px-6 py-3 text-white text-base cursor-pointer transition-all duration-200 backdrop-blur-md mb-8 hover:bg-white/20 hover:-translate-x-1"
			onclick={goBack}
		>
			← Back to Lessons
		</button>

		{#if error}
			<div class="flex flex-col items-center justify-center min-h-[60vh] text-white text-center">
				<h1 class="text-3xl mb-4">Error Loading Lesson</h1>
				<p class="text-lg mb-6">{error}</p>
				<button
					class="bg-white/20 border border-white/30 rounded-lg px-6 py-3 text-white text-base cursor-pointer transition-all duration-200 hover:bg-white/30"
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
			<div class="bg-white/95 rounded-2xl p-12 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
				<div class="flex items-center justify-between gap-4 flex-wrap mb-8">
					<h1 class="text-4xl md:text-3xl font-bold m-0 text-[#142027] capitalize">{repoName}</h1>
					<a
						class="text-[#4683ff] font-bold no-underline border border-[rgba(70,131,255,0.2)] px-3.5 py-2 rounded-[10px] bg-[rgba(70,131,255,0.08)] transition-all duration-200 ease-in-out hover:bg-[rgba(70,131,255,0.14)] hover:border-[rgba(70,131,255,0.35)] hover:-translate-y-px"
						href={repoUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						View on GitHub →
					</a>
				</div>
				<div
					class="prose prose-slate max-w-none prose-headings:text-[#142027] prose-a:text-[#4683ff] prose-a:no-underline hover:prose-a:underline prose-code:text-[#142027] prose-code:bg-[#f8f9fa] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-[#f8f9fa] prose-pre:border prose-pre:border-[#e0e0e0] prose-pre:rounded-lg prose-img:rounded-lg prose-img:shadow-md"
				>
					{@html readmeHtml}
				</div>
			</div>
		{/if}
	</div>
</div>

