<script lang="ts">
	import { getTechnologyIconUrlAsync } from '$lib/lessons/iconify';
	import { onMount } from 'svelte';

	let { category, lessonCount }: { category: string; lessonCount: number } = $props();

	const displayCategory = $derived(category.charAt(0).toUpperCase() + category.slice(1));

	let iconUrl = $state<string | null>(null);

	onMount(async () => {
		iconUrl = await getTechnologyIconUrlAsync(category);
	});

	const initials = $derived.by(() => {
		if (iconUrl) return null;
		const words = category.split(/[\s-]/);
		if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
		return category.substring(0, 2).toUpperCase();
	});
</script>

<div
	class="relative flex min-h-[220px] cursor-pointer flex-col items-center justify-start overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-center transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-hacksu-green active:-translate-y-0.5"
	role="button"
	tabindex="0"
>
	<div class="flex flex-col items-center w-full h-full p-9 gap-4 overflow-hidden box-border">
		<div
			class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-hacksu-green px-2"
		>
			{#if iconUrl}
				<img src={iconUrl} alt={category} class="w-full h-full object-contain" />
			{:else if initials}
				<span class="text-2xl font-semibold tracking-wide text-hacksu-grey">{initials}</span>
			{:else}
				<span class="text-4xl">📁</span>
			{/if}
		</div>

		<h2
			class="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold tracking-tight text-white"
		>
			{displayCategory}
		</h2>

		<div class="mt-auto text-sm text-white/60">
			{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
		</div>
	</div>
</div>
