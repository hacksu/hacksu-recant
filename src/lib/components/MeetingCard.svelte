<script lang="ts">
	import { renderMarkdown } from '$lib/utils/markdown';
	import { MEETING_TIMEZONE } from '$lib/utils/timezone';
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

	let { meeting, solo = false }: { meeting: Meeting; solo?: boolean } = $props();

	function toDate(date: Date | string): Date {
		return typeof date === 'string' ? new Date(date) : date;
	}

	function formatDate(date: Date | string): string {
		const dateObj = toDate(date);
		if (isNaN(dateObj.getTime())) {
			return 'Invalid date';
		}
		return dateObj.toLocaleDateString('en-us', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			timeZone: MEETING_TIMEZONE
		});
	}

	function formatTime(date: Date | string): string {
		const dateObj = toDate(date);
		if (isNaN(dateObj.getTime())) {
			return '';
		}
		return dateObj.toLocaleTimeString('en-us', {
			hour: 'numeric',
			minute: '2-digit',
			timeZone: MEETING_TIMEZONE
		});
	}

	const meetingDate = $derived.by(() => toDate(meeting.date));
	const isPastMeeting = $derived.by(() => meetingDate < new Date());
	const isFutureMeeting = $derived.by(() => meetingDate > new Date());

	const containerClass =
		'relative mx-auto mb-24 max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-hacksu-blue text-left first:mt-12';

	const descriptionHtml = $derived(
		meeting.descriptionMD ? renderMarkdown(meeting.descriptionMD) : null
	);
</script>

<div class={containerClass}>
	{#if meeting.photo}
		<div class="relative">
			<img src={meeting.photo} alt={meeting.title} class="block h-auto w-full" />
			{#if isFutureMeeting || isPastMeeting}
				<div
					class="absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-sm font-medium {isFutureMeeting
						? 'bg-hacksu-green text-hacksu-grey'
						: 'bg-white/10 text-white/70'}"
				>
					{isFutureMeeting ? 'Upcoming' : 'Past Meeting'}
				</div>
			{/if}
		</div>
	{/if}

	<div class="flex min-h-0 w-full flex-col gap-1.5 p-6 text-base">
		{#if !meeting.photo && (isFutureMeeting || isPastMeeting)}
			<div
				class="mb-0.5 w-fit rounded-full px-3 py-1 text-sm font-medium {isFutureMeeting
					? 'bg-hacksu-green text-hacksu-grey'
					: 'bg-white/10 text-white/70'}"
			>
				{isFutureMeeting ? 'Upcoming' : 'Past Meeting'}
			</div>
		{/if}

		<div class="flex items-start text-white">
			{#if meeting.link}
				<a
					href={meeting.link}
					target="_blank"
					rel="noopener noreferrer"
					class="flex min-w-0 items-center text-white no-underline"
				>
					{#if meeting.link.startsWith('https://github.com')}
						<img src={githubIcon} alt="GitHub" class="h-8 w-8 flex-shrink-0 icon-white" />
					{:else}
						<svg
							class="mr-2.5 h-[26px] flex-shrink-0"
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
					<h2 class="m-0 inline text-2xl text-white">{meeting.title}</h2>
				</a>
			{:else}
				<span class="flex min-w-0 items-center text-white">
					<h2 class="m-0 inline text-2xl text-white">{meeting.title}</h2>
				</span>
			{/if}
		</div>

		{#if descriptionHtml}
			<div
				class="prose prose-invert prose-sm min-h-0 max-w-none flex-shrink text-white leading-relaxed prose-headings:text-white prose-p:my-1.5 prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:rounded prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:text-white prose-pre:my-4 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-black/30 prose-pre:p-4 prose-pre:text-white prose-a:text-white prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-white/80 prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:my-4 prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:pl-4 prose-blockquote:text-white/90 prose-blockquote:italic prose-hr:my-4 prose-hr:border-white/30 {solo
					? 'overflow-y-scroll'
					: ''}"
			>
				{@html descriptionHtml}
			</div>
		{/if}

		{#if solo}
			<div class="mt-1 flex justify-between text-white">
				<span><strong>{formatDate(meeting.date)}</strong> at {formatTime(meeting.date)}</span>
				<strong>MSB 228</strong>
			</div>
		{:else}
			<div class="mt-1 flex justify-between text-white">
				<p class="m-0"><strong>{formatDate(meeting.date)}</strong></p>
				{#if meeting.presenter}
					<p class="m-0 text-right">
						Presented by <strong>{meeting.presenter}</strong>
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
