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
import { useAppDispatch } from "../../../store/hooks/hooks";
import type { CategorySearchItem } from "../../../types/search.types";

type CategoriesSearchItemProps = { result: CategorySearchItem };

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
 * @param props
 * @param props.result - Subcategory search result data.
 *
 * @returns Subcategory search item.
 */
const CategoriesSearchItem = ({ result }: CategoriesSearchItemProps) => {
  const dispatch = useAppDispatch();

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
          dispatch(modelActions.setActiveCarouselData(null));
        }}
      >
        {result.subName}
      </Link>
    </motion.li>
  );
};

export default CategoriesSearchItem;
