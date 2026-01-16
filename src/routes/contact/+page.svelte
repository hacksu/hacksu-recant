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

<div class="min-h-screen bg-gray-50">
	<!-- Top Section with Wavy Background -->
	<div class="relative py-20 px-5 md:px-5 md:py-20 overflow-hidden">
		<div
			class="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-br from-hacksu-blue to-hacksu-green z-0"
			style="clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%)"
		></div>
		<div class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 mt-10">
			<!-- Email Card -->
			<div
				class="bg-white rounded-2xl p-8 md:p-10 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
			>
				<div class="w-20 h-20 rounded-full bg-hacksu-blue flex items-center justify-center mx-auto mb-5">
					<img src={mailIcon} alt="Email" class="w-10 h-10" />
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-3">Email Us</h3>
				<p class="text-gray-600 text-sm md:text-base leading-relaxed mb-5">
					Send us an email and we'll get back to you within 24 hours
				</p>
				<a
					href="mailto:hacksu@cs.kent.edu"
					class="text-hacksu-blue no-underline font-medium transition-colors hover:text-hacksu-green hover:underline"
				>
					hacksu@cs.kent.edu
				</a>
			</div>

			<!-- Discord Card -->
			<div
				class="bg-white rounded-2xl p-8 md:p-10 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
			>
				<div class="w-20 h-20 rounded-full bg-hacksu-blue flex items-center justify-center mx-auto mb-5">
					<img src={discordIcon} alt="Discord" class="w-10 h-10" />
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-3">Join Our Discord</h3>
				<p class="text-gray-600 text-sm md:text-base leading-relaxed mb-5">
					Get instant help and connect with our community
				</p>
				<a
					href="/r/discord"
					target="_blank"
					rel="noopener noreferrer"
					class="text-hacksu-blue no-underline font-medium transition-colors hover:text-hacksu-green hover:underline"
				>
					Join Discord Server
				</a>
			</div>

			<!-- GitHub Card -->
			<div
				class="bg-white rounded-2xl p-8 md:p-10 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
			>
				<div class="w-20 h-20 rounded-full bg-hacksu-blue flex items-center justify-center mx-auto mb-5">
					<img src={githubIcon} alt="Github" class="w-10 h-10" />
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-3">Follow Us</h3>
				<p class="text-gray-600 text-sm md:text-base leading-relaxed mb-5">
					Check out our projects and contributions
				</p>
				<a
					href="https://github.com/hacksu"
					target="_blank"
					rel="noopener noreferrer"
					class="text-hacksu-blue no-underline font-medium transition-colors hover:text-hacksu-green hover:underline"
				>
					GitHub
				</a>
			</div>
		</div>
	</div>

	<!-- Contact Form Section -->
	<div class="py-16 md:py-20 px-5 max-w-4xl mx-auto">
		<div class="bg-white rounded-2xl p-8 md:p-12 shadow-md">
			<h2 class="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">Send us a Message</h2>
			<form onsubmit={handleSubmit} class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<label for="name" class="font-medium text-gray-900 text-sm">Your Name</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						bind:value={name}
						class="px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:border-hacksu-blue focus:outline-none"
						placeholder="Enter your name"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label for="email" class="font-medium text-gray-900 text-sm">Your Email</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						bind:value={email}
						class="px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:border-hacksu-blue focus:outline-none"
						placeholder="Enter your email"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label for="subject" class="font-medium text-gray-900 text-sm">Subject</label>
					<input
						type="text"
						id="subject"
						name="subject"
						required
						bind:value={subject}
						class="px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:border-hacksu-blue focus:outline-none"
						placeholder="Enter subject"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label for="message" class="font-medium text-gray-900 text-sm">Message</label>
					<textarea
						id="message"
						name="message"
						required
						bind:value={message}
						class="px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:border-hacksu-blue focus:outline-none resize-y min-h-[120px]"
						rows="6"
						placeholder="Enter your message"
					></textarea>
				</div>

				{#if submitStatus === 'success'}
					<div class="px-4 py-3 rounded-lg text-center font-medium bg-green-100 text-green-800 border border-green-200">
						Message sent successfully!
					</div>
				{:else if submitStatus === 'error'}
					<div class="px-4 py-3 rounded-lg text-center font-medium bg-red-100 text-red-800 border border-red-200">
						Failed to send message. Please try again.
					</div>
				{/if}

				<button
					type="submit"
					disabled={isSubmitting}
					class="bg-hacksu-blue hover:bg-[#3570e6] text-white px-8 py-3.5 border-none rounded-lg text-base font-semibold cursor-pointer transition-colors self-center mt-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{isSubmitting ? 'Sending...' : 'Send Message'}
				</button>
			</form>
		</div>
	</div>
</div>

