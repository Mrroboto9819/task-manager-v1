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
      class="peer h-7 w-12 rounded-full bg-muted transition-all duration-300 ease-in-out after:absolute after:start-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:ease-in-out after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-[20px] peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 hover:peer-checked:bg-primary/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      style:background-color={checked && color ? color : undefined}
      style:--tw-ring-color={checked && color ? color + "40" : undefined}
    ></div>
    <!-- Icon indicators -->
    <div
      class="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none"
    >
      <svg
        class="w-3 h-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
        />
      </svg>
      <svg
        class="w-3 h-3 text-muted-foreground opacity-100 peer-checked:opacity-0 transition-opacity duration-200"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </div>
  </div>
  {#if label}
    <span
      class="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200"
      >{label}</span
    >
  {/if}
</label>
