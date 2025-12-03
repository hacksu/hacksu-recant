<script lang="ts">
	import hacksuLogo from '$lib/assets/hacksu_logo.svg';
	import { page } from '$app/stores';

	const pageStore = $derived($page);
	const isAdmin = $derived(Boolean(pageStore.data?.isAdmin));
</script>

<nav class="border-b border-gray-700/50 bg-hacksu-grey/80 backdrop-blur-sm">
	<div class="mx-auto max-w-5xl px-4">
		<div class="flex h-16 items-center justify-between">
			<div class="w-32 flex justify-start">
				<a href="/" class="text-sm font-medium text-white/80 hover:text-white transition-colors">
					Home
				</a>
			</div>

			<a href="/" class="flex items-center justify-center">
				<img src={hacksuLogo} alt="Hacksu" class="h-10 w-auto" />
			</a>

			<div class="w-32 flex justify-end gap-4 text-sm">
				{#if isAdmin}
					<a
						href="/admin"
						class="font-medium text-white/80 hover:text-white transition-colors"
					>
						Admin
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
