<script>
  import { settingsStore, clearAllStores } from "../../lib/stores/index.js";
  import Switch from "../../lib/Switch.svelte";
  import { toastStore } from "../../lib/toastStore.svelte.js";

  let settings = $derived(settingsStore.settings);
  let showResetModal = $state(false);

  function toggleTheme() {
    const newTheme = settings.theme === "dark" ? "light" : "dark";
    settingsStore.setTheme(newTheme);
    toastStore.success(`Switched to ${newTheme} mode`);
  }

  function toggleScrollButtons() {
    settingsStore.toggleScrollButtons();
  }

  function handleReset() {
    clearAllStores();
    showResetModal = false;
  }
</script>

<main class="min-h-screen px-6 pt-6 pb-10">
  <header class="mb-6">
    <h1 class="text-3xl font-bold text-foreground">Settings</h1>
    <p class="text-muted-foreground mt-1">Configure your TaskFlow experience</p>
  </header>

  <div class="max-w-2xl space-y-6">
    <!-- Appearance -->
    <div class="rounded-xl border border-border bg-card p-6">
      <h2 class="text-lg font-semibold text-foreground mb-4">Appearance</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-foreground">Dark Mode</p>
            <p class="text-sm text-muted-foreground">
              Use dark theme across the application
            </p>
          </div>
          <Switch checked={settings.theme === "dark"} onchange={toggleTheme} />
        </div>
      </div>
    </div>

    <!-- Interface -->
    <div class="rounded-xl border border-border bg-card p-6">
      <h2 class="text-lg font-semibold text-foreground mb-4">Interface</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-foreground">Show Scroll Buttons</p>
            <p class="text-sm text-muted-foreground">
              Display navigation buttons for horizontal scrolling
            </p>
          </div>
          <Switch
            checked={settings.showScrollButtons}
            onchange={toggleScrollButtons}
          />
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div class="rounded-xl border border-destructive bg-card p-6">
      <h2 class="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-foreground">Reset All Data</p>
          <p class="text-sm text-muted-foreground">
            Clear all tasks, sprints, users, and settings
          </p>
        </div>
        <button
          type="button"
          class="btn btn-destructive"
          onclick={() => (showResetModal = true)}
        >
          Reset App
        </button>
      </div>
    </div>
  </div>

  <!-- Reset Confirmation Modal -->
  {#if showResetModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-card rounded-xl border border-border p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold text-foreground mb-3">
          Confirm Reset
        </h3>
        <p class="text-muted-foreground mb-6">
          This will permanently delete all your tasks, sprints, team members, and
          settings. This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 btn btn-secondary"
            onclick={() => (showResetModal = false)}
          >
            Cancel
          </button>
          <button type="button" class="flex-1 btn btn-destructive" onclick={handleReset}>
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>
