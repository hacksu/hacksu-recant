<script lang="ts">
	type Information = {
		id: string;
		title: string;
		link: string | null;
		description: string; // raw markdown/plaintext
		photo: string | null;
	};

	let { information }: { information: Information } = $props();
</script>

<div class="information-container">
	{#if information.photo}
		<div class="information-photo">
			<img class="information-image" src={information.photo} alt={information.title} />
		</div>
	{/if}

	<div class="information">
		<component
			this={information.link ? 'a' : 'span'}
			href={information.link ?? undefined}
			target={information.link ? '_blank' : undefined}
			rel={information.link ? 'noopener noreferrer' : undefined}
			class="information-title"
		>
			{#if information.link}
				<svg
					class="external-link"
					style="height: 26px; margin-right: 10px"
					viewBox="0 0 24 24"
					fill="white"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"
						stroke="white"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
					/>
				</svg>
			{/if}
			<h2>{information.title}</h2>
		</component>

		<p class="information-text">{information.description}</p>
	</div>
</div>

<style>
	.information-container {
		background: linear-gradient(
			90deg,
			#9b4cbb 0%,
			#9d4db9 24%,
			#a14ec2 32%,
			#ab52cb 100%
		);
		opacity: 0.975;
		border-radius: 15px;
		display: flex;
		flex-direction: row-reverse;
		justify-content: flex-start;
		margin: 0 auto 40px auto;
		max-width: 1000px;
		box-shadow: 4px 6px 4px rgba(0, 0, 0, 0.15);
		padding-bottom: 0;
		overflow: hidden;
		text-align: left;
		min-height: 0;
		flex-shrink: 1;
	}

	.information-container:first-of-type {
		margin-top: 50px;
	}

	.information {
		display: flex;
		flex-direction: column;
		min-height: 0;
		flex-shrink: 1;
		min-width: 60%;
		font-size: 1rem;
	}

	.information > * {
		padding: 0 24px;
	}

	.information a,
	.information a:visited {
		color: white;
		text-decoration: none;
	}

	.information h2 {
		display: inline;
		font-size: 1.5rem;
		margin: 0;
		color: white;
	}

	.information-photo {
		max-width: 40%;
		height: auto;
	}

	.information-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.information-title {
		margin: 12px 0 8px;
		display: flex;
		align-items: center;
		color: white;
	}

	.information-text {
		scrollbar-width: thin;
		min-height: 0;
		flex-shrink: 1;
		color: white;
		line-height: 1.6;
	}

	.information-text::-webkit-scrollbar {
		width: 6px;
	}

	.external-link {
		margin-right: 10px;
	}

	strong {
		font-weight: 600;
	}
</style>
