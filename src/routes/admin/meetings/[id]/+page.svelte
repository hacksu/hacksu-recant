<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import favicon from '$lib/assets/favicon.svg';

let { data, form }: { data: PageData; form?: { error?: string } } = $props();

const meeting = $derived(data.event);

	let photoPreview: string | null = null;
	let photoFile: File | null = null;
	let descriptionMD = $state('');
	
// Initialize descriptionMD from meeting data
	$effect(() => {
	descriptionMD = data.event.descriptionMD || '';
	});

	function getPhotoUrl(): string {
		if (photoPreview) {
			return photoPreview;
		}
		if (data.event.photo) {
			return data.event.photo;
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

	// Format date for datetime-local input
	function formatDateForInput(date: Date): string {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		const hours = String(d.getHours()).padStart(2, '0');
		const minutes = String(d.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Edit Event</h1>

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
					alt={data.event.title}
					class="w-24 h-24 rounded-lg object-cover"
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
				</div>
			</div>
		</div>

		<!-- Title -->
		<div>
			<label for="title" class="block text-sm font-medium mb-2">Title *</label>
			<input
				type="text"
				id="title"
				name="title"
				value={data.event.title}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Date -->
		<div>
			<label for="date" class="block text-sm font-medium mb-2">Date & Time *</label>
			<input
				type="datetime-local"
				id="date"
				name="date"
				required
				value={formatDateForInput(data.event.date)}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Presenter -->
		<div>
			<label for="presenter" class="block text-sm font-medium mb-2">Presenter</label>
			<input
				type="text"
				id="presenter"
				name="presenter"
				value={meeting.presenter || ''}
				placeholder="Presenter name"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Link -->
		<div>
			<label for="link" class="block text-sm font-medium mb-2">Link</label>
			<input
				type="url"
				id="link"
				name="link"
				value={data.event.link || ''}
				placeholder="https://example.com"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<!-- Description (Markdown) -->
		<div>
			<label for="descriptionMD" class="block text-sm font-medium mb-2">Description (Markdown)</label>
			<textarea
				id="descriptionMD"
				name="descriptionMD"
				rows="6"
				bind:value={descriptionMD}
				placeholder="Enter description in Markdown format..."
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			></textarea>
			<p class="text-xs text-gray-500 mt-1">
				Supports Markdown formatting (headers, bold, italic, links, etc.)
			</p>
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
				href="/admin/meetings"
				class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
