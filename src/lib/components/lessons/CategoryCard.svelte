<script lang="ts">
	import { getTechnologyIconUrl } from '../../lessons/iconify';

	let { category, lessonCount }: { category: string; lessonCount: number } = $props();

	const displayCategory = $derived(category.charAt(0).toUpperCase() + category.slice(1));

	const iconUrl = $derived.by(() => {
		return getTechnologyIconUrl(category);
	});

	const initials = $derived.by(() => {
		if (iconUrl) return null;
		const words = category.split(/[\s-]/);
		if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
		return category.substring(0, 2).toUpperCase();
	});
</script>

<div
	class="bg-white rounded-2xl flex flex-col items-center justify-start relative w-full max-w-full min-h-[220px] shadow-md overflow-hidden text-center transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1.5 hover:shadow-lg active:-translate-y-0.5"
	role="button"
	tabindex="0"
>
	<div class="flex flex-col items-center w-full h-full p-7 gap-4 overflow-hidden box-border">
		<div class="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
			{#if iconUrl}
				<img src={iconUrl} alt={category} class="w-full h-full object-contain" />
			{:else if initials}
				<span class="text-2xl font-semibold tracking-wide text-gray-700">{initials}</span>
			{:else}
				<span class="text-4xl">📁</span>
			{/if}
		</div>

		<h2 class="text-xl m-0 font-semibold tracking-tight text-gray-900 w-full overflow-hidden text-ellipsis whitespace-nowrap">
			{displayCategory}
		</h2>

		<div class="mt-auto text-sm text-gray-500">
			{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
		</div>
	</div>
</div>
