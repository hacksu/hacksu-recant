<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import favicon from '$lib/assets/images/favicon.svg';

	let { data, form }: { data: PageData; form?: { error?: string } } = $props();

	let photoPreview: string | null = null;
	let photoFile: File | null = null;
	let githubUsername = $state('');

	function getPhotoUrl(): string {
		if (photoPreview) {
			return photoPreview;
		}
		if (githubUsername) {
			return `https://github.com/${githubUsername}.png`;
		}
		return favicon;
	}

	function handlePhotoChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			photoFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				photoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleGithubChange(event: Event) {
		const target = event.target as HTMLInputElement;
		githubUsername = target.value;
	}

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		target.src = favicon;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Add New Leader</h1>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-6">
		<!-- Photo Upload -->
		<div>
			<label for="photo" class="block text-sm font-medium mb-2">Photo</label>
			<div class="flex items-center gap-4 mb-2">
				<img
					src={getPhotoUrl()}
					alt="Preview"
					class="w-24 h-24 rounded-full object-cover"
					onerror={handleImageError}
				/>
				<div class="flex-1">
					<input
						type="file"
						id="photo"
						name="photo"
						accept="image/*"
						onchange={handlePhotoChange}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
					/>
					<p class="text-xs text-gray-500 mt-1">
						If no photo is uploaded, GitHub profile picture will be used (if GitHub username is provided).
					</p>
				</div>
			</div>
		</div>

		<!-- Name -->
		<div>
			<label for="name" class="block text-sm font-medium mb-2">Name *</label>
			<input
				type="text"
				id="name"
				name="name"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>
		
		<!--Sort Order-->
		<div>
			<label for="sortOrder" class="block text-sm font-medium mb-2">Leadership Order *</label>
			<input
				type="number"
				id="sortOrder"
				name="sortOrder"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Graduation Year and Term -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="gradYear" class="block text-sm font-medium mb-2">Graduation Year *</label>
				<input
					type="number"
					id="gradYear"
					name="gradYear"
					min="1900"
					max="2100"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
				/>
			</div>
			<div>
				<label for="gradTerm" class="block text-sm font-medium mb-2">Graduation Term *</label>
				<select
					id="gradTerm"
					name="gradTerm"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
				>
					<option value="">Select...</option>
					<option value="Spring">Spring</option>
					<option value="Fall">Fall</option>
				</select>
			</div>
		</div>

		<!-- GitHub -->
		<div>
			<label for="github" class="block text-sm font-medium mb-2">GitHub Username</label>
			<input
				type="text"
				id="github"
				name="github"
				placeholder="username (without @)"
				oninput={handleGithubChange}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
			<p class="text-xs text-gray-500 mt-1">
				Used for profile picture fallback: https://github.com/username.png
			</p>
		</div>

		<!-- Titles -->
		<div>
			<label for="titles" class="block text-sm font-medium mb-2">Titles *</label>
			<input
				type="text"
				id="titles"
				name="titles"
				placeholder="Developer, Lesson Master, CSS Respecter"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
			<p class="text-xs text-gray-500 mt-1">Separate multiple titles with commas</p>
		</div>

		<!-- Link -->
		<div>
			<label for="link" class="block text-sm font-medium mb-2">Personal/Professional Link</label>
			<input
				type="url"
				id="link"
				name="link"
				placeholder="https://example.com"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Is Current -->
		<div class="flex items-center">
			<input
				type="checkbox"
				id="isCurrent"
				name="isCurrent"
				class="w-4 h-4 text-hacksu-green border-gray-300 rounded focus:ring-hacksu-green"
			/>
			<label for="isCurrent" class="ml-2 text-sm font-medium">Currently in leadership</label>
		</div>

		<!-- Actions -->
		<div class="flex gap-4">
			<button
				type="submit"
				class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Create Leader
			</button>
			<a
				href="/admin/leadership"
				class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
