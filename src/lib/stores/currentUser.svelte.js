import { toastStore } from "../toastStore.svelte.js";

const STORAGE_KEY_NAME = "userName";

let name = $state("Guest User");

export const currentUserStore = {
    get name() {
        return name;
    },

    hydrate() {
        if (typeof localStorage === "undefined") return;
        const stored = localStorage.getItem(STORAGE_KEY_NAME);
        if (stored) {
            name = stored;
        }
    },

    setName(newName) {
        name = newName;
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(STORAGE_KEY_NAME, newName);
        }
        toastStore.success("Profile updated");
    }
};
