import React, { useEffect, useState } from "react";

const useScrollTop = () => {
  const [useScrollTop, setScrollTop] = useState(null);

  useEffect(() => {
    // console.log("start");
    // console.log(document.body.scrollTop);

    const getScroll = () => {
      const scrollTopValue =
        document.body.scrollTop || document.documentElement.scrollTop || 0;
      setScrollTop(Math.round(scrollTopValue));
      //   console.log(document.body.scrollTop);
      //   console.log(document.documentElement.scrollTop);
    };
    window.addEventListener("scroll", getScroll);

    // return () => {
    //   document.body.removeEventListener("scroll", getScroll);
    // };
  }, []);
  return useScrollTop;
};

export default useScrollTop;
