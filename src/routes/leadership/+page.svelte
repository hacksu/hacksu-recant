<script lang="ts">
	import type { PageData } from './$types';
	import favicon from '$lib/assets/images/favicon.svg';

	let { data }: { data: PageData } = $props();

	const currentLeaders = $derived(data.currentLeaders);
	const leadersByTerm = $derived(data.leadersByTerm);
	const sortedTerms = $derived(data.sortedTerms);

	function getPhotoUrl(leader: (typeof data.currentLeaders)[0]): string {
		if (leader.photo) {
			return leader.photo;
		}
		if (leader.github) {
			return `https://github.com/${leader.github}.png`;
		}
		return favicon;
	}

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		target.src = favicon;
	}

	function getLink(leader: (typeof data.currentLeaders)[0]): string | null {
		if (leader.link) return leader.link;
		if (leader.github) return `https://github.com/${leader.github}`;
		return null;
	}
</script>

<div class="min-h-screen">
	<div class="container mx-auto max-w-7xl px-4 py-16">
		<header class="mb-14 text-center">
			<h1 class="text-4xl font-bold text-white md:text-5xl">Leaders &amp; Alumni</h1>
		</header>

		<!-- Current Leadership -->
		{#if currentLeaders.length > 0}
			<div class="mb-16">
				<h2 class="mb-8 text-2xl font-bold text-white md:text-3xl">Current Leadership</h2>
				<div
					class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8"
				>
					{#each currentLeaders as leader}
						<div class="flex flex-col items-center text-center">
							{#if getLink(leader)}
								<a href={getLink(leader)} target="_blank" rel="noopener noreferrer">
									<img
										src={getPhotoUrl(leader)}
										alt={leader.name}
										class="mb-4 h-24 w-24 rounded-full border-2 border-white/10 object-cover transition-opacity hover:opacity-80"
										onerror={handleImageError}
									/>
								</a>
							{:else}
								<img
									src={getPhotoUrl(leader)}
									alt={leader.name}
									class="mb-4 h-24 w-24 rounded-full border-2 border-white/10 object-cover"
									onerror={handleImageError}
								/>
							{/if}
							<h3 class="mb-2 text-lg font-semibold text-white">
								{leader.name}
							</h3>
							<div class="flex flex-col gap-1">
								{#each leader.titles as title}
									<span class="text-sm text-white/60">{title}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Past Leadership by Term -->
		{#if sortedTerms.length > 0}
			<div>
				{#each sortedTerms as term}
					<div class="mb-12">
						<h2 class="mb-6 text-2xl font-bold text-white md:text-3xl">
							{term}
						</h2>
						<div
							class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8"
						>
							{#each leadersByTerm[term] as leader}
								<div class="flex flex-col items-center text-center">
									{#if getLink(leader)}
										<a href={getLink(leader)} target="_blank" rel="noopener noreferrer">
											<img
												src={getPhotoUrl(leader)}
												alt={leader.name}
												class="mb-4 h-24 w-24 rounded-full border-2 border-white/10 object-cover transition-opacity hover:opacity-80"
												onerror={handleImageError}
											/>
										</a>
									{:else}
										<img
											src={getPhotoUrl(leader)}
											alt={leader.name}
											class="mb-4 h-24 w-24 rounded-full border-2 border-white/10 object-cover"
											onerror={handleImageError}
										/>
									{/if}
									<h3 class="mb-2 text-lg font-semibold text-white">
										{leader.name}
									</h3>
									<div class="flex flex-col gap-1">
										{#each leader.titles as title}
											<span class="text-sm text-white/60">{title}</span>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Empty State -->
		{#if currentLeaders.length === 0 && sortedTerms.length === 0}
			<div class="text-center py-12">
				<p class="text-white/60">No leadership information available yet.</p>
			</div>
		{/if}
	</div>
</div>
