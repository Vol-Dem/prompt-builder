import { useEffect } from "react";

import { DEFAULT_PAGE_TITLE } from "../variables/constants";

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title]);
};

export default usePageTitle;
