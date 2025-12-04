<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form?: { error?: string } } = $props();

	const location = $derived(data.location);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Edit Location Information</h1>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-6">
		<div>
			<label for="time" class="block text-sm font-medium mb-2">Meeting Time</label>
			<input
				type="text"
				id="time"
				name="time"
				value={location?.time || 'Every Tuesday at 7:00 PM'}
				placeholder="Every Tuesday at 7:00 PM"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<div>
			<label for="buildingRoom" class="block text-sm font-medium mb-2">Room Number</label>
			<input
				type="text"
				id="buildingRoom"
				name="buildingRoom"
				value={location?.buildingRoom || '228'}
				placeholder="Room 228"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<div>
			<label for="buildingSelector" class="block text-sm font-medium mb-2">Building Image</label>
			<select
				id="buildingSelector"
				name="buildingSelector"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			>
				<option value="msb" selected={location?.buildingSelector === 'msb'}>Mathematical Sciences Building (MSB)</option>
				<option value="bowman" selected={location?.buildingSelector === 'bowman'}>Bowman Hall</option>
			</select>
		</div>

		<div>
			<label for="buildingUrl" class="block text-sm font-medium mb-2">Building Map URL</label>
			<input
				type="url"
				id="buildingUrl"
				name="buildingUrl"
				value={location?.buildingUrl || ''}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			/>
		</div>

		<div>
			<label for="body" class="block text-sm font-medium mb-2">Description (Optional)</label>
			<textarea
				id="body"
				name="body"
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hacksu-green"
			>{location?.body || ''}</textarea>
		</div>


		<div class="flex gap-4">
			<button
				type="submit"
				class="bg-hacksu-green hover:bg-hacksu-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
			>
				Save Changes
			</button>
			<a
				href="/admin"
				class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
