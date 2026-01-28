<script lang="ts">
    let { class: className, children } = $props();
</script>

<div
    class={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ""}`}
>
    {@render children()}
</div>
