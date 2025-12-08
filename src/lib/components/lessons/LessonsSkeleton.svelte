<script lang="ts">
	// Skeleton loader for the lessons page
</script>

<div class="lessons-page">
	<div class="lessons-container">
		<h1 class="page-title skeleton-title">HacKSU Lessons</h1>
		<p class="subtitle skeleton-subtitle">Loading lessons...</p>

		<!-- Search bar skeleton -->
		<div class="search-skeleton">
			<div class="skeleton-search-bar"></div>
		</div>


		<div class="skeleton-grid">
			{#each Array(5) as _}
				<div class="skeleton-card">
					<div class="skeleton-card-header">
						<div class="skeleton-line skeleton-title-line"></div>
						<div class="skeleton-badge"></div>
					</div>
					<div class="skeleton-line skeleton-description-line"></div>
					<div class="skeleton-line skeleton-description-line-short"></div>
					<div class="skeleton-card-footer">
						<div class="skeleton-line skeleton-footer-line"></div>
						<div class="skeleton-line skeleton-footer-line-short"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.lessons-page {
		background: linear-gradient(to top left, #35c982, #4683ff);
		min-height: 100vh;
		padding: 2rem;
	}

	.lessons-container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.skeleton-title {
		text-align: center;
		color: white;
		font-size: 3rem;
		font-weight: bold;
		margin: 2rem 0 1rem;
		opacity: 0.9;
	}

	.skeleton-subtitle {
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.25rem;
		margin-bottom: 2rem;
	}

	.search-skeleton {
		width: 100%;
		max-width: 600px;
		margin: 0 auto 2rem;
	}

	.skeleton-search-bar {
		width: 100%;
		height: 3.5rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.skeleton-card {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 15px;
		padding: 1.5rem;
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.skeleton-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.skeleton-title-line {
		height: 1.5rem;
		width: 60%;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-badge {
		height: 1.75rem;
		width: 60px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		animation: pulse 1.5s ease-in-out infinite;
		animation-delay: 0.1s;
	}

	.skeleton-line {
		height: 1rem;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 4px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-description-line {
		width: 100%;
		animation-delay: 0.2s;
	}

	.skeleton-description-line-short {
		width: 75%;
		animation-delay: 0.3s;
	}

	.skeleton-card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.skeleton-footer-line {
		width: 100px;
		height: 0.875rem;
		animation-delay: 0.4s;
	}

	.skeleton-footer-line-short {
		width: 80px;
		height: 0.875rem;
		animation-delay: 0.5s;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@media (max-width: 768px) {
		.lessons-page {
			padding: 1rem;
		}

		.skeleton-title {
			font-size: 2rem;
		}

		.skeleton-grid {
			grid-template-columns: 1fr;
		}
	}
</style>


