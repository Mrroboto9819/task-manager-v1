<script>
  import { onMount } from "svelte";
  import "../app.css";
  import { Minus, Square, X } from "lucide-svelte";

  let appWindow = null;

  onMount(async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    appWindow = getCurrentWindow();
  });

  const minimize = () => appWindow?.minimize();
  const toggleMaximize = () => appWindow?.toggleMaximize();
  const close = () => appWindow?.close();
</script>

<div class="app-shell">
  <header class="titlebar" data-tauri-drag-region>
    <div class="titlebar__brand" data-tauri-drag-region>
      <div class="titlebar__dot" data-tauri-drag-region></div>
      <span data-tauri-drag-region>Task Manager</span>
    </div>
    <div class="titlebar__actions" data-tauri-drag-region="false">
      <button class="titlebar__btn" type="button" data-tauri-drag-region="false" onclick={minimize}>
        <Minus size={14} />
      </button>
      <button class="titlebar__btn" type="button" data-tauri-drag-region="false" onclick={toggleMaximize}>
        <Square size={14} />
      </button>
      <button
        class="titlebar__btn titlebar__btn--close"
        type="button"
        data-tauri-drag-region="false"
        onclick={close}
      >
        <X size={14} />
      </button>
    </div>
  </header>
  <div class="app-body">
    <slot />
  </div>
</div>
