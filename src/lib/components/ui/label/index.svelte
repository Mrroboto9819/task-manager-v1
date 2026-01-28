<script lang="ts">
    import type { WithElementProps } from "svelte/elements";
    import { cn } from "$lib/utils"; // Assuming valid util, or I'll implement inline clx

    // Quick inline cn if $lib/utils doesn't exist yet, but I'll assume it needs creating or I can inline it.
    // For safety, I'll inline a basic class joiner here or use simple template literal if I can't confirm.
    // But better to stick to simple string concat for now if no dependency.

    let {
        class: className,
        children,
        ...rest
    }: WithElementProps<"label"> = $props();
</script>

<label
    class={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground ${className || ""}`}
    {...rest}
>
    {@render children?.()}
</label>
