<script lang="ts">
	// Admin action buttons configuration
	// Add more actions here as needed
	const adminActions = [
		{
			title: 'Edit Location Information',
			href: '/admin/location',
			description: 'Update meeting location, time, and building details'
		},
		{
			title: 'Manage Leadership',
			href: '/admin/leadership',
			description: 'Add, edit, and remove leadership team members'
		},
		{
			title: 'Manage Meetings',
			href: '/admin/meetings',
			description: 'Add, edit, and remove meetings'
		},
		{
			title: 'Manage Redirects',
			href: '/admin/redirects',
			description: 'Create and manage short redirect links'
		},
		{
			title: 'Admin Notes',
			href: '/admin/notes',
			description: 'Internal notes for admins only'
		}
	];
</script>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<div class="container mx-auto px-4 py-8 max-w-7xl">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
				<p class="text-gray-600 dark:text-gray-400">Manage website content and settings</p>
			</div>
			<a
				href="/auth/logout"
				class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
			>
				Logout
			</a>
		</div>

		<!-- Admin Actions Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each adminActions as action}
				<a
					href={action.href}
					class="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700 hover:border-hacksu-green/50"
				>
					<div class="flex-1 min-w-0">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-hacksu-green transition-colors">
							{action.title}
						</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
							{action.description}
						</p>
					</div>
					<div class="mt-4 flex items-center text-hacksu-green text-sm font-medium">
						<span>Go to page</span>
						<svg
							class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Empty State (when no actions) -->
		{#if adminActions.length === 0}
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
				<p class="text-gray-600 dark:text-gray-400">No admin actions configured yet.</p>
			</div>
		{/if}
	</div>
</div>
