import { useState, useEffect, useRef, useMemo } from "react";

export const useIntersection = (ref, once = true, rootMargin = 0) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef(null);

  useMemo(() => {
    if (!ref) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // if (!once) {
        //   console.log("Int", entry.isIntersecting);
        // }
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && once) observerRef.current.disconnect();
      },
      { rootMargin: `${rootMargin}px` }
    );
  }, [ref, once, rootMargin]);

  useEffect(() => {
    if (!ref?.current) return;

    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current.disconnect();
    };
  }, [ref]);

  return isIntersecting;
};

export default useIntersection;
