import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import classes from "./CategoriesSearchItem.module.scss";
import { imagesActions } from "../../../store/images";
import { tabActions } from "../../../store/tabs";
import { searchActions } from "../../../store/search";
import { modelActions } from "../../../store/model";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../../variables/constants";

/**
 * CategoriesSearchItem
 *
 * Renders a single subcategory search result.
 *
 * Displays the parent category and subcategory name
 * and navigates to the corresponding page on click.
 *
 * Responsibilities:
 * - Displays subcategory and its parent category.
 * - Routes to the correct section (models or collections).
 * - Updates global navigation state.
 * - Clears the active search state after navigation.
 *
 * @component
 * @param {object} props
 * @param {object} props.result - Subcategory search result data.
 *
 * @returns {JSX.Element} Subcategory search item.
 */
const CategoriesSearchItem = ({ result }) => {
  const dispatch = useDispatch();

  return (
    <motion.li
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
      className={classes["categories-item"]}
    >
      <span className={classes["type"]}>{result.type}</span>{" "}
      <Link
        to={result.type === "collection" ? "/images" : "/"}
        className={classes["text-link"]}
        onClick={() => {
          if (result.type === "collection") {
            dispatch(imagesActions.setActiveCategory(result.id));
            dispatch(imagesActions.setActiveSubcategory(""));
          } else {
            dispatch(tabActions.setCurrentTab(result.type));
            dispatch(tabActions.setCurrentCategory(result.id));
          }
          dispatch(searchActions.setSearchQuery(""));
          dispatch(searchActions.setSearchResult([]));
        }}
      >
        {result.name}
      </Link>{" "}
      -{" "}
      <Link
        to={result.type === "collection" ? "/images" : "/"}
        className={classes["text-link"]}
        onClick={() => {
          if (result.type === "collection") {
            dispatch(imagesActions.setActiveCategory(result.id));
            dispatch(imagesActions.setActiveSubcategory(result.subId));
          } else {
            dispatch(tabActions.setCurrentTab(result.type));
            dispatch(tabActions.setCurrentCategory(result.id));
            dispatch(tabActions.setCurrentSubcategory(result.subId));
          }
          dispatch(searchActions.setSearchQuery(""));
          dispatch(searchActions.setSearchResult([]));
          dispatch(modelActions.setActiveCarouselData({}));
        }}
      >
        {result.subName}
      </Link>
    </motion.li>
  );
};

export default CategoriesSearchItem;
