<script lang="ts">
	import hacksuLogo from '$lib/assets/hacksu_logo.svg';

	// Social media links - you can add more here
	const social = [
		{
			title: 'GitHub',
			link: 'https://github.com/hacksu',
			img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDBDNS4zNzQgMCAwIDUuMzczIDAgMTJjMCA1LjMwMiAzLjQzOCA5LjggOC4yMDcgMTEuMzg3LjU5OS4xMTEuNzkzLS4yNjEuNzkzLS41Nzd2LTIuMjM0Yy0zLjMzOC43MjYtNC4wMzMtMS40MTYtNC4wMzMtMS40MTYtLjU0Ni0xLjM4Ny0xLjMzMy0xLjc1Ni0xLjMzMy0xLjc1Ni0xLjA4OS0uNzQ1LjA4My0uNzI5LjA4My0uNzI5IDEuMjA1LjA4NCAxLjgzOSAxLjIzNyAxLjgzOSAxLjIzNyAxLjA3IDEuODM0IDIuODA3IDEuMzA0IDMuNDkyLjk5Ny4xMDctLjc3NS40MTgtMS4zMDUuNzYyLTEuNjA0LTIuNjY1LS4zMDUtNS40NjctMS4zMzQtNS40NjctNS45MzEgMC0xLjMxMS40NjktMi4zODEgMS4yMzYtMy4yMjEtLjEyNC0uMzAzLS41MzUtMS41MjQuMTE3LTMuMTc2IDAgMCAxLjAwOC0uMzIyIDMuMzAxIDEuMjMuOTU3LS4yNjYgMS45ODMtLjM5OSAzLjAwMy0uNDA0IDEuMDIuMDA1IDIuMDQ3LjEzOCAzLjAwNi40MDQgMi4yOTEtMS41NTIgMy4yOTctMS4yMyAzLjI5Ny0xLjIzLjY1MyAxLjY1My4yNDIgMi44NzQuMTE4IDMuMTc2Ljc3Ljg0IDEuMjM1IDEuOTExIDEuMjM1IDMuMjIxIDAgNC42MDktMi44MDcgNS42MjQtNS40NzkgNS45MjEuNDMuMzcyLjgyMyAxLjEwMi44MjMgMi4yMjJ2My4yOTNjMCAuMzE5LjE5Mi42OTQuODAxLjU3NiA0Ljc2NS0xLjU4OSA4LjE5OS02LjA4NiA4LjE5OS0xMS4zODYgMC02LjYyNy01LjM3My0xMi0xMi0xMnoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
		},
		// Add more social links here if needed
	];

	const title = 'Learn. Grow. Create.';
	const body = 'HackSU teaches anyone, regardless of skill level or major, how to code.';
</script>

<div class="w-full h-screen overflow-hidden relative">
	<!-- Background -->
	<div class="absolute -z-20 top-0 left-0 h-screen w-screen bg-hacksu-grey"></div>

	<!-- Background boxes -->
	<div
		class="absolute w-[40svh] max-w-[50vw] h-[40svh] max-h-[50vw] -z-10 bg-contain bg-no-repeat opacity-20 left-0 bottom-0 border-2 border-hacksu-green rounded-lg -rotate-12"
	></div>
	<div
		class="absolute w-[40svh] max-w-[50vw] h-[40svh] max-h-[50vw] -z-10 bg-contain bg-no-repeat opacity-20 right-0 top-0 rotate-90 border-2 border-hacksu-purple rounded-lg"
	></div>

	<!-- Social buttons -->
	<div class="absolute w-[10vh] right-[30px] bottom-[30px] bg-transparent opacity-25 z-10 hidden md:block">
		{#each social as item, index}
			<a
				href={item.link}
				target="_blank"
				rel="noopener noreferrer"
				title={item.title}
				class="block relative"
				style="top: -{index * 10}vh;"
			>
				<img src={item.img} alt={item.title} class="w-[10vh] mt-5 transition-opacity hover:opacity-70" />
			</a>
		{/each}
	</div>

	<!-- Main content -->
	<div
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pt-[10vh] flex flex-col h-screen justify-center items-center z-10"
	>
		<img class="w-[40vw] max-w-[400px] md:w-[75vw]" src={hacksuLogo} alt="HackSU" />
		<h1 class="text-[4vh] my-[15px] text-center"><strong>{title}</strong></h1>
		<p class="text-center text-[3vh] w-[90vw] my-2.5">{body}</p>
		<p class="opacity-80 text-center text-[3vh] w-[90vw] my-2.5">Join our Discord for updates:</p>

		<!-- Discord invite card -->
		<div class="mb-10 max-w-[95vw] mx-auto">
			<div
				class="bg-gray-800 rounded-lg p-4 flex items-center gap-4 border border-gray-700 max-w-md hover:border-hacksu-green/50 transition-colors"
			>
				<div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
					<img src={hacksuLogo} alt="HackSU" class="w-12 h-12" />
				</div>
				<div class="flex-1 min-w-0">
					<h3 class="text-white font-semibold text-lg mb-1">HackSU</h3>
					<div class="flex items-center gap-4 text-sm text-gray-400">
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 bg-hacksu-green rounded-full"></div>
							<span>100+ Online</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 bg-gray-500 rounded-full"></div>
							<span>700+ Members</span>
						</div>
					</div>
				</div>
				<a
					href="https://discord.gg/r8vVvsE"
					target="_blank"
					rel="noopener noreferrer"
					class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold px-6 py-2 rounded transition-colors flex-shrink-0"
				>
					Join
				</a>
			</div>
		</div>

		<button
			class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-bold text-lg px-8 py-4 rounded-lg transition-colors cursor-pointer w-[60vw] max-w-[40vh] text-[3vh]"
		>
			<a
				href="https://www.redbubble.com/people/KentStateCS/shop"
				target="_blank"
				rel="noopener noreferrer"
				class="no-underline text-white"
			>
				Check Out Our Merch!
			</a>
		</button>
	</div>
</div>
