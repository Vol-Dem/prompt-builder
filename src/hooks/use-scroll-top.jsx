import { useEffect, useState } from "react";

/**
 * Calculates the current distance from the scroll position to the top of the page
 * @returns The distance from the current scroll position to the top, in pixels
 */
const useScrollTop = () => {
  const [scrollTop, setScrollTop] = useState(null);

  useEffect(() => {
    const getScroll = () => {
      const scrollTopValue =
        document.body.scrollTop || document.documentElement.scrollTop || 0;
      setScrollTop(Math.round(scrollTopValue));
    };
    window.addEventListener("scroll", getScroll);

    return () => {
      document.body.removeEventListener("scroll", getScroll);
    };
  }, []);
  return scrollTop;
};

export default useScrollTop;
