<script lang="ts">
	import { renderMarkdown } from '$lib/utils/markdown';

	type Information = {
		id: string;
		title: string;
		link: string | null;
		description: string; // raw markdown/plaintext
		photo: string | null;
	};

	let { information }: { information: Information } = $props();

	const descriptionHtml = $derived(renderMarkdown(information.description));
</script>

<article
	class="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-hacksu-green text-left shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-white/20"
>
	{#if information.photo}
		<div class="aspect-square w-full overflow-hidden border-b border-white/10 bg-black/20">
			<img class="h-full w-full object-cover" src={information.photo} alt={information.title} />
		</div>
	{/if}

	<div class="flex flex-col p-6">
		{#if information.link}
			<a
				href={information.link}
				target="_blank"
				rel="noopener noreferrer"
				class="group/title flex w-fit items-center gap-2 text-white no-underline"
			>
				<h2 class="m-0 text-xl font-semibold md:text-2xl">{information.title}</h2>
				<svg
					class="h-5 w-5 flex-shrink-0 transition-transform group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					<path
						d="M7 17 17 7m-7 0h7v7"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</a>
		{:else}
			<h2 class="m-0 text-xl font-semibold text-white md:text-2xl">{information.title}</h2>
		{/if}

		<div
			class="mt-3 prose prose-invert prose-sm max-w-none text-white prose-headings:text-white prose-p:my-0 prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:rounded prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:text-white prose-a:text-white prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-white/80 prose-ul:my-0 prose-ul:text-white prose-ol:my-0 prose-ol:text-white prose-li:text-white prose-blockquote:border-white/30 prose-blockquote:text-white/90"
		>
			{@html descriptionHtml}
		</div>
	</div>
</article>
