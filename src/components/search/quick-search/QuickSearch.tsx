import { motion } from "framer-motion";
import type { MouseEvent, SubmitEvent } from "react";

import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
  ERROR_MESSAGE_OFFLINE,
} from "../../../variables/constants";
import classes from "./QuickSearch.module.scss";
import useQuickSearchController from "../../../hooks/use-quick-search-controller";
import Spinner from "../../ui/Spinner";
import CategoriesSearch from "../categories-search/CategoriesSearch";
import ErrorMessage from "../../ui/ErrorMessage";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import QuickSearchResultList from "../quick-search-list/QuickSearchResultList";

type QuickSearchProps = {
  onSubmit: (e: SubmitEvent | MouseEvent<HTMLButtonElement>) => void;
  onOpen: (status: boolean) => void;
};

/** Animated quick-search dropdown with category matches and full-search navigation. */
const QuickSearch = ({ onSubmit, onOpen }: QuickSearchProps) => {
  const { source, result, status, clearQuery } = useQuickSearchController();

  return (
    <motion.div
      initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
      animate={ANIMATIONS_FM_ZOOM_IN}
      exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
      className={classes["search__dropdown"]}
    >
      <div className={classes["search__settings"]}>
        <button
          title="Close"
          className={classes["search__btn-close"]}
          onClick={() => {
            clearQuery();
            onOpen(false);
          }}
        >
          <span className={classes["search__cross"]}></span>
        </button>
      </div>
      <div className={classes["search__result"]}>
        {source === "aitools" && <CategoriesSearch />}
        <QuickSearchResultList />
        {!result.isLastPage && (
          <ButtonTertiary
            type="submit"
            className={classes["btn-more"]}
            onClick={onSubmit}
          >
            Show more
          </ButtonTertiary>
        )}
        {status.isLoading && (
          <div className={classes["spiner-container"]}>
            <Spinner size="small" />
          </div>
        )}
        {!status.isLoading && status.errorMessage && (
          <ErrorMessage>{status.errorMessage}</ErrorMessage>
        )}
        {!status.isLoading &&
          !status.errorMessage &&
          !result?.result?.length &&
          !!result?.query &&
          status.isOnline && <div className={classes.error}>No resources found</div>}
        {!status.isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      </div>
    </motion.div>
  );
};

export default QuickSearch;
