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

// Storage keys for data migration
const STORAGE_KEYS = {
  tasks: "taskflow_tasks",
  users: "taskflow_users",
  sprints: "taskflow_sprints",
  statuses: "taskflow_statuses",
  settings: "taskflow_settings",
  tags: "taskflow_tags",
  userName: "userName",
  themeColor: "themeColor",
  darkMode: "darkMode",
  locale: "taskflow_locale",
};

/**
 * Initialize all stores - call this once on app mount
 */
export function hydrateAllStores() {
  // Try to migrate any legacy data first
  migrateFromLegacyStorage();

  // Then hydrate all stores
  taskStore.hydrate();
  userStore.hydrate();
  currentUserStore.hydrate();
  themeStore.hydrate();
  sprintStore.hydrate();
  statusStore.hydrate();
  statusStore.ensureDoneStatus(); // Ensure DONE status exists and is protected
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

/**
 * Export all app data to a JSON object
 * Used for backup/migration between app versions
 */
export function exportAllData() {
  if (typeof localStorage === "undefined") return null;

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    appName: "FlowStack",
    data: {},
  };

  // Export all storage keys
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const value = localStorage.getItem(storageKey);
    if (value !== null) {
      try {
        // Try to parse JSON data
        exportData.data[key] = JSON.parse(value);
      } catch {
        // Store raw value for non-JSON data
        exportData.data[key] = value;
      }
    }
  });

  return exportData;
}

/**
 * Download exported data as a JSON file
 */
export function downloadExportedData() {
  const data = exportAllData();
  if (!data) return false;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flowstack-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toastStore.success("Data exported successfully");
  return true;
}

/**
 * Import data from a JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<boolean>} - Whether import was successful
 */
export async function importDataFromFile(file) {
  if (typeof localStorage === "undefined") return false;

  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Validate import data structure
    if (!importData.data || typeof importData.data !== "object") {
      toastStore.error("Invalid backup file format");
      return false;
    }

    // Import each key
    Object.entries(importData.data).forEach(([key, value]) => {
      const storageKey = STORAGE_KEYS[key];
      if (storageKey) {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(storageKey, stringValue);
      }
    });

    toastStore.success("Data imported successfully. Reloading...");

    // Reload to apply imported data
    setTimeout(() => {
      window.location.reload();
    }, 1500);

    return true;
  } catch (error) {
    console.error("Import failed:", error);
    toastStore.error("Failed to import data. Check file format.");
    return false;
  }
}

/**
 * Migrate data from old app storage (if exists)
 * Call this on app startup to handle legacy data
 */
export function migrateFromLegacyStorage() {
  if (typeof localStorage === "undefined") return;

  // Check for legacy "task-manager" prefixed keys
  const legacyMappings = {
    "task-manager_tasks": STORAGE_KEYS.tasks,
    "task-manager_users": STORAGE_KEYS.users,
    "task-manager_sprints": STORAGE_KEYS.sprints,
    "task-manager_statuses": STORAGE_KEYS.statuses,
    "task-manager_settings": STORAGE_KEYS.settings,
    "task-manager_tags": STORAGE_KEYS.tags,
  };

  let migratedCount = 0;

  Object.entries(legacyMappings).forEach(([oldKey, newKey]) => {
    const oldValue = localStorage.getItem(oldKey);
    const newValue = localStorage.getItem(newKey);

    // Only migrate if old data exists and new key is empty
    if (oldValue && !newValue) {
      localStorage.setItem(newKey, oldValue);
      migratedCount++;
    }
  });

  if (migratedCount > 0) {
    toastStore.info(`Migrated ${migratedCount} data stores from previous version`);
  }

  return migratedCount;
}
