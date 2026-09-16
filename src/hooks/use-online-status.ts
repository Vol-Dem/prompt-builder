import { useState, useEffect } from "react";

/**
 * Checks the current online status
 * @returns True if online, otherwise false
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator?.onLine);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return isOnline;
}
