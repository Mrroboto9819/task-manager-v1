<script lang="ts">
    let { class: className, children } = $props();
</script>

<h2
    class={`text-lg font-semibold leading-none tracking-tight ${className || ""}`}
>
    {@render children()}
</h2>
