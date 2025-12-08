<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const readme = $derived(data.readme);
	const repoName = $derived(data.repoName);
	const error = $derived(data.error);
const repoUrl = $derived(`https://github.com/hacksu/${repoName}`);

	function goBack() {
		goto('/lessons');
	}
</script>

<div class="lesson-detail-page">
	<div class="lesson-detail-container">
		<button class="back-button" onclick={goBack}>← Back to Lessons</button>

		{#if error}
			<div class="error-state">
				<h1>Error Loading Lesson</h1>
				<p>{error}</p>
				<button class="retry-button" onclick={goBack}>Go Back</button>
			</div>
		{:else if !readme}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading lesson content...</p>
			</div>
		{:else}
			<div class="lesson-content">
				<div class="lesson-header">
					<h1 class="lesson-title">{repoName}</h1>
					<a class="github-link" href={repoUrl} target="_blank" rel="noopener noreferrer">
						View on GitHub →
					</a>
				</div>
				<pre class="readme-content">{readme}</pre>
			</div>
		{/if}
	</div>
</div>

<style>
	.lesson-detail-page {
		background: linear-gradient(to top left, #35c982, #4683ff);
		min-height: 100vh;
		padding: 2rem;
	}

	.lesson-detail-container {
		max-width: 900px;
		margin: 0 auto;
	}

	.back-button {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		color: white;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		backdrop-filter: blur(10px);
		margin-bottom: 2rem;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateX(-3px);
	}

	.lesson-content {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 15px;
		padding: 3rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.lesson-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.lesson-title {
		font-size: 2.5rem;
		font-weight: bold;
		margin: 0 0 2rem 0;
		color: #142027;
		text-transform: capitalize;
	}

	.github-link {
		color: #4683ff;
		font-weight: 700;
		text-decoration: none;
		border: 1px solid rgba(70, 131, 255, 0.2);
		padding: 0.5rem 0.85rem;
		border-radius: 10px;
		background: rgba(70, 131, 255, 0.08);
		transition: all 0.2s ease;
	}

	.github-link:hover {
		background: rgba(70, 131, 255, 0.14);
		border-color: rgba(70, 131, 255, 0.35);
		transform: translateY(-1px);
	}

	.readme-content {
		color: #333;
		line-height: 1.6;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		white-space: pre-wrap;
		word-wrap: break-word;
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		overflow-x: auto;
		max-height: 70vh;
		overflow-y: auto;
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		color: white;
		text-align: center;
	}

	.error-state h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.error-state p {
		font-size: 1.125rem;
		margin-bottom: 1.5rem;
	}

	.retry-button {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		color: white;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.retry-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.lesson-detail-page {
			padding: 1rem;
		}

		.lesson-content {
			padding: 1.5rem;
		}

		.lesson-title {
			font-size: 2rem;
		}
	}
</style>

