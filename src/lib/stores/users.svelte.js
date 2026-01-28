/**
 * User store - Manages team member state and CRUD operations
 */

import { toastStore } from "../toastStore.svelte.js";

const STORAGE_KEY = "taskflow_users";

let users = $state([]);

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

function saveUsers() {
  users = removeDuplicates(users);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}

export const userStore = {
  get users() {
    return users;
  },

  hydrate() {
    if (typeof localStorage === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        users = Array.isArray(parsed) ? removeDuplicates(parsed) : [];
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      users = [];
    }
  },

  create(userData) {
    const now = new Date().toISOString();
    const user = {
      id: newId(),
      created: now,
      updated: now,
      ...userData,
    };

    users = [user, ...users];
    saveUsers();
    toastStore.success("Team member added");
    return user;
  },

  update(id, updates) {
    const now = new Date().toISOString();
    users = users.map((user) =>
      user.id === id ? { ...user, ...updates, updated: now } : user
    );
    saveUsers();
    toastStore.success("Team member updated");
  },

  delete(id) {
    users = users.filter((user) => user.id !== id);
    saveUsers();
    toastStore.success("Team member removed");
  },

  getById(id) {
    return users.find((user) => user.id === id);
  },

  clear() {
    users = [];
    saveUsers();
  },
};
