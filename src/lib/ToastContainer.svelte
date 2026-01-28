<script>
  import Toast from "./Toast.svelte";
  import { toastStore } from "./toastStore.svelte.js";
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]">
  {#each toastStore.toasts as toast (toast.id)}
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={() => toastStore.remove(toast.id)}
    />
  {/each}
</div>
