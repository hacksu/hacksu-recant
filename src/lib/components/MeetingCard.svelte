<script lang="ts">
	import { renderMarkdown } from '$lib/utils/markdown';
	import githubIcon from '$lib/assets/images/logos/github.svg';

	type Meeting = {
		id: string;
		title: string;
		date: Date | string;
		presenter: string | null;
		link: string | null;
		descriptionMD: string | null;
		photo: string | null;
	};

	let { meeting, solo = false, background }: { meeting: Meeting; solo?: boolean; background?: string } = $props();

	function formatDate(date: Date | string): string {
		const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
		// Parse as that day at 7pm
		const dateObj = new Date(dateStr + 'T19:00:00');
		if (isNaN(dateObj.getTime())) {
			return 'Invalid date';
		}
		return dateObj.toLocaleDateString('en-us', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	const meetingDate = $derived.by(() => {
		const date = meeting.date;
		const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
		return new Date(dateStr + 'T19:00:00');
	});
	const isPastMeeting = $derived.by(() => {
		const now = new Date();
		return meetingDate < now;
	});
	const isFutureMeeting = $derived.by(() => {
		const now = new Date();
		return meetingDate > now;
	});

	const containerClass = $derived(
		`flex flex-col justify-center mx-auto mb-20 relative max-w-[500px] shadow-lg pb-4 overflow-hidden text-left min-h-0 flex-shrink rounded-2xl first:mt-12 ${
			isFutureMeeting ? 'border-2 border-hacksu-green' : ''
		} ${isPastMeeting ? '' : ''} ${
			background
				? ''
				: 'bg-gradient-to-r from-hacksu-purple via-[#9b4cbb] via-[#a14cc2] to-hacksu-purple'
		}`
	);

	const descriptionHtml = $derived(
		meeting.descriptionMD ? renderMarkdown(meeting.descriptionMD) : null
	);
</script>

<div class={containerClass} style={background ? { background } : {}}>
	{#if isFutureMeeting || isPastMeeting}
		<div
			class="absolute top-2.5 right-2.5 text-white px-3 py-1 rounded-full text-sm font-medium z-10 {isFutureMeeting
				? 'bg-hacksu-green/40'
				: 'bg-black/60'}"
		>
			{isFutureMeeting ? 'Upcoming' : 'Past Meeting'}
		</div>
	{/if}

	{#if meeting.photo}
		<div
			class="w-full pb-[40%] bg-cover bg-center"
			style="background-image: url('{meeting.photo}')"
		></div>
	{/if}

	<div class="flex flex-col min-h-0 flex-shrink w-full text-base [&>*]:px-6">
		{#if meeting.link}
			<a
				href={meeting.link}
				target="_blank"
				rel="noopener noreferrer"
				class="my-3 mb-2 flex items-center text-white no-underline"
			>
				{#if meeting.link.startsWith('https://github.com')}
					<img src={githubIcon} alt="GitHub" class="w-8 h-8 icon-white" />
				{:else}
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
				<h2 class="inline text-2xl m-0 text-white">{solo ? 'Our next meeting: ' : ''}{meeting.title}</h2>
			</a>
		{:else}
			<span class="my-3 mb-2 flex items-center text-white">
				<h2 class="inline text-2xl m-0 text-white">{solo ? 'Our next meeting: ' : ''}{meeting.title}</h2>
			</span>
		{/if}

		{#if descriptionHtml}
			<div
				class="min-h-0 flex-shrink prose prose-invert prose-sm max-w-none text-white leading-relaxed {solo
					? 'overflow-y-scroll'
					: ''} prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:text-white prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-black/30 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4 prose-a:text-white prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-white/80 prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:text-white/90 prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:italic prose-hr:border-white/30 prose-hr:my-4"
			>
				{@html descriptionHtml}
			</div>
		{/if}

		{#if solo}
			<div class="flex justify-between mt-1 text-white">
				<span><strong>{formatDate(meeting.date)}</strong> at 7:00 PM</span>
				<strong>MSB 228</strong>
			</div>
		{:else}
			<div class="flex justify-between mt-1 text-white">
				<p class="p-1 -mx-1 m-0.5"><strong>{formatDate(meeting.date)}</strong></p>
				{#if meeting.presenter}
					<p class="text-right p-1 -mx-1 m-0.5">
						Presented by <strong>{meeting.presenter}</strong>
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

