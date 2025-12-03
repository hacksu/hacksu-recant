<script lang="ts">
	function handleLogin() {
		window.location.href = '/auth/discord';
	}
</script>

<div class="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
		<h1 class="text-3xl font-bold mb-6 text-center">Admin Login</h1>
		<p class="text-gray-600 dark:text-gray-400 mb-6 text-center">
			Sign in with Discord to access the admin dashboard
		</p>
		<button
			onclick={handleLogin}
			class="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
		>
			Login with Discord
		</button>
	</div>
</div>

