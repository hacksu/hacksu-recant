<script lang="ts">
	export let location: {
		time: string;
		location: {
			building: {
				name: string;
				room: string;
				image: string;
				url: string;
			};
		};
		body: string;
	};
</script>

<div class="w-full py-20 px-4">
	<div class="max-w-4xl mx-auto">
		<div class="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12">
			<p
				class="table mx-auto mb-4 rounded-full bg-hacksu-blue px-3.5 py-1.5 text-center text-xs font-extrabold uppercase tracking-wider text-white"
			>
				Where &amp; when
			</p>
			<h2 class="text-4xl md:text-5xl font-bold text-white text-center mb-6">Meetings</h2>

			<!-- Time -->
			<p class="text-xl md:text-2xl text-white text-center mb-4">{location.time}</p>

			<!-- Location -->
			<div class="text-center mb-6">
				<p class="text-lg md:text-xl text-white">
					<a
						href={location.location.building.url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-hacksu-green underline transition-colors hover:text-hacksu-green/80"
					>
						{location.location.building.name}
					</a>
					<span class="text-white/70"> - {location.location.building.room}</span>
				</p>
			</div>

			<!-- Building Image with Button Overlay -->
			<div class="relative mb-6 rounded-lg overflow-hidden">
				<img
					src={location.location.building.image}
					alt={location.location.building.name}
					class="w-full h-auto rounded-lg"
				/>
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2">
					<a
						href={location.location.building.url}
						target="_blank"
						rel="noopener noreferrer"
						class="bg-hacksu-blue hover:bg-hacksu-blue/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-block"
					>
						Show me on a map
					</a>
				</div>
			</div>

			<!-- Body Text -->
			{#if location.body}
				<p class="text-white/70 text-center text-lg mb-6">{location.body}</p>
			{/if}
		</div>
	</div>
</div>
