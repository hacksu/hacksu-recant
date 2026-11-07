<script lang="ts">
	import { untrack } from 'svelte';
	import favicon from '$lib/assets/images/favicon.svg';
	import { UPLOAD_CATEGORIES } from '$lib/uploads';
	import FileInput from './FileInput.svelte';

	let {
		images,
		value = null,
		fallback = favicon
	}: {
		images: { url: string; name: string; category: string }[];
		value?: string | null;
		fallback?: string;
	} = $props();

	let selected = $state(untrack(() => value));
	let uploadPreview = $state<string | null>(null);
	let open = $state(false);
	let root: HTMLDivElement;
	let upload: FileInput;

	const groups = $derived(
		Object.entries(UPLOAD_CATEGORIES)
			.map(([category, label]) => ({ label, items: images.filter((i) => i.category === category) }))
			.filter((g) => g.items.length > 0)
	);
	const optionClass = 'w-full flex items-center gap-3 px-3 py-1.5 text-left hover:bg-white/10';

	function choose(url: string | null) {
		selected = url;
		uploadPreview = null;
		upload.clear();
		open = false;
	}
</script>

<svelte:window onclick={(e) => open && !root.contains(e.target as Node) && (open = false)} />

<div bind:this={root}>
	<span class="block text-sm font-medium mb-2">Photo</span>
	<div class="flex flex-wrap items-start gap-4">
		<img
			src={uploadPreview ?? selected ?? fallback}
			alt="Preview"
			class="w-40 h-40 shrink-0 rounded-lg object-cover bg-black/20 border border-white/10"
			onerror={(e) => ((e.currentTarget as HTMLImageElement).src = favicon)}
		/>
		<div class="flex-1 min-w-56 max-w-md space-y-2">
			<input type="hidden" name="photoUrl" value={selected ?? ''} />
			<div class="relative">
				<button
					type="button"
					onclick={() => (open = !open)}
					class="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-left"
				>
					{#if selected}
						<img src={selected} alt="" class="w-8 h-8 rounded object-cover" />
						<span class="truncate">{images.find((i) => i.url === selected)?.name ?? selected}</span>
					{:else}
						<span class="text-white/50">No image</span>
					{/if}
					<span class="ml-auto text-white/50">▾</span>
				</button>
				{#if open}
					<div class="absolute z-20 mt-1 w-full max-h-80 overflow-y-auto rounded-lg border border-white/10 bg-hacksu-grey shadow-lg py-1">
						<button type="button" class={optionClass} onclick={() => choose(null)}>No image</button>
						{#each groups as group (group.label)}
							<div class="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-white/50">{group.label}</div>
							{#each group.items as image (image.url)}
								<button
									type="button"
									class={optionClass}
									class:text-hacksu-green={image.url === selected}
									onclick={() => choose(image.url)}
								>
									<img src={image.url} alt="" loading="lazy" class="w-8 h-8 rounded object-cover" />
									<span class="truncate">{image.name}</span>
								</button>
							{/each}
						{/each}
					</div>
				{/if}
			</div>
			<p class="text-xs text-gray-500">or upload a new one</p>
			<FileInput
				bind:this={upload}
				name="photo"
				accept="image/*"
				onchange={(file) => (uploadPreview = file ? URL.createObjectURL(file) : null)}
			/>
		</div>
	</div>
</div>
