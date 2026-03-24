import { useState, useEffect, useRef, useMemo, type RefObject } from "react";

import { parseIntersectionMargin } from "../utils/generalUtils";

/**
 * Intersection observer hook
 * @param {React.RefObject | null} elementRef - The reference to the element to observe
 * @param {boolean} once - Whether to disable intersection after the first activation
 * @param {number | string} rootMargin - The margin around the root
 * @param {number | string} scrollMargin - The margin around nested scroll containers
 * @param {number | Array<Number>} threshold - The visibility threshold(s) for triggering the callback
 * @param {React.RefObject | null} rootRef -  The reference to the element used as the viewport for visibility checks
 * @returns The intersection state
 */
export const useIntersection = (
  elementRef: RefObject<HTMLElement | null> | null,
  once: boolean = true,
  rootMargin: number | string = 0,
  scrollMargin: number | string = 0,
  threshold: number | number[] = 0,
  rootRef: RefObject<HTMLElement | null> | null = null,
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver>(null);

  useMemo(() => {
    if (!elementRef) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && once) observerRef.current?.disconnect();
      },
      {
        root: rootRef?.current,
        rootMargin: parseIntersectionMargin(rootMargin),
        scrollMargin: parseIntersectionMargin(scrollMargin),
        threshold: threshold,
      },
    );
  }, [elementRef, once, rootMargin, scrollMargin, threshold, rootRef]);

  useEffect(() => {
    if (!elementRef?.current) return;

    observerRef.current?.observe(elementRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [elementRef]);

  return isIntersecting;
};

export default useIntersection;
