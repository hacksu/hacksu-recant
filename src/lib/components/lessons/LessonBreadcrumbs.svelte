<script lang="ts">
	import { goto } from '$app/navigation';

	let { path }: { path: string[] } = $props();

	function navigateToPath(index: number) {
		if (index === -1) {
			goto('/lessons');
		} else {
			const targetPath = path.slice(0, index + 1);
			goto(`/lessons/${targetPath.join('/')}`);
		}
	}
</script>

<nav class="flex items-center flex-wrap gap-2 mb-8">
	<button
		class="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm cursor-pointer transition-all duration-200 capitalize hover:bg-white/20 hover:-translate-y-px"
		onclick={() => navigateToPath(-1)}
	>
		Lessons
	</button>
	{#each path as segment, index}
		<span class="text-white/60 text-sm">/</span>
		<button
			class="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm cursor-pointer transition-all duration-200 capitalize hover:bg-white/20 hover:-translate-y-px {index === path.length - 1 ? 'bg-white/20 font-bold cursor-default hover:translate-y-0' : ''}"
			onclick={() => navigateToPath(index)}
		>
			{segment.charAt(0).toUpperCase() + segment.slice(1)}
		</button>
	{/each}
</nav>


