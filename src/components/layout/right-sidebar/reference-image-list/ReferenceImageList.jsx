import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import classes from "./ReferenceImageList.module.scss";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
  SETTINGS_REF_IMAGE_ROW_LENGTH,
} from "../../../../variables/constants";
import Image from "../../../ui/image/Image";
import CrossSvg from "../../../../assets/CrossSvg";
import ImageSvg from "../../../../assets/ImageSvg";
import { modelActions } from "../../../../store/model";
import {
  removeImageFromPanel,
  usedModelsActions,
} from "../../../../store/usedModels";
import { clearFileExtension } from "../../../../utils/generalUtils";

/**
 * Displays a list of reference images with the option to open or remove them from the list.
 * Blurs nsfw images if they are not in active nsfw range
 *
 * @component
 *
 * @param {object} props
 * @param {array} props.usedImages - Array of sidebar images.
 *
 * @returns {JSX.Element} The list of reference images.
 */
const ReferenceImageList = ({ usedImages }) => {
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const sfwValue = useSelector((state) => state.general.sfwValue);
  const dispatch = useDispatch();

  const openImageHandler = (e) => {
    const id = e.target.closest(`.${classes["ref-images__item"]}`).dataset.id;
    const image = usedImages.find((image) => image.id === +id);

    if (image) {
      dispatch(
        modelActions.setActiveCarouselData({
          images: [image],
          postId: image.postId,
          saved: true,
          side: true,
        })
      );
      if (document.body.offsetWidth < 1024) {
        dispatch(usedModelsActions.panelState(false));
      }
    }
  };

  const removeImageHandler = (hash, url) => {
    dispatch(removeImageFromPanel(hash, url));
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
                if (usedImages[i]?.hash) {
                  const uniqUrlPart =
                    clearFileExtension(usedImages[i]?.url?.split("/").pop()) ||
                    i;
                  const key =
                    usedImages[i].type === "video"
                      ? uniqUrlPart
                      : usedImages[i]?.hash;

                  return (
                    <motion.li
                      key={key}
                      layoutId={`ref-${key}`}
                      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
                      animate={ANIMATIONS_FM_SLIDEIN}
                      exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
                      className={classes["ref-images__item"]}
                      data-id={usedImages[i]?.id}
                    >
                      <Image
                        src={usedImages[i].url}
                        imgType={usedImages[i].type}
                        alt={`Reference image ${i}`}
                        onClick={openImageHandler}
                        className={`${classes["ref-images__image"]} ${
                          !nsfwMode && nsfw ? classes["ref-images__nsfw"] : ""
                        }`}
                        imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
                      />
                      <span
                        className={classes.close}
                        onClick={() =>
                          removeImageHandler(
                            usedImages[i]?.hash,
                            usedImages[i].url
                          )
                        }
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
