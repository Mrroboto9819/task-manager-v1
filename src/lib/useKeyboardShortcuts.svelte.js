/**
 * Keyboard shortcuts manager using Svelte 5
 */

export function useKeyboardShortcuts(shortcuts) {
  if (typeof window === 'undefined') return;

  function handleKeyDown(event) {
    const target = event.target;

    // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Build the shortcut key string
    let shortcutKey = '';
    if (ctrl) shortcutKey += 'ctrl+';
    if (shift) shortcutKey += 'shift+';
    if (alt) shortcutKey += 'alt+';
    shortcutKey += key;

    // Check if this shortcut exists
    const handler = shortcuts[shortcutKey];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }

  // Add event listener
  window.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}
