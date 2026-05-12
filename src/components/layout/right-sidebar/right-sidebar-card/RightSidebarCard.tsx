import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import ResourceTypeLabel from "../../../ui/text/ResourceTypeLabel";
import RightSidebarCardExpanded from "../right-sidebar-card-expanded/RightSidebarCardExpanded";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import type { SidebarPreviewData } from "../../../../types/general.types";

type RightSidebarCardProps = {
  previewData: SidebarPreviewData;
  fullView: boolean;
  layoutId?: string;
};

/**
 * Animated right sidebar card component.
 *
 * Renders a model or collection preview card inside the right sidebar with support
 * for short and expanded layouts and the ability to remove the card from the panel.
 *
 * @component
 *
 * @param props
 * @param props.previewData - Data used to render the preview card.
 * @param props.fullView - Whether to display the expanded card layout.
 * @param props.layoutId - Optional Framer Motion layout ID for shared layout animations.
 *
 * @returns The animated right sidebar card component.
 */
const RightSidebarCard = memo(
  ({ previewData, fullView, layoutId }: RightSidebarCardProps) => {
    const [cardIsHidden, setCardIsHidden] = useState(false);
    const isNsfwMode = useAppSelector((state) => state.general.nsfwMode);
    const dispatch = useAppDispatch();
    const imageSrc = isNsfwMode
      ? previewData.imgUrlNsfw || previewData.imgUrl
      : previewData.imgUrl;

    useEffect(() => {
      setTimeout(() => {
        setCardIsHidden(true);
      }, 1000);
    }, []);

    const closeCardHandler = () => {
      dispatch(removeModelFromPanel(previewData.id));
    };

    const closePanelHandler = () => {
      dispatch(modelActions.setActiveCarouselData(null));
      if (document.body.offsetWidth < 1024) {
        dispatch(usedModelsActions.panelState(false));
      }
    };

    return (
      <motion.div
        layout
        layoutId={layoutId || undefined}
        initial={{ opacity: 0, y: 30 }}
        animate={
          !layoutId ? { opacity: [0, 0, 0, 1], y: 0 } : { opacity: 1, y: 0 }
        }
        exit={{ opacity: 0, y: 30 }}
        id={previewData.id + ""}
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
                : `/models/${previewData.id}${previewData.versionId ? `?versionId=${previewData.versionId}` : ""}`
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
                <h4 className={classes.title} title={previewData.title}>
                  {previewData.title}
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
                type={previewData.type}
                className={classes["type"]}
              >
                {previewData.type}
              </ResourceTypeLabel>
              {previewData?.baseModel && (
                <span className={classes["base-info__item"]}>
                  {previewData.baseModel}
                </span>
              )}
            </div>
          </div>
          <button
            title="Close"
            type="button"
            className={classes["btn__close"]}
            onClick={closeCardHandler}
          >
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
  },
);

export default RightSidebarCard;
