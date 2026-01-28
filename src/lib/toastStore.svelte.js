/**
 * Toast notification store using Svelte 5 runes
 */

let toasts = $state([]);

export const toastStore = {
  get toasts() {
    return toasts;
  },

  success(message, duration = 3000) {
    this.add({ message, type: "success", duration });
  },

  error(message, duration = 4000) {
    this.add({ message, type: "error", duration });
  },

  info(message, duration = 3000) {
    this.add({ message, type: "info", duration });
  },

  add(toast) {
    const id = Date.now() + Math.random();
    toasts = [...toasts, { ...toast, id }];
  },

  remove(id) {
    toasts = toasts.filter((t) => t.id !== id);
  },

  clear() {
    toasts = [];
  },
};
