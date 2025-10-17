import { useState } from "react";
import {
  SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../../variables/constants";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import classes from "./Hashtags.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { liveSearch, searchActions } from "../../store/search";
import { useNavigate } from "react-router-dom";

const Hashtags = ({ hashtags }) => {
  const [showAllHashtags, setShowAllHashtags] = useState(false);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const curHashtags = showAllHashtags
    ? hashtags
    : hashtags?.slice(0, SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT);

  const submitSearchHandler = (e) => {
    e.preventDefault();
    dispatch(searchActions.resetSearchData());
    dispatch(searchActions.resetSearchFilter());

    navigate("/search");
    dispatch(
      searchActions.setSearchFilter({
        type: "hashtag",
        value: true,
      })
    );
    dispatch(
      liveSearch(
        e.target.dataset.value,
        nsfwMode,
        SETTINGS_SEARCH_RESULT_PER_PAGE,
        false,
        false,
        true
      )
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
