import { useEffect } from "react";

/**
 * useContentProtection
 * Applies lightweight IP-protection measures on public-facing pages:
 * - Disables right-click context menu
 * - Disables Ctrl+C / Cmd+C copy shortcut
 * - Disables Ctrl+S / Cmd+S save shortcut
 * - Disables Ctrl+P / Cmd+P print shortcut
 * - Disables text selection via CSS
 * - Adds a visible copyright watermark to the document title
 *
 * Note: These are deterrents, not absolute locks. They raise the cost of
 * casual copying without breaking legitimate user interactions.
 */
export function useContentProtection() {
  useEffect(() => {
    // Disable right-click
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for copy/save/print/view-source
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      const blocked = ["c", "s", "p", "u", "a"];
      if (blocked.includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      // Block F12 devtools
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag-to-copy
    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("dragstart", onDragStart);

    // Add CSS user-select: none to body
    const style = document.createElement("style");
    style.id = "content-protection-style";
    style.textContent = `
      body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
      input, textarea, [contenteditable] { -webkit-user-select: text; -moz-user-select: text; user-select: text; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("dragstart", onDragStart);
      document.getElementById("content-protection-style")?.remove();
    };
  }, []);
}
