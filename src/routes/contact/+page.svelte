<script lang="ts">
	import discordIcon from '$lib/assets/images/logos/discord.svg';
	import mailIcon from '$lib/assets/images/logos/mail.svg';
	import githubIcon from '$lib/assets/images/logos/github.svg';

	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let isSubmitting = $state(false);
	let submitStatus = $state<'idle' | 'success' | 'error'>('idle');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSubmitting = true;
		submitStatus = 'idle';

		// TODO: Implement form submission logic
		// For now, just simulate a submission
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			submitStatus = 'success';
			// Reset form
			name = '';
			email = '';
			subject = '';
			message = '';
		} catch (error) {
			submitStatus = 'error';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="min-h-screen px-5 py-16">
	<header class="mx-auto mb-12 max-w-2xl text-center">
		<h1 class="text-4xl font-bold text-white md:text-5xl">Get In Touch</h1>
	</header>

	<div class="mx-auto mb-16 grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
		<div
			class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-hacksu-blue/70"
		>
			<div
				class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-hacksu-blue"
			>
				<img src={mailIcon} alt="Email" class="h-10 w-10 brightness-0 invert" />
			</div>
			<h2 class="mb-3 text-2xl font-bold text-white">Email Us</h2>
			<p class="mb-5 text-sm leading-relaxed text-white/70 md:text-base">
				Send us an email and we&apos;ll get back to you within 24 hours.
			</p>
			<a
				href="mailto:staff@khe.io"
				class="font-medium text-hacksu-blue no-underline transition-colors hover:text-hacksu-green hover:underline"
			>
				staff@khe.io
			</a>
		</div>

		<div
			class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-hacksu-green/70"
		>
			<div
				class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-hacksu-green"
			>
				<img src={discordIcon} alt="Discord" class="h-10 w-10 brightness-0" />
			</div>
			<h2 class="mb-3 text-2xl font-bold text-white">Join Our Discord</h2>
			<p class="mb-5 text-sm leading-relaxed text-white/70 md:text-base">
				Get instant help and connect with our community.
			</p>
			<a
				href="/r/discord"
				target="_blank"
				rel="noopener noreferrer"
				class="font-medium text-hacksu-blue no-underline transition-colors hover:text-hacksu-green hover:underline"
			>
				Join Discord Server
			</a>
		</div>

		<div
			class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-hacksu-blue/70"
		>
			<div
				class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-hacksu-blue"
			>
				<img src={githubIcon} alt="GitHub" class="h-10 w-10 brightness-0 invert" />
			</div>
			<h2 class="mb-3 text-2xl font-bold text-white">Follow Us</h2>
			<p class="mb-5 text-sm leading-relaxed text-white/70 md:text-base">
				Check out our projects and contributions.
			</p>
			<a
				href="https://github.com/hacksu"
				target="_blank"
				rel="noopener noreferrer"
				class="font-medium text-hacksu-blue no-underline transition-colors hover:text-hacksu-green hover:underline"
			>
				GitHub
			</a>
		</div>
	</div>

	<div class="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12">
		<h2 class="mb-10 text-center text-2xl font-bold text-white md:text-3xl">Send us a Message</h2>
		<form onsubmit={handleSubmit} class="flex flex-col gap-6">
			<div class="flex flex-col gap-2">
				<label for="name" class="text-sm font-medium text-white/70">Your Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					bind:value={name}
					class="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-hacksu-blue focus:outline-none"
					placeholder="Enter your name"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="email" class="text-sm font-medium text-white/70">Your Email</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					bind:value={email}
					class="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-hacksu-blue focus:outline-none"
					placeholder="Enter your email"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="subject" class="text-sm font-medium text-white/70">Subject</label>
				<input
					type="text"
					id="subject"
					name="subject"
					required
					bind:value={subject}
					class="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-hacksu-blue focus:outline-none"
					placeholder="Enter subject"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="message" class="text-sm font-medium text-white/70">Message</label>
				<textarea
					id="message"
					name="message"
					required
					bind:value={message}
					class="min-h-[120px] resize-y rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-hacksu-blue focus:outline-none"
					rows="6"
					placeholder="Enter your message"
				></textarea>
			</div>

			{#if submitStatus === 'success'}
				<div
					class="rounded-lg border border-hacksu-green/30 bg-hacksu-green/15 px-4 py-3 text-center font-medium text-hacksu-green"
				>
					Message sent successfully!
				</div>
			{:else if submitStatus === 'error'}
				<div
					class="rounded-lg border border-red-400/30 bg-red-400/15 px-4 py-3 text-center font-medium text-red-200"
				>
					Failed to send message. Please try again.
				</div>
			{/if}

			<button
				type="submit"
				disabled={isSubmitting}
				class="mt-2.5 self-center rounded-lg bg-hacksu-blue px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-hacksu-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isSubmitting ? 'Sending...' : 'Send Message'}
			</button>
		</form>
	</div>
</div>
