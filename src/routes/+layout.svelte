<script lang="ts">
  import "../app.css";
  import { onMount, type Snippet } from "svelte";
  import { Minus, Square, X, Moon, Sun } from "lucide-svelte";
  import ToastContainer from "../lib/ToastContainer.svelte";
  import Sidebar from "../lib/components/Sidebar.svelte";
  import { hydrateAllStores } from "../lib/stores/index.js";

  let { children } = $props();

  let appWindow: any = $state(null);
  let darkMode = $state(true);
  let mounted = $state(false);
  let sidebarCollapsed = $state(false);
  let contentElement: HTMLElement | undefined = $state();

  onMount(async () => {
    mounted = true;

    // Initialize all stores
    hydrateAllStores();

    // Try to get Tauri window (will fail gracefully in browser)
    try {
      // Dynamic import to avoid SSR issues if any, though onMount is browser-only.
      // Using logic from user's example
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      appWindow = getCurrentWindow();
    } catch {
      // Running in browser, not Tauri
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      darkMode = savedDarkMode === "true";
    } else {
      darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    applyDarkMode();
  });

  function applyDarkMode() {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    applyDarkMode();
  }

  const minimize = () => appWindow?.minimize();
  const toggleMaximize = () => appWindow?.toggleMaximize();
  const close = () => appWindow?.close();
</script>

<div class="app-shell">
  <!-- Custom Titlebar -->
  <header class="titlebar" data-tauri-drag-region>
    <div class="titlebar__brand" data-tauri-drag-region>
      <div class="titlebar__dot"></div>
      <span class="tracking-wide" data-tauri-drag-region>TaskFlow</span>
    </div>
    <div class="titlebar__actions" data-tauri-drag-region="false">
      <button
        class="titlebar__btn"
        type="button"
        onclick={toggleDarkMode}
        title="Toggle theme"
      >
        {#if darkMode}
          <Sun size={14} />
        {:else}
          <Moon size={14} />
        {/if}
      </button>
      {#if appWindow}
        <button class="titlebar__btn" type="button" onclick={minimize}>
          <Minus size={14} />
        </button>
        <button class="titlebar__btn" type="button" onclick={toggleMaximize}>
          <Square size={14} />
        </button>
        <button
          class="titlebar__btn titlebar__btn--close"
          type="button"
          onclick={close}
        >
          <X size={14} />
        </button>
      {/if}
    </div>
  </header>

  <!-- Sidebar Navigation -->
  <Sidebar bind:isCollapsed={sidebarCollapsed} {contentElement} />

  <!-- Main Content -->
  <div bind:this={contentElement} class="app-body pl-64 overflow-y-auto">
    {@render children()}
  </div>

  <!-- Version Tag -->
  <div
    class="fixed bottom-2 right-4 pointer-events-none opacity-40 z-50 text-[10px] text-muted-foreground font-mono select-none"
  >
    v{__APP_VERSION__}
  </div>

  <!-- Toast Notifications -->
  <ToastContainer />
</div>
