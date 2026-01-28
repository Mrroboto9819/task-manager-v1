/**
 * Central store exports and initialization
 */

export { taskStore } from "./tasks.svelte.js";
export { userStore } from "./users.svelte.js";
export { currentUserStore } from "./currentUser.svelte.js";
export { themeStore } from "./theme.svelte.js";
export { sprintStore } from "./sprints.svelte.js";
export { statusStore } from "./statuses.svelte.js";
export { settingsStore } from "./settings.svelte.js";
export { tagStore } from "./tags.svelte.js";

import { taskStore } from "./tasks.svelte.js";
import { userStore } from "./users.svelte.js";
import { currentUserStore } from "./currentUser.svelte.js";
import { themeStore } from "./theme.svelte.js";
import { sprintStore } from "./sprints.svelte.js";
import { statusStore } from "./statuses.svelte.js";
import { settingsStore } from "./settings.svelte.js";
import { tagStore } from "./tags.svelte.js";
import { toastStore } from "../toastStore.svelte.js";

/**
 * Initialize all stores - call this once on app mount
 */
export function hydrateAllStores() {
  taskStore.hydrate();
  userStore.hydrate();
  currentUserStore.hydrate();
  themeStore.hydrate();
  sprintStore.hydrate();
  statusStore.hydrate();
  settingsStore.hydrate();
  tagStore.hydrate();

  toastStore.info("Data loaded", 1400);
}

/**
 * Clear all data - for dev/reset purposes
 */
export function clearAllStores() {
  if (typeof localStorage === "undefined") return;

  taskStore.clear();
  userStore.clear();
  sprintStore.clear();
  statusStore.clear();
  settingsStore.reset();

  toastStore.success("All data cleared");
}
