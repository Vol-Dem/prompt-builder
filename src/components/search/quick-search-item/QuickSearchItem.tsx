import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import classes from "./QuickSearchItem.module.scss";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
} from "../../../variables/constants";
import { searchActions } from "../../../store/search";
import { modelActions } from "../../../store/model";
import Image from "../../ui/image/Image";
import ButtonSquareAdd from "../../general-elements/button-square-add/ButtonSquareAdd";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type {
  CollectionPreviewDoc,
  ModelPreviewDoc,
} from "../../../../shared/types/firestore";

type QuickSearchItemProps = {
  modelPreveiw: ModelPreviewDoc | CollectionPreviewDoc;
};

/**
 * Quick search item card.
 *
 * Renders a model or collection preview card with
 * ability to add the card to the right sidebar.
 * Renders different image previw dependent on nsfw mode.
 *
 * @component
 *
 * @param props
 * @param props.modelPreveiw - Data used to render the preview card.
 *
 * @returns The quick search item card.
 */
const QuickSearchItem = ({ modelPreveiw }: QuickSearchItemProps) => {
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const dispatch = useAppDispatch();

  let imgUrl = nsfwMode
    ? modelPreveiw.nsfwPreviewImgUrl || modelPreveiw.customPreviewImgUrl
    : modelPreveiw.customPreviewImgUrl;

  if (!imgUrl && "imgUrl" in modelPreveiw) {
    imgUrl = modelPreveiw.imgUrl;
  }

  return (
    <motion.li
      key={modelPreveiw.id}
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
      className={classes["search__item"]}
    >
      <NavLink
        to={
          modelPreveiw.type === "collection"
            ? `images/${modelPreveiw.id}`
            : `models/${modelPreveiw.id}`
        }
        className={classes["search__link"]}
        onClick={() => {
          dispatch(searchActions.setSearchQuery(""));
          dispatch(
            searchActions.setSearchResult({
              query: "",
              result: [],
              nsfw: false,
              hashtag: false,
              filter: null,
            }),
          );
          dispatch(modelActions.setActiveCarouselData(null));
        }}
      >
        <>
          <Image
            className={classes["img-container"]}
            src={imgUrl}
            imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
          />
        </>
        <div className={classes["card__content"]}>
          <div>
            <span className={classes.type}>
              {modelPreveiw.type === "TextualInversion"
                ? "Embedding"
                : modelPreveiw.type}
            </span>
            {"baseModel" in modelPreveiw && modelPreveiw.baseModel && (
              <span className={classes.models}>{modelPreveiw.baseModel}</span>
            )}
          </div>

          <div className={classes["search__name"]}>{modelPreveiw.name}</div>
        </div>
      </NavLink>
      <ButtonSquareAdd
        resourceType="model"
        previewData={modelPreveiw}
        className={classes["search__add"]}
      />
    </motion.li>
  );
};

export default QuickSearchItem;
