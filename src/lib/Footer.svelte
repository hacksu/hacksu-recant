<script lang="ts">
	import discordIcon from '$lib/assets/images/logos/discord.svg';
	import instagramIcon from '$lib/assets/images/logos/instagram.svg';
	import githubIcon from '$lib/assets/images/logos/github.svg';

	// Social media links
	const socialLinks = [
		{
			name: 'Instagram',
			href: 'https://www.instagram.com/hacksu/'
		},
		{
			name: 'GitHub',
			href: 'https://github.com/hacksu'
		},
		{
			name: 'Discord',
			href: 'https://discord.gg/rJDdvnt'
		}
	];
</script>

<footer class="w-full bg-hacksu-grey py-8 px-4">
	<div class="max-w-7xl mx-auto flex items-center justify-center gap-6">
		{#each socialLinks as link}
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				class="text-white hover:text-hacksu-green transition-colors duration-200"
				aria-label={link.name}
			>
				{#if link.name === 'Instagram'}
					<img src={instagramIcon} alt="Discord" class="w-8 h-8 icon-white" />
				{:else if link.name === 'GitHub'}
					<img src={githubIcon} alt="Discord" class="w-8 h-8 icon-white" />
				{:else if link.name === 'Discord'}
					<img src={discordIcon} alt="Discord" class="w-8 h-8 icon-white" />
				{/if}
			</a>
		{/each}
	</div>
</footer>

<style>
	.icon-white {
		filter: brightness(0) invert(1);
	}
</style>
