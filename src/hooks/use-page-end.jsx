import React, { useCallback, useEffect, useState } from "react";

const usePageEnd = (distance = 300) => {
  const [isPageEnd, setIsPageEnd] = useState(false);

  const handleScroll = useCallback(() => {
    // console.log("window.innerHeight", window.innerHeight);
    // console.log(
    //   "document.documentElement.scrollTop",
    //   document.documentElement.scrollTop
    // );
    // console.log(
    //   "document.documentElement.offsetHeight",
    //   document.documentElement.offsetHeight
    // );
    const distanceToBot = Math.round(window.innerHeight * 0.8);
    // console.log("distabce", distanceToBot);
    // console.log(
    //   window.innerHeight + document.documentElement.scrollTop + distanceToBot
    // );
    // console.log(document.documentElement.offsetHeight);
    // // console.log(document.documentElement);
    // console.log(
    //   window.innerHeight + document.documentElement.scrollTop + distanceToBot >
    //     document.documentElement.offsetHeight
    // );
    // const distanceToBot = distance || window.innerHeight * 0.3
    if (
      window.innerHeight + document.documentElement.scrollTop + distanceToBot >
        document.documentElement.offsetHeight &&
      !isPageEnd
    ) {
      console.log("PAGE END");
      setIsPageEnd(true);
    } else if (
      window.innerHeight + document.documentElement.scrollTop + distanceToBot <=
        document.documentElement.offsetHeight &&
      isPageEnd
    ) {
      console.log("NOT PAGE END");
      setIsPageEnd(false);
    }
    // if (
    //   window.innerHeight + document.documentElement.scrollTop + 1 !==
    //   document.documentElement.offsetHeight
    // ) {
    //   //   console.log("window.innerHeight", window.innerHeight);
    //   //   console.log(
    //   //     "document.documentElement.scrollTop",
    //   //     document.documentElement.scrollTop
    //   //   );
    //   //   console.log(
    //   //     "document.documentElement.offsetHeight",
    //   //     document.documentElement.offsetHeight
    //   //   );
    //   //   console.log("NOT PAGE END");
    //   setIsPageEnd(true);
    // } else {
    //   console.log("PAGE END");
    //   setIsPageEnd(false);
    // }
  }, [isPageEnd, distance]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      console.log("REMOVE PAGE END");
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return isPageEnd;
};

export default usePageEnd;
