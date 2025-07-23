import { useState, useEffect, useRef, useMemo } from "react";

export const useIntersection = (
  elentRef,
  once = true,
  rootMargin = 0,
  scrollMargin,
  threshold,
  rootRef
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
        rootMargin: `${rootMargin}px`,
        scrollMargin: scrollMargin || "0px",
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
