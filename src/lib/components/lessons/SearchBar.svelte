<script lang="ts">
	let { value, onInput }: { value: string; onInput: (value: string) => void } = $props();

	let searchValue = $state('');

	$effect(() => {
		searchValue = value || '';
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchValue = target.value;
		onInput(searchValue);
	}
</script>

<div class="relative w-full max-w-[600px] mx-auto mb-8">
	<svg
		class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle cx="11" cy="11" r="8"></circle>
		<path d="m21 21-4.35-4.35"></path>
	</svg>
	<input
		type="text"
		class="w-full rounded-full border border-white/10 bg-white/5 py-4 pr-4 pl-12 text-base text-white outline-none transition-all duration-300 placeholder:text-white/50 focus:border-hacksu-blue focus:bg-white/10"
		placeholder="Search lessons by title or tags..."
		bind:value={searchValue}
		oninput={handleInput}
	/>
</div>
