<a href={route.href || "/"} class="text-sm font-medium text-white/80 hover:text-white transition-colors">
  {#if route.text}
    {route.text}
  {:else if route.img}
    <img src={route.img} alt={route.alt || "nav item"} class="h-10 w-auto" />
  {/if}
</a>

<script>
  export let route;
</script>
