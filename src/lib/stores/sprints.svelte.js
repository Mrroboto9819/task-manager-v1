/**
 * Sprint store - Manages sprint state and CRUD operations
 */

import { toastStore } from "../toastStore.svelte.js";
import { taskStore } from "./tasks.svelte.js";
import { settingsStore } from "./settings.svelte.js";

const STORAGE_KEY = "taskflow_sprints";

let sprints = $state([]);

function newId() {
  return crypto.randomUUID();
}

function removeDuplicates(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function saveSprints() {
  sprints = removeDuplicates(sprints);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sprints));
  }
}

export const sprintStore = {
  get sprints() {
    return sprints;
  },

  hydrate() {
    if (typeof localStorage === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        sprints = Array.isArray(parsed) ? removeDuplicates(parsed) : [];
      }
    } catch (error) {
      console.error("Failed to load sprints:", error);
      sprints = [];
    }
  },

  create(sprintData) {
    const now = new Date().toISOString();
    const sprint = {
      id: newId(),
      created: now,
      updated: now,
      status: "planned",
      ...sprintData,
    };

    sprints = [sprint, ...sprints];
    saveSprints();
    toastStore.success("Sprint created");
    return sprint;
  },

  update(id, updates) {
    const now = new Date().toISOString();
    sprints = sprints.map((sprint) =>
      sprint.id === id ? { ...sprint, ...updates, updated: now } : sprint
    );
    saveSprints();
    toastStore.success("Sprint updated");
  },

  activate(id) {
    // Deactivate all other sprints
    sprints = sprints.map((sprint) => ({
      ...sprint,
      status: sprint.id === id ? "active" : sprint.status === "active" ? "planned" : sprint.status,
    }));
    saveSprints();
    toastStore.success("Sprint activated");
  },

  complete(id) {
    const now = new Date().toISOString();

    // Get all tasks for this sprint and move incomplete ones to backlog
    const sprintTasks = taskStore.getBySprint(id);
    const incompleteTasks = sprintTasks.filter((t) => t.status !== "DONE");

    // Move incomplete tasks to backlog (remove from sprint, set status to BACKLOG)
    incompleteTasks.forEach((task) => {
      taskStore.update(task.id, { sprintId: null, status: "BACKLOG" });
    });

    // Notify user about moved tasks
    if (incompleteTasks.length > 0) {
      toastStore.info(`${incompleteTasks.length} incomplete task(s) moved to backlog`);
    }

    // Complete the sprint
    sprints = sprints.map((sprint) =>
      sprint.id === id ? { ...sprint, status: "closed", updated: now } : sprint
    );
    saveSprints();
    toastStore.success("Sprint completed");
  },

  delete(id) {
    sprints = sprints.filter((sprint) => sprint.id !== id);
    saveSprints();
    toastStore.success("Sprint deleted");
  },

  getActive() {
    return sprints.find((sprint) => sprint.status === "active");
  },

  getById(id) {
    return sprints.find((sprint) => sprint.id === id);
  },

  clear() {
    sprints = [];
    saveSprints();
  },

  // Check if active sprint should be auto-finished based on end date
  checkAutoFinish() {
    if (!settingsStore.settings.autoFinishSprints) return;

    const today = new Date().toISOString().split("T")[0];
    const activeSprint = this.getActive();

    if (activeSprint && activeSprint.end && activeSprint.end < today) {
      this.complete(activeSprint.id);
    }
  },
};
