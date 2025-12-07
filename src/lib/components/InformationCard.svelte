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

<div class="flex flex-col md:flex-row-reverse justify-start mx-auto mb-10 max-w-4xl rounded-2xl shadow-lg overflow-hidden text-left min-h-0 flex-shrink opacity-[0.975] first:mt-12 bg-gradient-to-r from-[#9b4cbb] via-[#9d4db9] via-[#a14ec2] to-[#ab52cb]">
	{#if information.photo}
		<div class="w-full md:max-w-[40%] h-auto">
			<img class="w-full h-full object-cover" src={information.photo} alt={information.title} />
		</div>
	{/if}

	<div class="flex flex-col min-h-0 flex-shrink w-full md:min-w-[60%] text-base">
		<component
			this={information.link ? 'a' : 'span'}
			href={information.link ?? undefined}
			target={information.link ? '_blank' : undefined}
			rel={information.link ? 'noopener noreferrer' : undefined}
			class="my-3 mb-2 flex items-center text-white px-4 md:px-6"
		>
			{#if information.link}
				<svg
					class="h-[26px] mr-2.5 flex-shrink-0"
					viewBox="0 0 24 24"
					fill="white"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"
						stroke="white"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
					/>
				</svg>
			{/if}
			<h2 class="inline text-xl md:text-2xl m-0 text-white">{information.title}</h2>
		</component>

		<div class="min-h-0 flex-shrink px-4 md:px-6 pb-4 md:pb-0 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:text-white prose-a:text-white prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-white/80 prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:text-white prose-blockquote:border-white/30">
			{@html descriptionHtml}
		</div>
	</div>
</div>
