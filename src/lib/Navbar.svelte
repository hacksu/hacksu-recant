<script lang="ts">
	import hacksuLogo from '$lib/assets/images/hacksu_logo.svg';
    import NavLink from "./NavLink.svelte";
	import { page } from '$app/state';

	const pageStore = $derived(page);
	const isAdmin = $derived(Boolean(pageStore.data?.isAdmin));

    type Route = {
        href: string
        pos: "left" | "right" | "center"
        img?: string
        text?: string
        alt?: string
    }

    let mobileMenuOpen = $state(false);

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    function closeMobileMenu() {
        mobileMenuOpen = false;
    }
    
    const routes: Route[] = [
        {href:'/',           img:hacksuLogo, alt:"Hacksu", pos:"center"},
        {href:'/',           text:"Home",                  pos:"left"},
        {href:'/leadership', text:"Leadership",            pos:"left"},
        {href:'/lessons',    text:"Lessons",               pos:"right"},
        {href:'/meetings',   text:"Meetings",              pos:"left"},
        {href:'/info',       text:"Resources",             pos:"right"},
        {href:'/contact',    text:"Contact",               pos:"right"},
    ]

    // Get all non-center routes for mobile menu
    const mobileRoutes = routes.filter(r => r.pos !== "center");
    const logoRoute = routes.find(r => r.pos === "center");

</script>

<nav class="sticky top-0 z-50 border-b border-gray-700/50 bg-hacksu-grey/80 backdrop-blur-sm">
	<div class="mx-auto max-w-5xl px-4">
        <!-- Desktop Navigation -->
        <div class="hidden md:flex h-16 items-center justify-between">
            <!-- Left nav items -->
            <div class="w-32 flex gap-4 justify-start">
                {#each routes.filter(r => r.pos === "left") as route}
                    <NavLink {route} />
                {/each}
            </div>

            <!-- Center nav items -->
            <div class="flex items-center gap-4 justify-center">
                {#each routes.filter(r => r.pos === "center") as route}
                    <NavLink {route} />
                {/each}
            </div>

            <!-- Right nav items + Admin -->
            <div class="w-32 flex justify-end gap-4 text-sm">
                {#each routes.filter(r => r.pos === "right") as route}
                    <NavLink {route} />
                {/each}

                {#if isAdmin}
                    <a href="/admin" class="font-medium text-white/80 hover:text-white transition-colors">
                        Admin
                    </a>
                {/if}
            </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="md:hidden flex h-16 items-center justify-between">
            <!-- Logo (left on mobile) -->
            {#if logoRoute}
                <NavLink route={logoRoute} />
            {/if}

            <!-- Hamburger Button -->
            <button
                type="button"
                class="p-3 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                onclick={toggleMobileMenu}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
            >
                <svg
                    class="h-6 w-6 {mobileMenuOpen ? 'hidden' : ''}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                    class="h-6 w-6 {!mobileMenuOpen ? 'hidden' : ''}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        <div
            class="md:hidden overflow-hidden transition-all duration-300 ease-in-out {mobileMenuOpen ? 'max-h-96 border-t border-gray-700/50' : 'max-h-0'}"
        >
            <div class="py-4 space-y-1">
                {#each mobileRoutes as route}
                    <a
                        href={route.href}
                        class="block px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded-md mx-2"
                        onclick={closeMobileMenu}
                    >
                        {route.text}
                    </a>
                {/each}
                {#if isAdmin}
                    <a
                        href="/admin"
                        class="block px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded-md mx-2"
                        onclick={closeMobileMenu}
                    >
                        Admin
                    </a>
                {/if}
            </div>
        </div>
	</div>
</nav>
