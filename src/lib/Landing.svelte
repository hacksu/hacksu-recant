<script lang="ts">
	import hacksuLogo from '$lib/assets/images/hacksu_logo.svg';
	import MeetingCard from '$lib/components/MeetingCard.svelte';
	import { onMount, onDestroy } from 'svelte';

	type Meeting = {
		id: string;
		title: string;
		date: Date | string;
		presenter: string | null;
		link: string | null;
		descriptionMD: string | null;
		photo: string | null;
	};

	export let nextMeeting: Meeting | null = null;

	// Social media links - you can add more here
	const social = [
		{
			title: 'GitHub',
			link: 'https://github.com/hacksu',
			img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDBDNS4zNzQgMCAwIDUuMzczIDAgMTJjMCA1LjMwMiAzLjQzOCA5LjggOC4yMDcgMTEuMzg3LjU5OS4xMTEuNzkzLS4yNjEuNzkzLS41Nzd2LTIuMjM0Yy0zLjMzOC43MjYtNC4wMzMtMS40MTYtNC4wMzMtMS40MTYtLjU0Ni0xLjM4Ny0xLjMzMy0xLjc1Ni0xLjMzMy0xLjc1Ni0xLjA4OS0uNzQ1LjA4My0uNzI5LjA4My0uNzI5IDEuMjA1LjA4NCAxLjgzOSAxLjIzNyAxLjgzOSAxLjIzNyAxLjA3IDEuODM0IDIuODA3IDEuMzA0IDMuNDkyLjk5Ny4xMDctLjc3NS40MTgtMS4zMDUuNzYyLTEuNjA0LTIuNjY1LS4zMDUtNS40NjctMS4zMzQtNS40NjctNS45MzEgMC0xLjMxMS40NjktMi4zODEgMS4yMzYtMy4yMjEtLjEyNC0uMzAzLS41MzUtMS41MjQuMTE3LTMuMTc2IDAgMCAxLjAwOC0uMzIyIDMuMzAxIDEuMjMuOTU3LS4yNjYgMS45ODMtLjM5OSAzLjAwMy0uNDA0IDEuMDIuMDA1IDIuMDQ3LjEzOCAzLjAwNi40MDQgMi4yOTEtMS41NTIgMy4yOTctMS4yMyAzLjI5Ny0xLjIzLjY1MyAxLjY1My4yNDIgMi44NzQuMTE4IDMuMTc2Ljc3Ljg0IDEuMjM1IDEuOTExIDEuMjM1IDMuMjIxIDAgNC42MDktMi44MDcgNS42MjQtNS40NzkgNS45MjEuNDMuMzcyLjgyMyAxLjEwMi44MjMgMi4yMjJ2My4yOTNjMCAuMzE5LjE5Mi42OTQuODAxLjU3NiA0Ljc2NS0xLjU4OSA4LjE5OS02LjA4NiA4LjE5OS0xMS4zODYgMC02LjYyNy01LjM3My0xMi0xMi0xMnoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
		}
		// Add more social links here if needed
	];

	const title = 'Learn. Grow. Create.';
	const body = 'HacKSU teaches anyone, regardless of skill level or major, how to code.';

	// Particle network visualization
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationFrame: number;
	let particles: Array<{ x: number; y: number; vx: number; vy: number }> = [];
	const particleCount = 90;
	const connectionDistance = 150;

	function initParticles() {
		if (typeof window === 'undefined' || !canvas) return;
		ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		particles = Array.from({ length: particleCount }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			vx: (Math.random() - 0.5) * 0.5,
			vy: (Math.random() - 0.5) * 0.5
		}));

		animate();
	}

	function animate() {
		if (!ctx || !canvas) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = 'rgba(53, 201, 130, 0.85)';
		ctx.lineWidth = 1;

		// Update and draw particles
		for (let i = 0; i < particles.length; i++) {
			const p = particles[i];

			// Update position
			p.x += p.vx;
			p.y += p.vy;

			// Bounce off edges
			if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
			if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

			// Keep in bounds
			p.x = Math.max(0, Math.min(canvas.width, p.x));
			p.y = Math.max(0, Math.min(canvas.height, p.y));

			// Draw connections
			for (let j = i + 1; j < particles.length; j++) {
				const p2 = particles[j];
				const dx = p.x - p2.x;
				const dy = p.y - p2.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < connectionDistance) {
					const opacity = (1 - distance / connectionDistance) * 0.95;
					ctx.strokeStyle = `rgba(53, 201, 130, ${opacity})`;
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(p2.x, p2.y);
					ctx.stroke();
				}
			}

			ctx.fillStyle = 'rgba(53, 201, 130, 0.9)';
			ctx.beginPath();
			ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
			ctx.fill();
		}

		animationFrame = requestAnimationFrame(animate);
	}

	function handleResize() {
		if (typeof window === 'undefined' || !canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	onMount(() => {
		if (typeof window === 'undefined') return;
		initParticles();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		if (animationFrame) cancelAnimationFrame(animationFrame);
		window.removeEventListener('resize', handleResize);
	});
</script>

<div class="w-full min-h-screen relative">
	<canvas bind:this={canvas} class="pointer-events-none absolute top-0 left-0 z-0 h-full w-full"
	></canvas>

	<!-- Social buttons -->
	<div
		class="absolute w-[10vh] right-[30px] bottom-[30px] bg-transparent opacity-25 z-10 hidden md:block"
	>
		{#each social as item, index}
			<a
				href={item.link}
				target="_blank"
				rel="noopener noreferrer"
				title={item.title}
				class="block relative"
				style="top: -{index * 10}vh;"
			>
				<img
					src={item.img}
					alt={item.title}
					class="w-[10vh] mt-5 transition-opacity hover:opacity-70"
				/>
			</a>
		{/each}
	</div>

	<!-- Main content -->
	<div
		class="relative text-white pt-[10vh] pb-[6vh] flex flex-col min-h-screen justify-center items-center z-10"
	>
		<img class="w-[40vw] max-w-[400px] md:w-[75vw]" src={hacksuLogo} alt="HacKSU" />
		<h1 class="text-[4vh] mt-[15px] mb-3 text-center"><strong>{title}</strong></h1>
		<p class="text-center text-[3vh] w-[90vw] my-2.5">{body}</p>
		{#if nextMeeting}
			<div class="max-w-[95vw] w-full mx-auto mb-4 [&>div]:!mt-0 [&>div]:!mb-0">
				<MeetingCard meeting={nextMeeting} solo={true} />
			</div>

			<div class="flex items-center gap-3 mb-4">
				<a
					href="https://discord.gg/r8vVvsE"
					target="_blank"
					rel="noopener noreferrer"
					class="bg-hacksu-blue hover:bg-hacksu-blue/90 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
				>
					Join our Discord
				</a>
				<a
					href="https://www.redbubble.com/people/KentStateCS/shop"
					target="_blank"
					rel="noopener noreferrer"
					class="bg-hacksu-green hover:bg-hacksu-green/90 text-hacksu-grey font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
				>
					Check Out Our Merch!
				</a>
			</div>
		{:else}
			<p class="opacity-80 text-center text-[3vh] w-[90vw] my-2.5">Join our Discord for updates:</p>

			<!-- Discord invite card -->
			<div class="mb-10 max-w-[95vw] mx-auto">
				<div
					class="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 max-w-md hover:border-hacksu-green/50 transition-colors"
				>
					<div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
						<img src={hacksuLogo} alt="HacKSU" class="w-12 h-12" />
					</div>
					<div class="flex-1 min-w-0">
						<h3 class="text-white font-semibold text-lg mb-1">HacKSU</h3>
						<div class="flex items-center gap-4 text-sm text-gray-400">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-hacksu-green rounded-full"></div>
								<span>100+ Online</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-gray-500 rounded-full"></div>
								<span>800+ Members</span>
							</div>
						</div>
					</div>
					<a
						href="https://discord.gg/r8vVvsE"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-hacksu-blue hover:bg-hacksu-blue/90 text-white font-semibold px-6 py-2 rounded transition-colors flex-shrink-0"
					>
						Join
					</a>
				</div>
			</div>

			<a
				href="https://www.redbubble.com/people/KentStateCS/shop"
				target="_blank"
				rel="noopener noreferrer"
				class="w-[60vw] max-w-[40vh] rounded-lg bg-hacksu-green px-8 py-4 text-center text-[3vh] font-bold text-hacksu-grey no-underline transition-colors hover:bg-hacksu-green/90"
			>
				Check Out Our Merch!
			</a>
		{/if}
	</div>
</div>
