<script lang="ts">
	import hacksuLogo from '$lib/assets/hacksu_logo.svg';
    import NavLink from "./NavLink.svelte";
	import { page } from '$app/stores';

	const pageStore = $derived($page);
	const isAdmin = $derived(Boolean(pageStore.data?.isAdmin));

    type Route = {
        href: string
        pos: "left" | "right" | "center"
        img?: string
        text?: string
        alt?: string
    }


    
    const routes: Route[] = [
        {href:'/', img:hacksuLogo, alt:"Hacksu", pos:"center"},
        {href:'/',text:"Home",pos:"left"},
        {href:'/leadership',text:"Leadership",pos:"left"},
        {href:'/meetings',text:"Meetings",pos:"left"},
        {href:'/info',text:"Helpful Information",pos:"right"},
    ]


</script>

<nav class="sticky top-0 z-50 border-b border-gray-700/50 bg-hacksu-grey/80 backdrop-blur-sm">
	<div class="mx-auto max-w-5xl px-4">
        <div class="flex h-16 items-center justify-between">
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

	</div>
</nav>
