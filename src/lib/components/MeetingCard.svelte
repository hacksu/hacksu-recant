<script lang="ts">
	type Meeting = {
		id: string;
		title: string;
		date: Date | string;
		presenter: string | null;
		link: string | null;
		descriptionMD: string | null;
		descriptionHTML: string | null;
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
		`meeting-container ${isFutureMeeting ? 'future-meeting' : ''} ${isPastMeeting ? 'past-meeting' : ''}`
	);
</script>

<div class={containerClass} style={background ? { background } : {}}>
	{#if isFutureMeeting || isPastMeeting}
		<div class="meeting-status">
			{isFutureMeeting ? 'Upcoming' : 'Past Meeting'}
		</div>
	{/if}

	{#if meeting.photo}
		<div class="cover-photo" style="background-image: url('{meeting.photo}')"></div>
	{/if}

	<div class="meeting">
		{#if meeting.link}
			<a
				href={meeting.link}
				target="_blank"
				rel="noopener noreferrer"
				class="meeting-title"
			>
				{#if meeting.link.startsWith('https://github.com')}
					<svg
						class="external-link"
						style="height: 30px; margin-right: 10px"
						viewBox="0 0 24 24"
						fill="white"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
						/>
					</svg>
				{:else}
					<svg
						class="external-link"
						style="height: 26px; margin-right: 10px"
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
				<h2>{solo ? 'Our next meeting: ' : ''}{meeting.title}</h2>
			</a>
		{:else}
			<span class="meeting-title">
				<h2>{solo ? 'Our next meeting: ' : ''}{meeting.title}</h2>
			</span>
		{/if}

		{#if meeting.descriptionHTML}
			<div class="meeting-text" style={solo ? 'overflow-y: scroll;' : ''}>{@html meeting.descriptionHTML}</div>
		{:else if meeting.descriptionMD}
			<div class="meeting-text" style={solo ? 'overflow-y: scroll;' : ''}>{meeting.descriptionMD}</div>
		{/if}

		{#if solo}
			<div class="meeting-footer">
				<span><strong>{formatDate(meeting.date)}</strong> at 7:00 PM</span>
				<strong>MSB 228</strong>
			</div>
		{:else}
			<div class="meeting-footer">
				<p><strong>{formatDate(meeting.date)}</strong></p>
				{#if meeting.presenter}
					<p style="text-align: right">
						Presented by <strong>{meeting.presenter}</strong>
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.meeting-container {
		background: linear-gradient(90deg, #ab52cb 0%, #9b4cbb 24%, #a14cc2 32%, #ab52cb 100%);
		opacity: 1;
		border-radius: 15px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin: 0 auto 80px auto;
		position: relative;
		max-width: 500px;
		box-shadow: 4px 6px 4px rgba(0, 0, 0, 0.15);
		padding-bottom: 16px;
		overflow: hidden;
		text-align: left;
		min-height: 0;
		flex-shrink: 1;
	}

	.meeting-container:first-of-type {
		margin-top: 50px;
	}

	.meeting {
		display: flex;
		flex-direction: column;
		min-height: 0;
		flex-shrink: 1;
		width: 100%;
		font-size: 1rem;
	}

	.meeting > * {
		padding: 0 24px;
	}

	.meeting :global(a:visited),
	.meeting :global(a) {
		color: white;
		text-decoration: none;
	}

	.meeting h2 {
		display: inline;
		font-size: 1.5rem;
		margin: 0;
		color: white;
	}

	.cover-photo {
		width: 100%;
		padding-bottom: 40%;
		background-size: cover;
		background-position: center;
	}

	.meeting-title {
		margin: 12px 0 8px;
		display: flex;
		align-items: center;
		color: white;
	}

	.meeting-text {
		scrollbar-width: thin;
		color: white;
		line-height: 1.6;
	}

	.meeting-text::-webkit-scrollbar {
		width: 6px;
	}

	.meeting-text {
		min-height: 0;
		flex-shrink: 1;
	}

	.meeting-text :global(h1),
	.meeting-text :global(h2),
	.meeting-text :global(h3) {
		color: white;
		margin-top: 1em;
		margin-bottom: 0.5em;
	}

	.meeting-text :global(p) {
		margin-bottom: 0.5em;
	}

	.meeting-text :global(a) {
		color: white;
		text-decoration: underline;
	}

	.meeting-text :global(strong) {
		font-weight: 600;
		color: white;
	}

	.meeting-footer {
		display: flex;
		justify-content: space-between;
		margin-top: 4px;
		color: white;
	}

	.meeting-footer > p {
		padding: 4px;
		margin: 2px -4px;
	}

	.external-link {
		margin-right: 10px;
	}

	.meeting-footer strong {
		font-weight: 600;
	}

	.meeting-status {
		position: absolute;
		top: 10px;
		right: 10px;
		background-color: rgba(0, 0, 0, 0.6);
		color: white;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
		z-index: 1;
	}

	.future-meeting {
		border: 2px solid #2ecc71;
	}

	.future-meeting .meeting-status {
		background-color: rgba(46, 204, 113, 0.4);
	}

	.past-meeting {
		opacity: 1;
	}

	.past-meeting .meeting-status {
		background-color: rgba(0, 0, 0, 0.4);
	}
</style>
