<script lang="ts">
	// No server data needed currently; access is controlled
	// by the admin_session cookie on the server.
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

	<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
		<h2 class="text-xl font-semibold mb-4">Welcome, admin!</h2>
		<p class="text-gray-600 dark:text-gray-400">
			You are authenticated via Discord and have the required role.
		</p>
	</div>

	<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
		<h2 class="text-xl font-semibold mb-4">Admin Actions</h2>
		<p class="text-gray-600 dark:text-gray-400">
			This is a protected admin route. Only authenticated users with the required Discord role can access this page.
		</p>
	</div>
</div>
