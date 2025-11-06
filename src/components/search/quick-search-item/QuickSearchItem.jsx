import classes from "./QuickSearchItem.module.scss";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
} from "../../../variables/constants";
import { motion } from "framer-motion";
import { searchActions } from "../../../store/search";
import { NavLink } from "react-router-dom";
import { modelActions } from "../../../store/model";
import Image from "../../ui/image/Image";
import ButtonSquareAdd from "../../ui/ButtonSquareAdd";
import { useDispatch, useSelector } from "react-redux";

const QuickSearchItem = ({ modelPreveiw }) => {
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();

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
          dispatch(searchActions.setSearchResult([]));
          dispatch(modelActions.setActiveCarouselData({}));
        }}
      >
        <>
          <Image
            className={classes["img-container"]}
            src={
              nsfwMode
                ? modelPreveiw.nsfwPreviewImgUrl ||
                  modelPreveiw.customPreviewImgUrl ||
                  modelPreveiw.imgUrl
                : modelPreveiw.customPreviewImgUrl || modelPreveiw.imgUrl
            }
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
            {modelPreveiw.baseModel && (
              <span className={classes.models}>{modelPreveiw.baseModel}</span>
            )}
          </div>

          <div className={classes["search__name"]}>{modelPreveiw.name}</div>
        </div>
      </NavLink>
      <ButtonSquareAdd
        previewData={modelPreveiw}
        className={classes["search__add"]}
      />
    </motion.li>
  );
};

export default QuickSearchItem;
