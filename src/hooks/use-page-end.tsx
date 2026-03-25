import { useCallback, useEffect, useState } from "react";

/**
 * Checks if the current scroll has reached the end of the page
 * @returns True if the end of the page is reached, otherwise false
 */
const usePageEnd = () => {
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
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return isPageEnd;
};

export default usePageEnd;
