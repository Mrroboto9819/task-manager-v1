<script lang="ts">
  import "../app.css";
  import { onMount, type Snippet } from "svelte";
  import { Minus, Square, X, Moon, Sun } from "lucide-svelte";
  import ToastContainer from "../lib/ToastContainer.svelte";
  import Sidebar from "../lib/components/Sidebar.svelte";
  import UpdateScreen from "../lib/UpdateScreen.svelte";
  import { hydrateAllStores, clearAllStores } from "../lib/stores/index.js";

  let { children } = $props();

  let appWindow: any = $state(null);
  let darkMode = $state(true);
  let mounted = $state(false);
  let sidebarCollapsed = $state(false);
  let contentElement: HTMLElement | undefined = $state();

  // Update screen state
  let updateVisible = $state(false);
  let updateStatus = $state<"checking" | "downloading" | "installing" | "restarting">("checking");
  let updateProgress = $state(0);
  let updateVersion = $state("");

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

    // Setup Tauri updater
    setupUpdater();

    // Add keyboard shortcuts for dev testing
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+U - Test update screen
      if (e.ctrlKey && e.shiftKey && e.key === "U") {
        e.preventDefault();
        testUpdateScreen();
      }
      // Ctrl+Shift+R - Reset all data (dev only)
      if (import.meta.env.DEV && e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        if (confirm("Reset all data? This cannot be undone.")) {
          clearAllStores();
          window.location.reload();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  async function setupUpdater() {
    try {
      const { checkUpdate } = await import("@tauri-apps/plugin-updater");
      const { relaunch } = await import("@tauri-apps/plugin-process");

      // Check for updates on app start
      const update = await checkUpdate();

      if (update?.available) {
        updateVisible = true;
        updateStatus = "downloading";
        // Set the actual version from the update manifest
        updateVersion = update.version || "";

        // Track download progress
        let downloaded = 0;
        let contentLength = 0;

        // Download and install the update
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              updateStatus = "downloading";
              contentLength = event.data.contentLength || 0;
              downloaded = 0;
              updateProgress = 0;
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              if (contentLength > 0) {
                updateProgress = Math.round((downloaded / contentLength) * 100);
              }
              break;
            case "Finished":
              updateStatus = "installing";
              updateProgress = 100;
              break;
          }
        });

        updateStatus = "restarting";
        // Wait a moment before restarting
        setTimeout(() => {
          relaunch();
        }, 1000);
      }
    } catch (error) {
      console.error("Update check failed:", error);
      updateVisible = false;
    }
  }

  // Test function for development
  function testUpdateScreen() {
    updateVisible = true;
    updateStatus = "checking";
    updateProgress = 0;
    updateVersion = "2.0.0";

    // Simulate update progress
    setTimeout(() => {
      updateStatus = "downloading";
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        updateProgress = progress;
        if (progress >= 100) {
          clearInterval(interval);
          updateStatus = "installing";
          setTimeout(() => {
            updateStatus = "restarting";
            setTimeout(() => {
              updateVisible = false;
            }, 2000);
          }, 1500);
        }
      }, 200);
    }, 1000);
  }

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

  <!-- Update Screen -->
  <UpdateScreen
    visible={updateVisible}
    status={updateStatus}
    progress={updateProgress}
    version={updateVersion}
  />
</div>
