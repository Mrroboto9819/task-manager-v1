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
    // Metadata
    formatVersion: "1.0",
    appVersion: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown",
    appName: "FlowStack",
    exportedAt: new Date().toISOString(),
    platform: navigator.platform || "unknown",

    // All app data
    data: {
      tasks: [],
      users: [],
      sprints: [],
      statuses: [],
      settings: {},
      tags: [],
      preferences: {
        userName: null,
        themeColor: null,
        darkMode: null,
        locale: null,
      },
    },
  };

  // Export all storage keys
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const value = localStorage.getItem(storageKey);
    if (value !== null) {
      try {
        // Try to parse JSON data
        const parsed = JSON.parse(value);

        // Group user preferences separately
        if (["userName", "themeColor", "darkMode", "locale"].includes(key)) {
          exportData.data.preferences[key] = parsed;
        } else {
          exportData.data[key] = parsed;
        }
      } catch {
        // Store raw value for non-JSON data (like strings)
        if (["userName", "themeColor", "darkMode", "locale"].includes(key)) {
          exportData.data.preferences[key] = value;
        } else {
          exportData.data[key] = value;
        }
      }
    }
  });

  return exportData;
}

/**
 * Download exported data as a JSON file using native save dialog
 */
export async function downloadExportedData() {
  const data = exportAllData();
  if (!data) return false;

  try {
    // Try to use Tauri's native save dialog
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");

    const defaultFileName = `flowstack-backup-${new Date().toISOString().split("T")[0]}.json`;

    const filePath = await save({
      defaultPath: defaultFileName,
      filters: [{ name: "JSON", extensions: ["json"] }],
      title: "Export FlowStack Data",
    });

    if (filePath) {
      await writeTextFile(filePath, JSON.stringify(data, null, 2));
      toastStore.success("Data exported successfully");
      return true;
    } else {
      // User cancelled
      return false;
    }
  } catch (error) {
    console.warn("Native dialog not available, using browser fallback:", error);

    // Fallback to browser download
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
}

/**
 * Import data from JSON content
 * @param {string} jsonText - The JSON text to import
 * @returns {boolean} - Whether import was successful
 */
function processImportData(jsonText) {
  if (typeof localStorage === "undefined") return false;

  try {
    const importData = JSON.parse(jsonText);

    // Validate import data structure
    if (!importData.data || typeof importData.data !== "object") {
      toastStore.error("Invalid backup file format");
      return false;
    }

    // Import main data keys
    Object.entries(importData.data).forEach(([key, value]) => {
      // Handle nested preferences object (new format)
      if (key === "preferences" && typeof value === "object") {
        Object.entries(value).forEach(([prefKey, prefValue]) => {
          const storageKey = STORAGE_KEYS[prefKey];
          if (storageKey && prefValue !== null) {
            const stringValue = typeof prefValue === "string" ? prefValue : JSON.stringify(prefValue);
            localStorage.setItem(storageKey, stringValue);
          }
        });
        return;
      }

      // Handle regular keys
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
 * Import data from a File object (used by file input fallback)
 * @param {File} file - The JSON file to import
 * @returns {Promise<boolean>} - Whether import was successful
 */
export async function importDataFromFile(file) {
  try {
    const text = await file.text();
    return processImportData(text);
  } catch (error) {
    console.error("Import failed:", error);
    toastStore.error("Failed to import data. Check file format.");
    return false;
  }
}

/**
 * Import data using native file open dialog
 * @returns {Promise<boolean>} - Whether import was successful
 */
export async function importDataWithDialog() {
  try {
    // Try to use Tauri's native open dialog
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { readTextFile } = await import("@tauri-apps/plugin-fs");

    const filePath = await open({
      multiple: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
      title: "Import FlowStack Data",
    });

    if (filePath && typeof filePath === "string") {
      const text = await readTextFile(filePath);
      return processImportData(text);
    } else {
      // User cancelled
      return false;
    }
  } catch (error) {
    console.warn("Native dialog not available:", error);
    toastStore.error("Could not open file dialog");
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
