import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import classes from "./PreviewCardContent.module.scss";
import Image from "../../ui/image/Image";
import ButtonSquareAdd from "../button-square-add/ButtonSquareAdd";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_BIG } from "../../../variables/constants";
import ResourceTypeLabel from "../../ui/text/ResourceTypeLabel";
import PreviewCardExpanded from "./preview-card-expanded/PreviewCardExpanded";
import PreviewCardShort from "./preview-card-short/PreviewCardShort";
import { useAppSelector } from "../../../store/hooks/hooks";
import type {
  CollectionPreviewDoc,
  ModelPreview,
  ModelPreviewDoc,
} from "../../../../shared/types/firestore";
import type { ModelVersionCustomData } from "../../../../shared/types/model";
import type { SrcType } from "../../../types/models.types";

type PreviewCardContentProps = {
  previewData: ModelPreviewDoc | CollectionPreviewDoc | ModelPreview;
  fullView?: boolean;
  animate?: boolean;
};

/**
 * Animated preview card component.
 *
 * Renders a model or collection preview card with support
 * for short and expanded layouts and the ability to add the card to the right sidebar.
 * Renders different image previw dependent on nsfw mode.
 *
 * @component
 *
 * @param props
 * @param props.previewData - Data used to render the preview card.
 * @param props.fullView - Whether to display the expanded card layout.
 * @param props.animate - Whether card will have Framer Motion layout ID for shared layout animations.
 *
 * @returns The animated preview card component.
 */
const PreviewCardContent = ({
  previewData,
  fullView,
  animate,
}: PreviewCardContentProps) => {
  const isNsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const isMobile = useAppSelector((state) => state.general.isMobile);
  const imgRef = useRef<HTMLImageElement>(null);
  let imageSrc;
  let imageType: SrcType | undefined = undefined;

  if (isNsfwMode) {
    imageSrc =
      previewData.nsfwPreviewImgUrl ||
      previewData.customPreviewImgUrl ||
      ("imgUrl" in previewData && previewData.imgUrl) ||
      "";
  } else {
    imageSrc =
      previewData.customPreviewImgUrl ||
      ("imgUrl" in previewData && previewData.imgUrl) ||
      "";
  }

  if ("imgType" in previewData) {
    imageType = isNsfwMode
      ? previewData?.nsfwPreviewImgType || previewData.imgType
      : previewData?.customPreviewImgType || previewData.imgType;
  }

  const currVersion = useMemo<ModelVersionCustomData | null>(() => {
    return (
      ("modelVersionsCustomData" in previewData &&
        previewData?.modelVersionsCustomData &&
        Object.values(previewData.modelVersionsCustomData)
          .filter((data) => data.downloadStatus)
          .toSorted((a, b) => b.versionId - a.versionId)[0]) ||
      null
    );
  }, [previewData]);

  return (
    <motion.div
      layoutId={animate && !isMobile ? previewData.id + "" : undefined}
      whileHover={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
      transition={{
        layout: { duration: 0 },
      }}
      id={previewData.id + ""}
      className={`${classes.card} ${fullView ? classes["card__full"] : ""} ${
        animate ? classes["card--motion"] : ""
      }`}
    >
      <div className={classes["image-container"]}>
        <ButtonSquareAdd
          resourceType={previewData?.type || "model"}
          previewData={previewData}
          className={classes["btn-add"]}
        />
        <Link
          to={`/${previewData?.type === "collection" ? "images" : "models"}/${previewData.id}`}
        >
          {previewData.type && (
            <ResourceTypeLabel
              type={previewData.type}
              className={`${classes["type-position"]} ${
                fullView ? classes.hidden : ""
              }`}
            >
              {previewData.type}
            </ResourceTypeLabel>
          )}
          <Image
            ref={imgRef}
            src={imageSrc}
            type={imageType}
            imgType={imageType}
            alt="Preview"
            imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_BIG}
            className={classes["card__image"]}
          />
          {!fullView && <PreviewCardShort previewData={previewData} />}
        </Link>
      </div>
      {fullView && (
        <PreviewCardExpanded
          previewData={previewData}
          currVersion={currVersion}
        />
      )}
    </motion.div>
  );
};

export default PreviewCardContent;
