<script lang="ts">
    let { open = $bindable(false), children } = $props();
</script>

{#if open}
    {@render children()}
{/if}
