import { useEffect, useRef } from "react";

/**
 * Hook to handle Android back button (history API) for sheets/modals.
 * Pushes a state when opened, and closes when back button is pressed.
 * Pops history when closed programmatically to maintain history integrity.
 *
 * @param isOpen Boolean indicating if the sheet/modal is open
 * @param onClose Callback function to close the sheet/modal. MUST BE STABLE (wrapped in useCallback or setState function).
 */
export function useSheetBackHandler(isOpen: boolean, onClose: () => void) {
  const isBackRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset back flag
    isBackRef.current = false;

    // Push a dummy state to history to "trap" the back button
    // We add a timestamp or ID to ensure unique states if needed, though simple object suffices
    window.history.pushState(
      { sheetOpen: true, id: Date.now() },
      "",
      window.location.href,
    );

    const onPopState = (event: PopStateEvent) => {
      // The back button was pressed
      isBackRef.current = true;
      onClose();
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);

      // If cleanup runs and we didn't press back (i.e. closed via UI button),
      // we need to manually pop the history state we pushed.
      if (!isBackRef.current) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);
}
