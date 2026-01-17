<!-- src/routes/+error.svelte -->
<script lang="ts">
import discordIcon from '$lib/assets/images/logos/discord.svg';
import githubIcon from '$lib/assets/images/logos/github.svg';
</script>

<div class="h-screen bg-hacksu-grey">
    <h1 class="text-4xl text-center md:text-5xl font-bold text-gray-900 dark:text-white mb-4 pt-8">Oops!</h1>
    <p class="text-center text-white/90 text-xl mb-8">You ended up somewhere that does not exist! Our team of CS students are hopefully working to fix that! In the mean time maybe one of these will help?</p>
    <div class="grid grid-cols-2 grid-rows-1 gap-8 pr-4 pl-4">
          <!-- Discord Card -->
          <div
				class="bg-gray-700 rounded-2xl p-8 md:p-10 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
			>
				<div class="w-20 h-20 rounded-full bg-hacksu-blue flex items-center justify-center mx-auto mb-5">
					<img src={discordIcon} alt="Discord" class="w-10 h-10" />
				</div>
				<h3 class="text-2xl font-bold text-hacksu-green mb-3">Join Our Discord</h3>
				<p class="text-gray-300 text-sm md:text-base leading-relaxed mb-5">
					Tell us that our website is broken :D
				</p>
				<a
					href="https://discord.gg/rJDdvnt"
					target="_blank"
					rel="noopener noreferrer"
					class="text-hacksu-blue no-underline font-medium transition-colors hover:text-hacksu-green hover:underline"
				>
					Join Discord Server
				</a>
			</div>

          <!-- GitHub Card -->
			<div
				class="bg-gray-700 rounded-2xl p-8 md:p-10 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
			>
				<div class="w-20 h-20 rounded-full bg-hacksu-blue flex items-center justify-center mx-auto mb-5">
					<img src={githubIcon} alt="Github" class="w-10 h-10" />
				</div>
				<h3 class="text-2xl font-bold text-hacksu-green mb-3">Join The Team</h3>
				<p class="text-gray-300 text-sm md:text-base leading-relaxed mb-5">
					Contribute to the site and fix what we broke
				</p>
				<a
					href="https://github.com/hacksu/hacksu-recant"
					target="_blank"
					rel="noopener noreferrer"
					class="text-hacksu-blue no-underline font-medium transition-colors hover:text-hacksu-green hover:underline"
				>
					GitHub
				</a>
			</div>
    </div>
    <p class="text-center text-zinc-600 text-sm absolute inset-x-0 bottom-0">Or click 
     <a class="text-center text-blue-300 text-sm" href="hacksu.com">here</a>
     to go back to our homepage</p>
</div>