import { useEffect, useRef, useState } from "react";

const useCopyFeedback = (text: string) => {
  const [copied, setCopied] = useState(false);
  const timeoutCopiedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutCopiedRef.current !== null) {
        clearTimeout(timeoutCopiedRef.current);
      }
    };
  }, []);

  const copy = () => {
    if (timeoutCopiedRef.current !== null) {
      clearTimeout(timeoutCopiedRef.current);
    }

    navigator.clipboard.writeText(text);
    setCopied(true);

    timeoutCopiedRef.current = setTimeout(() => {
      setCopied(false);
      timeoutCopiedRef.current = null;
    }, 1000);
  };

  return { copied, copy };
};

export default useCopyFeedback;
