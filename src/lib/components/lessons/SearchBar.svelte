<script lang="ts">
	let { value, onInput }: { value: string; onInput: (value: string) => void } = $props();

	let searchValue = $state(value || '');

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchValue = target.value;
		onInput(searchValue);
	}
</script>

<div class="search-container">
	<svg
		class="search-icon"
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
		class="search-input"
		placeholder="Search lessons by title or tags..."
		value={searchValue}
		oninput={handleInput}
	/>
</div>

<style>
	.search-container {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 0 auto 2rem;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		width: 1.25rem;
		height: 1.25rem;
		color: rgba(255, 255, 255, 0.6);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 1rem 1rem 1rem 3rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50px;
		color: white;
		font-size: 1rem;
		outline: none;
		transition: all 0.3s;
		backdrop-filter: blur(10px);
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.search-input:focus {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.4);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}
</style>


