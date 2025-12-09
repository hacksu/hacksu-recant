<script lang="ts">
	let { value, onInput }: { value: string; onInput: (value: string) => void } = $props();

	let searchValue = $state(value || '');

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
		class="w-full py-4 pl-12 pr-4 bg-white/10 border border-white/20 rounded-full text-white text-base outline-none transition-all duration-300 backdrop-blur-md placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 focus:shadow-lg focus:shadow-black/20"
		placeholder="Search lessons by title or tags..."
		value={searchValue}
		oninput={handleInput}
	/>
</div>


