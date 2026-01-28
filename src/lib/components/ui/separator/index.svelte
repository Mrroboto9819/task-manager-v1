<script lang="ts">
    import type { WithElementProps } from "svelte/elements";

    let {
        class: className,
        orientation = "horizontal",
        ...rest
    }: WithElementProps<"div"> & {
        orientation?: "horizontal" | "vertical";
    } = $props();
</script>

<div
    class={`shrink-0 bg-border ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"} ${className || ""}`}
    {...rest}
></div>
