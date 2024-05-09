import { useState, useEffect, useRef } from "react";

export const useIntersection = (ref, once = true) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!once) {
          console.log("Int", entry.isIntersecting);
        }
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && once) observerRef.current.disconnect();
      }
      // { rootMargin: "300px" }
    );
  }, [once]);

  useEffect(() => {
    if (ref.current) observerRef.current.observe(ref.current);

    return () => {
      observerRef.current.disconnect();
    };
  }, [ref]);

  return isIntersecting;
};

export default useIntersection;
