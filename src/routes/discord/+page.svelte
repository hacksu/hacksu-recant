<script lang="ts">
	import discordLogo from '$lib/assets/images/logos/discord.svg';
</script>

<div class="w-full min-h-screen bg-gradient-to-br from-hacksu-green via-hacksu-blue to-indigo-900 p-6 md:p-24 overflow-auto flex flex-col items-center justify-center relative">
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
		<div class="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
	</div>

	<div class="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
		<div class="flex justify-center mb-6">
			<div class="w-20 h-20 bg-[#5865F2] rounded-2xl flex items-center justify-center shadow-lg p-4">
				<img src={discordLogo} alt="Discord" class="w-full h-full brightness-0 invert" />
			</div>
		</div>

		<h1 class="text-center text-white text-3xl md:text-4xl font-bold mb-4">Join Our Discord</h1>
		
		<p class="text-white/80 text-center text-lg mb-8 leading-relaxed">
			Connect with fellow HacKSU members, get help with coding projects, and stay updated on the latest events and announcements!
		</p>

		<a 
			href="/r/discord" 
			class="block w-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-center py-4 px-6 rounded-xl font-bold text-lg transition-colors duration-200"
		>
			Join the Server
		</a>
	</div>

	<p class="relative z-10 mt-8 text-white/50 text-sm">
		Already a member? Open Discord directly!
	</p>
</div>
