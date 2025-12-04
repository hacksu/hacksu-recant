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

<div class="contact-page">
	<!-- Top Section with Wavy Background -->
	<div class="wavy-section">
		<div class="wavy-bg"></div>
		<div class="cards-container">
			<!-- Email Card -->
			<div class="contact-card">
				<div class="icon-circle">
					<img src={mailIcon} alt="Email" class="icon" />
				</div>
				<h3 class="card-title">Email Us</h3>
				<p class="card-description">Send us an email and we'll get back to you within 24 hours</p>
				<a href="mailto:hacksu@cs.kent.edu" class="card-link">hacksu@cs.kent.edu</a>
			</div>

			<!-- Discord Card -->
			<div class="contact-card">
				<div class="icon-circle">
					<img src={discordIcon} alt="Discord" class="icon" />
				</div>
				<h3 class="card-title">Join Our Discord</h3>
				<p class="card-description">Get instant help and connect with our community</p>
				<a href="https://discord.gg/rJDdvnt" target="_blank" rel="noopener noreferrer" class="card-link"
					>Join Discord Server</a
				>
			</div>

			<!-- GitHub Card -->
			<div class="contact-card">
				<div class="icon-circle">
					<img src={githubIcon} alt="Github" class="icon" />
				</div>
				<h3 class="card-title">Follow Us</h3>
				<p class="card-description">Check out our projects and contributions</p>
				<a href="https://github.com/hacksu" target="_blank" rel="noopener noreferrer" class="card-link"
					>GitHub</a
				>
			</div>
		</div>
	</div>

	<!-- Contact Form Section -->
	<div class="form-section">
		<div class="form-container">
			<h2 class="form-title">Send us a Message</h2>
			<form onsubmit={handleSubmit} class="contact-form">
				<div class="form-group">
					<label for="name" class="form-label">Your Name</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						bind:value={name}
						class="form-input"
						placeholder="Enter your name"
					/>
				</div>

				<div class="form-group">
					<label for="email" class="form-label">Your Email</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						bind:value={email}
						class="form-input"
						placeholder="Enter your email"
					/>
				</div>

				<div class="form-group">
					<label for="subject" class="form-label">Subject</label>
					<input
						type="text"
						id="subject"
						name="subject"
						required
						bind:value={subject}
						class="form-input"
						placeholder="Enter subject"
					/>
				</div>

				<div class="form-group">
					<label for="message" class="form-label">Message</label>
					<textarea
						id="message"
						name="message"
						required
						bind:value={message}
						class="form-textarea"
						rows="6"
						placeholder="Enter your message"
					></textarea>
				</div>

				{#if submitStatus === 'success'}
					<div class="form-message success">Message sent successfully!</div>
				{:else if submitStatus === 'error'}
					<div class="form-message error">Failed to send message. Please try again.</div>
				{/if}

				<button type="submit" disabled={isSubmitting} class="submit-button">
					{isSubmitting ? 'Sending...' : 'Send Message'}
				</button>
			</form>
		</div>
	</div>
</div>

<style>
	.contact-page {
		min-height: 100vh;
		background: #f5f7fa;
	}

	.wavy-section {
		position: relative;
		padding: 80px 20px 60px;
		overflow: hidden;
	}

	.wavy-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 200px;
		background: linear-gradient(135deg, #4683ff 0%, #35c982 100%);
		clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
		z-index: 0;
	}

	.cards-container {
		position: relative;
		z-index: 1;
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 30px;
		margin-top: 40px;
	}

	.contact-card {
		background: white;
		border-radius: 16px;
		padding: 40px 30px;
		text-align: center;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.contact-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
	}

	.icon-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: #4683ff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20px;
	}

	.icon {
		width: 40px;
		height: 40px;
	}

	.icon-circle .icon {
		color: white;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #1a1a1a;
		margin-bottom: 12px;
	}

	.card-description {
		color: #666;
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 20px;
	}

	.card-link {
		color: #4683ff;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.card-link:hover {
		color: #35c982;
		text-decoration: underline;
	}

	.form-section {
		padding: 60px 20px;
		max-width: 800px;
		margin: 0 auto;
	}

	.form-container {
		background: white;
		border-radius: 16px;
		padding: 50px 40px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.form-title {
		font-size: 2rem;
		font-weight: bold;
		color: #1a1a1a;
		text-align: center;
		margin-bottom: 40px;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-weight: 500;
		color: #1a1a1a;
		font-size: 0.95rem;
	}

	.form-input,
	.form-textarea {
		padding: 12px 16px;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s ease;
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: #4683ff;
	}

	.form-textarea {
		resize: vertical;
		min-height: 120px;
	}

	.submit-button {
		background: #4683ff;
		color: white;
		padding: 14px 32px;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
		align-self: center;
		margin-top: 10px;
	}

	.submit-button:hover:not(:disabled) {
		background: #3570e6;
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-message {
		padding: 12px 16px;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
	}

	.form-message.success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.form-message.error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	@media (max-width: 768px) {
		.cards-container {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.wavy-section {
			padding: 60px 15px 40px;
		}

		.form-container {
			padding: 30px 20px;
		}

		.form-title {
			font-size: 1.5rem;
		}
	}
</style>
