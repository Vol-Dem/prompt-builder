import { useState, useEffect, useRef, useMemo } from "react";
import { parseIntersectionMargin } from "../utils/generalUtils";

/**
 * Intersection observer hook
 * @param {React.MutableRefObject} elementRef - The reference to the element to observe
 * @param {Boolean} once - Whether to disable intersection after the first activation
 * @param {Number | String} rootMargin - The margin around the root
 * @param {Number | String} scrollMargin - The margin around nested scroll containers
 * @param {Number | Array<Number>} threshold - The visibility threshold(s) for triggering the callback
 * @param {React.MutableRefObject} rootRef -  The reference to the element used as the viewport for visibility checks
 * @returns The intersection state
 */
export const useIntersection = (
  elementRef,
  once = true,
  rootMargin = 0,
  scrollMargin = 0,
  threshold = 0,
  rootRef = null
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef(null);

  useMemo(() => {
    if (!elementRef) return;

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
  }, [elementRef, once, rootMargin, scrollMargin, threshold, rootRef]);

  useEffect(() => {
    if (!elementRef?.current) return;

    observerRef.current.observe(elementRef.current);

    return () => {
      observerRef.current.disconnect();
    };
  }, [elementRef]);

  return isIntersecting;
};

export default useIntersection;
