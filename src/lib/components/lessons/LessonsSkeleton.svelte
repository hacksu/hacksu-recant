<script lang="ts">
	// Skeleton loader for the lessons page
</script>

<div class="bg-gradient-to-tl from-[#35c982] to-[#4683ff] min-h-screen p-8 md:p-4">
	<div class="max-w-[1200px] mx-auto">
		<h1 class="text-center text-white text-5xl md:text-3xl font-bold my-8 opacity-90">HacKSU Lessons</h1>
		<p class="text-center text-white/70 text-xl mb-8">Loading lessons...</p>

		<!-- Search bar skeleton -->
		<div class="w-full max-w-[600px] mx-auto mb-8">
			<div class="w-full h-14 bg-white/10 rounded-full animate-pulse"></div>
		</div>

		<div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-1 gap-6 mt-8">
			{#each Array(5) as _, i}
				<div
					class="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-4"
				>
					<div class="flex justify-between items-start gap-4">
						<div class="h-6 w-3/5 bg-white/20 rounded animate-pulse" style="animation-delay: {i * 0.1}s;"></div>
						<div class="h-7 w-[60px] bg-white/20 rounded-xl animate-pulse" style="animation-delay: {i * 0.1 + 0.1}s;"></div>
					</div>
					<div class="h-4 w-full bg-white/15 rounded animate-pulse" style="animation-delay: {i * 0.1 + 0.2}s;"></div>
					<div class="h-4 w-3/4 bg-white/15 rounded animate-pulse" style="animation-delay: {i * 0.1 + 0.3}s;"></div>
					<div class="flex justify-between items-center pt-2 border-t border-white/10">
						<div class="h-3.5 w-[100px] bg-white/15 rounded animate-pulse" style="animation-delay: {i * 0.1 + 0.4}s;"></div>
						<div class="h-3.5 w-20 bg-white/15 rounded animate-pulse" style="animation-delay: {i * 0.1 + 0.5}s;"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>


