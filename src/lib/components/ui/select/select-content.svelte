<script lang="ts">
    import { getContext } from "svelte";

    let { class: className, children } = $props();

    const ctx = getContext("select") as any;
</script>

{#if ctx.open}
    <div
        class={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 ${className || ""}`}
        style="position: absolute; top: calc(100% + 4px);"
    >
        <div class="p-1">
            {@render children()}
        </div>
    </div>
    <!-- Backdrop to close on click outside -->
    <div
        class="fixed inset-0 z-40"
        onclick={() => ctx.close()}
        aria-hidden="true"
    ></div>
{/if}
