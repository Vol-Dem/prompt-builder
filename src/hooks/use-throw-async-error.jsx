import { useCallback } from "react";
import { useState } from "react";

/**
 * Rethrows asynchronous errors to be caught by an error boundary
 * @returns
 */
export const useThrowAsyncError = () => {
  const [errorState, setErrorState] = useState(); // eslint-disable-line

  return useCallback((error) => {
    setErrorState(() => {
      throw error;
    });
  }, []);
};
