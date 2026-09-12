<script lang="ts">
	import discordLogo from '$lib/assets/images/logos/discord.svg';
</script>

<div
	class="flex min-h-screen w-full flex-col items-center justify-center overflow-auto p-6 md:p-24"
>
	<div class="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl md:p-12">
		<div class="mb-6 flex justify-center">
			<div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-hacksu-blue p-4">
				<img src={discordLogo} alt="Discord" class="h-full w-full brightness-0 invert" />
			</div>
		</div>

		<h1 class="text-center text-3xl font-bold text-white md:text-4xl">Join Our Discord</h1>
		<p class="mt-4 mb-8 text-center text-lg leading-relaxed text-white/70">
			Connect with fellow HacKSU members, get help with coding projects, and stay updated on the
			latest events and announcements!
		</p>

		<a
			href="/r/discord"
			class="block w-full rounded-xl bg-hacksu-blue px-6 py-4 text-center text-lg font-bold text-white transition-colors hover:bg-hacksu-blue/90"
		>
			Join the Server
		</a>
	</div>

	<p class="mt-8 text-sm text-white/60">Already a member? Open Discord directly!</p>
</div>
