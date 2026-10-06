import { useState } from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

import classes from "./SearchPage.module.scss";
import { ERROR_MESSAGE_OFFLINE } from "../variables/constants";
import PreviewCard from "../components/general-elements/preview-card/PreviewCard";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import LeftSidebar from "../components/layout/left-sidebar/LeftSidebar";
import NotificationMessage from "../components/ui/NotificationMessage";
import SearchFilter from "../components/search/search-filter/SearchFilter";
import Button from "../components/ui/buttons/Button";
import useSearchResultsController from "../hooks/use-search-results-controller";
import usePageTitle from "../hooks/use-page-title";

interface SearchPageProps {
  title: string;
}

/** Full search page with a collapsible filter sidebar and paginated results. */
const SearchPage = ({ title }: SearchPageProps) => {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const { source, query, results, status, pagination } = useSearchResultsController();

  usePageTitle(query.parameter ? `${title} - ${query.parameter}` : title);

  const openSidebarHandler = () => {
    setSidebarIsOpen(true);
  };

  const closeidebarHandler = () => {
    setSidebarIsOpen(false);
  };

  const searchResultHtml = results?.map((item) => {
    return <PreviewCard key={item.id} item={item} />;
  });

  let notificationMessage;

  if (
    query.parameter &&
    !searchResultHtml?.length &&
    !pagination.hasMore &&
    !status.isLoading
  ) {
    notificationMessage = `No search results found for "${query.value}". Try to change your search
              filter`;
  } else if (!query.value && !query.parameter && !searchResultHtml?.length) {
    notificationMessage =
      "Enter your query in the search field to start searching";
  }

  return (
    <div className={classes["container"]}>
      <LeftSidebar
        isOpen={sidebarIsOpen}
        onClose={closeidebarHandler}
        onOpen={openSidebarHandler}
        btnContent={<AdjustmentsHorizontalIcon />}
      >
        <SearchFilter />
      </LeftSidebar>
      <div>
        {!!results?.length && (
          <>
            {query.parameter && (
              <div className={classes["text"]}>
                Search result for "{query.parameter}"
              </div>
            )}
            <ul className={classes["result-list"]}>{searchResultHtml}</ul>
          </>
        )}
        {!status.isLoading && status.errorMessage && (
          <ErrorMessage>{status.errorMessage}</ErrorMessage>
        )}
        <div ref={pagination.endPageRef}></div>
        <div className={classes.panel}>
          {notificationMessage && status.isOnline && !status.isLoading && (
            <NotificationMessage className={classes["text"]}>
              {notificationMessage}
            </NotificationMessage>
          )}
          {status.isLoading && <Spinner />}
          {!status.isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}

          {!status.isLoading &&
            !pagination.isLastPage &&
            !status.errorMessage &&
            query.parameter &&
            source === "civitai" && (
              <div>
                <Button
                  className={classes["btn-more"]}
                  onClick={pagination.loadMore}
                >
                  Load more
                </Button>
              </div>
            )}
          {!status.isLoading && status.errorMessage && source === "civitai" && (
            <Button
              className={classes["btn-more"]}
              onClick={pagination.loadMore}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
