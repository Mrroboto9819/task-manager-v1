<script>
    let {
        checked = $bindable(false),
        label = "",
        disabled = false,
        color = "",
        ...rest
    } = $props();
</script>

<label
    class="inline-flex cursor-pointer items-center gap-3 group {disabled
        ? 'opacity-50 cursor-not-allowed'
        : ''}"
>
    <div class="relative">
        <input
            type="checkbox"
            class="peer sr-only"
            bind:checked
            {disabled}
            {...rest}
        />
        <div
            class="peer h-6 w-11 rounded-full bg-muted transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 peer-checked:bg-primary hover:peer-checked:bg-primary/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            style:background-color={checked && color ? color : undefined}
            style:--tw-ring-color={checked && color ? color + "40" : undefined}
        ></div>
        <div
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 peer-checked:translate-x-5"
        ></div>
    </div>
    {#if label}
        <span
            class="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200"
            >{label}</span
        >
    {/if}
</label>
