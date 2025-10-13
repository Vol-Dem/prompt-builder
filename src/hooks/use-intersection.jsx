import { useState, useEffect, useRef, useMemo } from "react";
import { parseIntersectionMargin } from "../utils/generalUtils";

export const useIntersection = (
  elentRef,
  once = true,
  rootMargin = 0,
  scrollMargin = 0,
  threshold = 0,
  rootRef = null
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef(null);

  useMemo(() => {
    if (!elentRef) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && once) observerRef.current.disconnect();
      },
      {
        root: rootRef,
        rootMargin: parseIntersectionMargin(rootMargin),
        scrollMargin: parseIntersectionMargin(scrollMargin),
        threshold: threshold,
      }
    );
  }, [elentRef, once, rootMargin, scrollMargin, threshold, rootRef]);

  useEffect(() => {
    if (!elentRef?.current) return;

    observerRef.current.observe(elentRef.current);

    return () => {
      observerRef.current.disconnect();
    };
  }, [elentRef]);

  return isIntersecting;
};

export default useIntersection;
