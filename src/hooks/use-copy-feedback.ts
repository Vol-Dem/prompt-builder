import { useEffect, useRef, useState } from "react";

import { AppError, normalizeError, reportError } from "../utils/generalUtils";
import {
  ERROR_MESSAGE_CLIPBOARD_COPY,
  ERROR_MESSAGE_CLIPBOARD_UNAVAILABLE,
} from "../variables/constants";

const useCopyFeedback = (text: string) => {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestRef = useRef<symbol | null>(null);
  const timeoutCopiedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      requestRef.current = null;
      if (timeoutCopiedRef.current !== null) {
        clearTimeout(timeoutCopiedRef.current);
        timeoutCopiedRef.current = null;
      }
    };
  }, []);

  const copy = async () => {
    if (requestRef.current !== null) return;
    const request = Symbol();
    requestRef.current = request;
    const isCurrent = () => requestRef.current === request;

    if (timeoutCopiedRef.current !== null) {
      clearTimeout(timeoutCopiedRef.current);
      timeoutCopiedRef.current = null;
    }
    setCopied(false);
    setCopying(true);
    setErrorMessage("");

    try {
      if (
        typeof navigator === "undefined" ||
        typeof navigator.clipboard?.writeText !== "function"
      ) {
        throw new AppError(ERROR_MESSAGE_CLIPBOARD_UNAVAILABLE);
      }
      await navigator.clipboard.writeText(text);
      if (!isCurrent()) return;
      setCopied(true);

      timeoutCopiedRef.current = setTimeout(() => {
        setCopied(false);
        timeoutCopiedRef.current = null;
      }, 1000);
    } catch (error) {
      if (!isCurrent()) return;
      const normalized = normalizeError(error);
      reportError(normalized);
      setErrorMessage(
        normalized.isCustom ? normalized.message : ERROR_MESSAGE_CLIPBOARD_COPY,
      );
    } finally {
      if (isCurrent()) {
        requestRef.current = null;
        setCopying(false);
      }
    }
  };

  const clearError = () => setErrorMessage("");

  return { copied, copying, errorMessage, copy, clearError };
};

export default useCopyFeedback;
