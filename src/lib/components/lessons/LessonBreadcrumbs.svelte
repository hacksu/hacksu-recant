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

<nav class="breadcrumbs">
	<button class="breadcrumb-item" onclick={() => navigateToPath(-1)}>Lessons</button>
	{#each path as segment, index}
		<span class="breadcrumb-separator">/</span>
		<button
			class="breadcrumb-item"
			class:current={index === path.length - 1}
			onclick={() => navigateToPath(index)}
		>
			{segment.charAt(0).toUpperCase() + segment.slice(1)}
		</button>
	{/each}
</nav>

<style>
	.breadcrumbs {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.breadcrumb-item {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: 0.5rem 1rem;
		color: white;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		text-transform: capitalize;
		border: none;
	}

	.breadcrumb-item:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
	}

	.breadcrumb-item.current {
		background: rgba(255, 255, 255, 0.2);
		font-weight: bold;
		cursor: default;
	}

	.breadcrumb-item.current:hover {
		transform: none;
	}

	.breadcrumb-separator {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
	}
</style>


