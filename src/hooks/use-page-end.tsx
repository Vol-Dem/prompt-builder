import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Checks if the current scroll has reached the end of the page
 * @returns True if the end of the page is reached, otherwise false
 */
const usePageEnd = (containerRef: RefObject<HTMLElement | null>) => {
  const [isPageEnd, setIsPageEnd] = useState(false);

  const handleScroll = useCallback(() => {
    const distanceToBot = Math.round(window.innerHeight * 0.8);
    if (
      window.innerHeight + document.documentElement.scrollTop + distanceToBot >
        document.documentElement.offsetHeight &&
      !isPageEnd
    ) {
      setIsPageEnd(true);
    } else if (
      window.innerHeight + document.documentElement.scrollTop + distanceToBot <=
        document.documentElement.offsetHeight &&
      isPageEnd
    ) {
      setIsPageEnd(false);
    }
  }, [isPageEnd]);

  useEffect(() => {
    if (containerRef.current)
      containerRef.current.addEventListener("scroll", handleScroll);
    // window.addEventListener("scroll", handleScroll);
    return () => {
      if (containerRef.current)
        containerRef.current.removeEventListener("scroll", handleScroll);
      // window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, containerRef.current]);

  return isPageEnd;
};

export default usePageEnd;
