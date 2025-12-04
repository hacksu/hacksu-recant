<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import favicon from '$lib/assets/images/favicon.svg';

	let { data, form }: { data: PageData; form?: { error?: string } } = $props();

	const leader = $derived(data.leader);

	let photoPreview: string | null = null;
	let photoFile: File | null = null;

	function getPhotoUrl(): string {
		if (photoPreview) {
			return photoPreview;
		}
		if (leader.photo) {
			return leader.photo;
		}
		if (leader.github) {
			return `https://github.com/${leader.github}.png`;
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

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		target.src = favicon;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Edit Leader</h1>

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
					alt={leader.name}
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
				value={leader.name}
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
					value={leader.gradYear}
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
					<option value="Spring" selected={leader.gradTerm === 'Spring'}>Spring</option>
					<option value="Fall" selected={leader.gradTerm === 'Fall'}>Fall</option>
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
				value={leader.github || ''}
				placeholder="username (without @)"
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
				value={leader.titles.join(', ')}
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
				value={leader.link || ''}
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
				checked={leader.isCurrent}
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
				Save Changes
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
