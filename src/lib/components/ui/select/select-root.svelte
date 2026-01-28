<script lang="ts">
    import { setContext } from "svelte";
    import { writable } from "svelte/store"; // Using store for context simplicity in Svelte 5 hybrid mode or just runes.
    // Let's use runes context pattern if possible, but store is safer for context reactivity across files in simplified setup

    let { type = "single", onValueChange, children } = $props();

    let open = $state(false);

    function toggle() {
        open = !open;
    }

    function close() {
        open = false;
    }

    function select(v: string) {
        if (onValueChange) onValueChange(v);
        close();
    }

    setContext("select", {
        get open() {
            return open;
        },
        toggle,
        close,
        select,
    });
</script>

{@render children()}
