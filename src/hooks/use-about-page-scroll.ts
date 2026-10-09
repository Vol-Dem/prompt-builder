import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { smoothScroll } from "../utils/generalUtils";

/** Apply About navigation scrolling after the routed content commits. */
const useAboutPageScroll = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      smoothScroll(location.hash);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
};

export default useAboutPageScroll;
