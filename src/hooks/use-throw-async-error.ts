import { useCallback } from "react";
import { useState } from "react";
import type { AppError } from "../utils/generalUtils";

/**
 * Rethrows asynchronous errors to be caught by an error boundary
 * @returns
 */
export const useThrowAsyncError = () => {
  const setErrorState = useState()[1]; // eslint-disable-line

  return useCallback((error: AppError) => {
    setErrorState(() => {
      throw error;
    });
  }, []);
};
