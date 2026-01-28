<script lang="ts">
    let { class: className, children } = $props();
</script>

<p class={`text-sm text-muted-foreground ${className || ""}`}>
    {@render children()}
</p>
