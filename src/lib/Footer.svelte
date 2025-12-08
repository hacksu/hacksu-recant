<script lang="ts">
	import discordIcon from '$lib/assets/images/logos/discord.svg';
	import instagramIcon from '$lib/assets/images/logos/instagram.svg';
	import githubIcon from '$lib/assets/images/logos/github.svg';

	// Social media links
	const socialLinks = [
		{
			name: 'Instagram',
			href: 'https://www.instagram.com/hacksu/',
            icon: instagramIcon,

		},
		{
			name: 'GitHub',
			href: 'https://github.com/hacksu',
            icon: githubIcon,
		},
		{
			name: 'Discord',
			href: 'https://discord.gg/rJDdvnt',
            icon: discordIcon,
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
					<img src={link.icon} alt={link.name} class="w-8 h-8 icon-white" />
			</a>
		{/each}
	</div>
</footer>

<style>
	.icon-white {
		filter: brightness(0) invert(1);
	}
</style>
