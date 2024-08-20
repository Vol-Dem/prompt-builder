import { useCallback, useEffect, useState } from "react";

const usePageEnd = (distance = 300) => {
  const [isPageEnd, setIsPageEnd] = useState(false);

  const handleScroll = useCallback(() => {
    const distanceToBot = Math.round(window.innerHeight * 0.8);
    if (
      window.innerHeight + document.documentElement.scrollTop + distanceToBot >
        document.documentElement.offsetHeight &&
      !isPageEnd
    ) {
      // console.log("PAGE END");
      setIsPageEnd(true);
    } else if (
      window.innerHeight + document.documentElement.scrollTop + distanceToBot <=
        document.documentElement.offsetHeight &&
      isPageEnd
    ) {
      // console.log("NOT PAGE END");
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
