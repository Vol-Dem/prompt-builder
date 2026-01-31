import { useSelector } from "react-redux";

import QuickSearchItem from "../quick-search-item/QuickSearchItem";
import classes from "./QuickSearchResultList.module.scss";
import { SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE } from "../../../variables/constants";

/**
 * QuickSearchResultList
 *
 * Renders the limited preview list for the QuickSearch dropdown.
 *
 * The search request intentionally fetches one extra item
 * (SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE + 1) so the UI can detect
 * whether more results exist.
 *
 * Only the first SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE items
 * are rendered. If an extra item is present, the parent component
 * shows a "Show more" button that navigates to the full search page.
 *
 * Responsibilities:
 * - Displays a limited preview of quick search results.
 * - Hides the extra sentinel result used to detect overflow.
 * - Enables the "Show more" UX pattern.
 *
 * @component
 * @returns {JSX.Element} Quick search result list.
 */
const QuickSearchResultList = () => {
  const searchResult = useSelector((state) => state.search.quickSearchResult);

  const searchResultHtml = searchResult?.result
    ?.slice(0, SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE)
    .map((modelPreveiw) => {
      return (
        <QuickSearchItem key={modelPreveiw.id} modelPreveiw={modelPreveiw} />
      );
    });

  return <ul className={classes["list"]}>{searchResultHtml}</ul>;
};

export default QuickSearchResultList;
