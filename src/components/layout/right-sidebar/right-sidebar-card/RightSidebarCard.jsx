import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

import classes from "./RightSidebarCard.module.scss";
import {
  removeModelFromPanel,
  usedModelsActions,
} from "../../../../store/usedModels";
import Image from "../../../ui/image/Image";
import { modelActions } from "../../../../store/model";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_BIG } from "../../../../variables/constants";
import ResourceTypeLabel from "../../../general-elements/ResourceTypeLabel";
import RightSidebarCardExpanded from "../right-sidebar-card-expanded/RightSidebarCardExpanded";


const RightSidebarCard = memo(({ previewData, fullView, layoutId }) => {
  const [cardIsHidden, setCardIsHidden] = useState(false);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();
  const imageSrc = isNsfwMode
    ? previewData.nsfwPreviewImgUrl ||
      previewData.customPreviewImgUrl ||
      previewData.imgUrl
    : previewData.customPreviewImgUrl || previewData.imgUrl;

  useEffect(() => {
    setTimeout(() => {
      setCardIsHidden(true);
    }, 1000);
  }, []);

  const closeCardHandler = () => {
    dispatch(removeModelFromPanel(previewData.id));
  };

  const closePanelHandler = () => {
    dispatch(modelActions.setActiveCarouselData({}));
    if (document.body.offsetWidth < 1024) {
      dispatch(usedModelsActions.panelState(false));
    }
  };

  return (
    <motion.div
      layout
      layoutId={layoutId || null}
      initial={{ opacity: 0, y: 30 }}
      animate={
        !layoutId ? { opacity: [0, 0, 0, 1], y: 0 } : { opacity: 1, y: 0 }
      }
      exit={{ opacity: 0, y: 30 }}
      id={previewData.id}
      className={`${classes.card} card ${
        layoutId ? classes["card--motion"] : ""
      } 
      ${cardIsHidden ? classes["card--hidden"] : ""} 
      `}
    >
      <div className={classes.head}>
        <Link
          to={
            previewData.type === "collection"
              ? `/images/${previewData.id}`
              : `/models/${previewData.id}?versionId=${previewData.versionId}`
          }
          state={{ versionId: previewData?.activeVersionId || null }}
          className={classes.link}
          onClick={closePanelHandler}
        >
          <Image
            src={imageSrc}
            alt="Preview"
            imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_BIG}
            className={classes.image}
          />
        </Link>
        <div className={classes.info}>
          <div className={classes["title-container"]}>
            <Link
              to={
                previewData.type === "collection"
                  ? `/images/${previewData.id}`
                  : `/models/${previewData.id}`
              }
              state={{ versionId: previewData?.activeVersionId || null }}
              className={classes.link}
              onClick={closePanelHandler}
            >
              <h4
                className={classes.title}
                title={previewData.name || previewData.title}
              >
                {previewData.name || previewData.title}
              </h4>
            </Link>
          </div>
          {previewData?.versionName && (
            <div className={classes["version-name"]}>
              {previewData?.versionName}
            </div>
          )}
          <div className={classes["base-info"]}>
            <ResourceTypeLabel
              type={previewData.type || previewData.modelType}
              className={classes["type"]}
            >
              {previewData.type || previewData.modelType}
            </ResourceTypeLabel>
            {previewData?.baseModel && (
              <span className={classes["base-info__item"]}>
                {previewData.baseModel}
              </span>
            )}
          </div>
        </div>
        <button className={classes["btn__close"]} onClick={closeCardHandler}>
          <XMarkIcon />
        </button>
      </div>
      {fullView &&
        (previewData?.minWeight ||
          previewData?.mainTag ||
          !!previewData?.tags?.length) && (
          <RightSidebarCardExpanded previewData={previewData} />
        )}
    </motion.div>
  );
});

export default RightSidebarCard;
