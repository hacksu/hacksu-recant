<script lang="ts">
	import hacksuLogo from '$lib/assets/hacksu_logo.svg';
	import discordImage from '$lib/assets/HacKSU_Discord.png';
    import hacksuBox from '$lib/assets/hacksu-box.png'

	const title = 'Interested in Coding?';
	const body = 'HacKSU teaches anyone, regardless of skill level or major, how to code!';
	const meetings = 'Tuesdays, 7PM - 8PM';
	const meetings2 = 'IN PERSON';
	const discord = 'https://discord.com/invite/r8vVvsE';
    

	const showcases = [
		'Design a website',
		'Create a mobile app',
		'Write a Discord bot',
		'Host a webserver',
		'Debug a program',
		// 'Improve your Resume',
	];

</script>

<div class="hotcard-wrapper">

	<!-- THIS IS HARD -->
	<div>
		<div class="landing card-front">
			<div class="guidelines"></div>

			<div
				class="hacksu-box box1 inversed"
				style={`background-image: url(${hacksuBox});`}
			></div>
			<div
				class="hacksu-box box2 inversed"
				style={`background-image: url(${hacksuBox});`}
			></div>
			<div class="background"></div>

			<div class="content">
				<img class="main-logo" src={hacksuLogo} alt="HacKSU" />
				<h1 style="margin-bottom: 0;">{title}</h1>
				<p class="main-p" style="margin-top: 5px;">{body}</p>
				<img class="qr" style="margin-top: 5px;" src={discordImage} alt="Discord QR" />
				<p
					style="margin-top: 2.5px; margin-bottom: 0; font-size: 0.85em; opacity: 0.65;"
				>
					{discord}
				</p>
				<p style="margin-bottom: 0; margin-top: 10px;">{meetings}</p>
				<p style="margin-bottom: 5px; margin-top: 0;">{meetings2}</p>
				<p
					style="margin-top: 0; opacity: 0.5; font-size: 0.85em; margin-bottom: 10px;"
				>
					hacksu.com
				</p>
			</div>
		</div>

		<div class="landing card-back">
			<div class="guidelines"></div>

			<div class="hacksu-box box1" style={`background-image: url(${hacksuBox});`}></div>
			<div class="hacksu-box box2" style={`background-image: url(${hacksuBox});`}></div>
			<div class="background"></div>

			<div class="content content-back">
				<div class="back-left">
					<h3>We'll show you how to...</h3>
					<ul class="dashed">
						{#each showcases as item}
							<li>{item}</li>
						{/each}
						<li class="no-before2">And much more!</li>
					</ul>
					<p>
						Even if you have no experience, we'll show you the ropes; regardless of
						your major!
					</p>
				</div>

				<div class="back-middle">
					<h3>Interested in the Career Fair?</h3>
					<p>
						We host a resume workshop and bring in real managers to do mock interviews
						and give feedback on your resume!
					</p>
				</div>

				<div class="back-right">
					<h3>Just want to socialize?</h3>
					<p>
						HacKSU is a great place to chat about coding and technology, or just hang
						out and play games!
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Dimensions are in inches for print layout */
	.hotcard-wrapper {
		/* Just wrap the two stacked cards; don't fill page */
		display: inline-block;
		background-color: #142027;
		padding: 0;
	}

	/* Center the wrapper on screen without stretching it */
	:global(body) {
        display: flex;
        flex-direction: column;
		background-color: #020617; /* match site background */
	}

	:global(body) .hotcard-wrapper {
		margin: 2rem auto;
	}

	.guidelines {
		position: absolute;
		top: 0;
		left: 0;
		/* Match card size so red border reaches the right edge */
		width: 4.5in;
		height: 5.75in;
		border: 0.125in solid rgba(255, 0, 0, 0.25);
		z-index: 100; /* Above everything for visibility */
		pointer-events: none; /* Don't interfere with interactions */
	}

	.qr {
		border-radius: 0.5em;
		max-height: 1.5in;
	}


	ul {
		margin: 0;
		padding: 0;
	}

	ul.dashed {
		margin-left: -25px;
		list-style-type: none;
	}

	ul.dashed > li {
		text-indent: 0;
		margin-bottom: 0;
	}

	ul.dashed > li:not(.no-before2)::before {
		content: '\2013  ';
		text-indent: 0;
		padding-right: 5px;
	}

	.landing {
		position: relative;
		width: 4.5in; /* widthActual */
		height: 5.75in; /* heightActual */
		overflow: hidden;
		box-sizing: border-box;
	}

	.landing .content {
		position: relative;
		z-index: 10;
		color: white;
		text-align: center;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0.25in;
		box-sizing: border-box;
	}

	.landing .content h1 {
		font-size: 0.2475in; /* 0.045 * height */
	}

	.landing .content .main-p {
		font-size: 0.14875in; /* 0.035 * width */
		width: 80%;
		max-width: 80%;
		margin: 0;
	}

	.landing .main-logo {
		margin-top: 0.4125in; /* 0.075 * height */
		height: 1.1in; /* 0.2 * height */
	}

	.landing .background {
		position: absolute;
		z-index: 0;
		height: 5.75in;
		width: 4.5in;
		background-color: #142027;
		left: 0;
		top: 0;
	}

	.hacksu-box {
		position: absolute;
		z-index: 1; /* Above background, below content */
		/* background image is set inline in markup via Svelte, using hacksuBox */
		background-size: contain;
		background-repeat: no-repeat;
		width: calc(0.4 * 4.5in);
		max-width: calc(0.5 * 4.5in);
		height: calc(0.4 * 5.75in);
		max-height: calc(0.5 * 5.75in);
	}

	.hacksu-box.box1 {
		background-position-y: calc(0.15 * 5.5in);
		background-position-x: calc(-0.12 * 5.5in);
		left: 0;
		top: calc(5.75in - (0.4 * 5.75in));
	}

	.hacksu-box.box2 {
		transform: rotate(90deg);
		background-position-x: calc(-0.07 * 5.75in);
		background-position-y: calc(-0.14 * 5.75in);
		left: calc(4.5in - (0.46 * 4.5in));
		top: -30px;
	}


	.card-back {
		overflow: hidden;
		position: relative;
	}

	.card-back .guidelines {
		top: 0; /* Position relative to card-back, not absolute from page top */
		z-index: 100; /* Above everything for visibility */
		pointer-events: none; /* Don't interfere with interactions */
	}



	.card-back .hacksu-box.box1 {
		left: 0;
		top: calc(5.75in + 5.75in - (0.4 * 5.75in));
	}

	.card-back .hacksu-box.box2 {
		left: calc(4.5in - (0.46 * 4.5in));
		top: calc(-30px + 5.75in);
	}

	/* Back of card layout */
	.content-back {
		padding: 0.35in;
		padding-top: 0.15in;
		text-align: left;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.content-back h3 {
		margin-bottom: 5px;
		margin-top: 10px;
	}

	.back-left {
		width: 100%;
	}

	.back-left p {
		margin-top: 5px;
		margin-bottom: 10px;
	}

	.back-middle {
		width: 100%;
	}

	.back-middle p {
		margin-top: 0;
		margin-bottom: 10px;
	}

	.back-right {
		width: 100%;
		text-align: right;
	}

	.back-right p {
		max-width: calc(0.625 * 4.5in);
		margin-top: 0;
		margin-bottom: 10px;
		margin-left: auto;
	}

	/* Print: only show the hotcard and position for printing */
	@media print {
		body * {
			visibility: hidden;
		}

		.hotcard-wrapper,
		.hotcard-wrapper * {
			visibility: visible;
		}

		.hotcard-wrapper {
			position: absolute;
			left: 0;
			top: 0;
			margin: 0;
		}

		/* Force page break after front card */
		.card-front {
			page-break-after: always;
			break-after: page;
		}

		/* Page size for each card (front and back on separate pages) */
		@page {
			size: 4.5in 5.75in;
			margin: 0;
		}
	}
</style>
