import classes from "./ReferenceImageList.module.scss";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
  SETTINGS_REF_IMAGE_ROW_LENGTH,
} from "../../../variables/constants";
import Image from "../../ui/image/Image";
import CrossSvg from "../../../assets/CrossSvg";
import ImageSvg from "../../../assets/ImageSvg";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../../store/model";
import {
  removeImageFromPanel,
  usedModelsActions,
} from "../../../store/usedModels";
import { motion } from "framer-motion";

const ReferenceImageList = ({ usedImages }) => {
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const sfwValue = useSelector((state) => state.general.sfwValue);
  const dispatch = useDispatch();

  const openImageHandler = (e) => {
    const hash = e.target.closest(`.${classes["ref-images__item"]}`).dataset.id;
    const image = usedImages.find((image) => image.hash === hash);

    if (hash) {
      dispatch(
        modelActions.setActiveCarouselData({
          images: [image],
          side: true,
        })
      );
      if (document.body.offsetWidth < 1024) {
        dispatch(usedModelsActions.panelState(false));
      }
    }
  };

  const closeImageHandler = (e) => {
    const hash = e.target.closest(`.${classes["ref-images__item"]}`).dataset.id;

    if (hash) {
      dispatch(removeImageFromPanel(hash));
    }
  };

  const numberOfRows = Math.ceil(
    usedImages?.length / SETTINGS_REF_IMAGE_ROW_LENGTH
  );

  const imageList = numberOfRows
    ? [...Array(numberOfRows).keys()].map((row, indexRow) => {
        return (
          <motion.ul
            layout
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
            key={indexRow}
            className={classes["ref-images"]}
          >
            {[...Array(SETTINGS_REF_IMAGE_ROW_LENGTH).keys()].map(
              (__, index) => {
                const i = indexRow * SETTINGS_REF_IMAGE_ROW_LENGTH + index;
                const nsfw =
                  usedImages[i]?.nsfw === false ||
                  usedImages[i]?.nsfw === "None" ||
                  usedImages[i]?.nsfwLevel === sfwValue ||
                  usedImages[i]?.nsfwLevel === 1
                    ? false
                    : true;
                if (!!usedImages[i]?.hash) {
                  return (
                    <motion.li
                      key={usedImages[i]?.hash}
                      layoutId={`ref-${usedImages[i]?.hash}`}
                      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
                      animate={ANIMATIONS_FM_SLIDEIN}
                      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
                      className={classes["ref-images__item"]}
                      data-id={usedImages[i]?.hash}
                    >
                      <Image
                        src={usedImages[i].url}
                        alt={`Reference image ${i}`}
                        onClick={openImageHandler}
                        className={`${
                          !nsfwMode && nsfw ? classes["ref-images__nsfw"] : ""
                        }`}
                        imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
                      />
                      <span
                        className={classes.close}
                        onClick={closeImageHandler}
                      >
                        <CrossSvg />
                      </span>
                    </motion.li>
                  );
                } else {
                  return (
                    <li
                      key={`s${i}`}
                      className={classes["ref-images__item--def"]}
                    >
                      <ImageSvg />
                    </li>
                  );
                }
              }
            )}
          </motion.ul>
        );
      })
    : [];

  return (
    <motion.div
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
    >
      {imageList}
    </motion.div>
  );
};

export default ReferenceImageList;
