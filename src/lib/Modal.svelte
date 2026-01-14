<script>
  export let open = false;
  export let title = "Modal";
  export let size = "md";
  export let onClose = () => {};

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <button
      type="button"
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      aria-label="Close modal"
      onclick={onClose}
    ></button>
    <div
      class={`relative z-10 w-full ${sizeClasses[size] || sizeClasses.md} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl`}
    >
      <header class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </h2>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-slate-300"
          onclick={onClose}
        >
          Close
        </button>
      </header>
      <div class="px-5 py-4">
        <slot />
      </div>
      <footer class="border-t border-slate-100 px-5 py-4">
        <slot name="footer" />
      </footer>
    </div>
  </div>
{/if}
