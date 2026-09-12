<script lang="ts">
	import discordIcon from '$lib/assets/images/logos/discord.svg';
	import githubIcon from '$lib/assets/images/logos/github.svg';
	import hackedSuLogo from '$lib/assets/images/HackedSU.png';
</script>

<div class="flex min-h-screen flex-col px-6 py-16">
	<header class="mx-auto mb-12 max-w-2xl text-center">
		<img src={hackedSuLogo} alt="HacKSU" class="mx-auto mb-6 h-28 w-auto object-contain" />
		<h1 class="text-4xl font-bold text-white md:text-5xl">Oops!</h1>
		<p class="mt-4 text-lg leading-relaxed text-white/70">
			You ended up somewhere that does not exist. These links can help you get back on track.
		</p>
	</header>

	<div class="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
		<section
			class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-transform hover:-translate-y-1 hover:border-hacksu-green"
		>
			<div
				class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-hacksu-green"
			>
				<img src={discordIcon} alt="Discord" class="h-10 w-10 brightness-0" />
			</div>
			<h2 class="mb-3 text-2xl font-bold text-white">Join Our Discord</h2>
			<p class="mb-5 text-sm leading-relaxed text-white/70 md:text-base">
				Tell us that a link on the website is broken.
			</p>
			<a
				href="/r/discord"
				class="font-medium text-hacksu-blue no-underline transition-colors hover:text-hacksu-green hover:underline"
			>
				Join Discord Server
			</a>
		</section>

		<section
			class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-transform hover:-translate-y-1 hover:border-hacksu-blue"
		>
			<div
				class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-hacksu-blue"
			>
				<img src={githubIcon} alt="GitHub" class="h-10 w-10 brightness-0 invert" />
			</div>
			<h2 class="mb-3 text-2xl font-bold text-white">Join the Team</h2>
			<p class="mb-5 text-sm leading-relaxed text-white/70 md:text-base">
				Contribute to the site and help us fix what broke.
			</p>
			<a
				href="https://github.com/hacksu/hacksu-recant"
				target="_blank"
				rel="noopener noreferrer"
				class="font-medium text-hacksu-blue no-underline transition-colors hover:text-hacksu-green hover:underline"
			>
				View on GitHub
			</a>
		</section>
	</div>

	<p class="mt-12 text-center text-sm text-white/60">
		Or go <a class="font-medium text-hacksu-blue hover:text-hacksu-green" href="/"
			>back to the homepage</a
		>.
	</p>
</div>
