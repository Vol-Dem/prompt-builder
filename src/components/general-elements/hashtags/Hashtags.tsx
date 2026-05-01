import { useState, type MouseEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../../../variables/constants";
import classes from "./Hashtags.module.scss";
import { liveSearch, searchActions } from "../../../store/search";
import { updateSearchParams } from "../../../utils/generalUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

type HashtagsProps = { hashtags: string[] };

/**
 * Hashtags component.
 *
 * Renders list of hashtags. Renders first five hashtags and "show all" butoon.
 * On click navigates to search page with hashtag as search value, sets search filter to search by hashtag.
 * Resets previos search result.
 * Dispatches resetSearchData, resetSearchFilter, setSearchFilter, setSearchQuery, liveSearch
 *
 * @component
 *
 * @param props
 * @param props.hashtags - List of hashtags.
 *
 * @returnsHashtags element.
 */
const Hashtags = ({ hashtags }: HashtagsProps) => {
  const [showAllHashtags, setShowAllHashtags] = useState(false);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const setSearchParams = useSearchParams()[1];

  const curHashtags = showAllHashtags
    ? hashtags
    : hashtags?.slice(0, SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT);

  const submitSearchHandler = (e: MouseEvent<HTMLElement>) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (!e.target.dataset.value) return;

    e.preventDefault();
    dispatch(searchActions.resetSearchData());
    dispatch(searchActions.resetSearchFilter());

    navigate("/search");
    dispatch(
      searchActions.setSearchFilter({
        type: "hashtag",
        value: true,
      }),
    );

    const query = e.target.dataset.value;

    dispatch(searchActions.setSearchQuery(query));
    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, {
        searchQuery: query,
        hashtag: "true",
      });
    });
    dispatch(
      liveSearch(
        query,
        nsfwMode,
        SETTINGS_SEARCH_RESULT_PER_PAGE,
        false,
        false,
        true,
      ),
    );
  };

  const modelHashtagsHtml = curHashtags?.map((tag, i) => {
    return (
      <li
        key={i}
        className={classes["hashtags__tag"]}
        onClick={submitSearchHandler}
        data-value={tag}
      >
        #{tag}
      </li>
    );
  });

  const showAllHashtagsHandler = () => {
    setShowAllHashtags((prevState) => !prevState);
  };

  return (
    <ul className={classes["hashtags"]}>
      {modelHashtagsHtml}{" "}
      {hashtags?.length > SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT && (
        <li>
          <button
            onClick={showAllHashtagsHandler}
            className={`${classes["hashtags__btn"]} ${
              classes[
                !showAllHashtags ? "hashtags__btn--show" : "hashtags__btn--hide"
              ]
            }`}
          >
            {showAllHashtags ? (
              <>
                <ChevronLeftIcon className={classes["hashtags__btn-icon"]} />
                <span>Hide</span>
              </>
            ) : (
              <>
                <span>Show All</span>
                <ChevronRightIcon className={classes["hashtags__btn-icon"]} />
              </>
            )}
          </button>
        </li>
      )}
    </ul>
  );
};

export default Hashtags;
