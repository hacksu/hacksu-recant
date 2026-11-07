<script lang="ts">
	let {
		name,
		accept,
		required = false,
		onchange
	}: { name: string; accept?: string; required?: boolean; onchange?: (file: File | null) => void } = $props();

	let input: HTMLInputElement;
	let file = $state<File | null>(null);
	const thumb = $derived(file?.type.startsWith('image/') ? URL.createObjectURL(file) : null);

	export function clear() {
		input.value = '';
		file = null;
	}
</script>

<div class="relative flex items-center gap-3 min-w-0">
	<input
		bind:this={input}
		type="file"
		{name}
		{accept}
		{required}
		class="sr-only"
		onchange={(e) => {
			file = e.currentTarget.files?.[0] ?? null;
			onchange?.(file);
		}}
	/>
	<button
		type="button"
		onclick={() => input.click()}
		class="shrink-0 bg-hacksu-green hover:bg-hacksu-green/90 text-hacksu-grey text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
	>
		{file ? 'Change file' : 'Choose file'}
	</button>
	{#if file}
		{#if thumb}
			<img src={thumb} alt="" class="w-9 h-9 shrink-0 rounded-md object-cover" />
		{/if}
		<span class="truncate text-sm">{file.name}</span>
		<span class="shrink-0 text-xs text-white/50">
			{file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`}
		</span>
		<button
			type="button"
			title="Remove"
			onclick={() => {
				clear();
				onchange?.(null);
			}}
			class="ml-auto shrink-0 px-1.5 text-lg leading-none text-white/50 hover:text-white"
		>
			×
		</button>
	{:else}
		<span class="text-sm text-white/50">No file chosen</span>
	{/if}
</div>
