<script lang="ts">
    let { class: className, children } = $props();
</script>

<div
    class={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ""}`}
>
    {@render children()}
</div>
