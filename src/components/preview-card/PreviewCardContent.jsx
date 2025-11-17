import { useMemo, useRef } from "react";
import classes from "./PreviewCardContent.module.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Image from "../ui/image/Image";
import ButtonSquareAdd from "../ui/ButtonSquareAdd";
import { motion } from "framer-motion";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_BIG } from "../../variables/constants";
import ResourceTypeLabel from "../general-elements/ResourceTypeLabel";
import PreviewCardExpanded from "./preview-card-expanded/PreviewCardExpanded";
import PreviewCardShort from "./preview-card-short/PreviewCardShort";

const PreviewCardContent = ({ previewData, onClick, fullView, animate }) => {
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const isMobile = useSelector((state) => state.general.isMobile);
  const imgRef = useRef();
  const imageSrc = isNsfwMode
    ? previewData.nsfwPreviewImgUrl ||
      previewData.customPreviewImgUrl ||
      previewData.imgUrl
    : previewData.customPreviewImgUrl || previewData.imgUrl;
  const imageType = isNsfwMode
    ? previewData?.nsfwPreviewImgType || previewData.imgType
    : previewData?.customPreviewImgType || previewData.imgType;

  const currVersion = useMemo(() => {
    return (
      previewData?.modelVersionsCustomData &&
      Object.values(previewData.modelVersionsCustomData)
        .filter((data) => data.downloadStatus)
        .toSorted((a, b) => b.versionId - a.versionId)[0]
    );
  }, [previewData]);

  return (
    <motion.div
      layoutId={animate && !isMobile ? previewData.id : Math.random()}
      whileHover={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
      transition={{
        layout: { duration: 0 },
      }}
      id={previewData.id}
      className={`${classes.card} ${fullView ? classes["card__full"] : ""} ${
        animate ? classes["card--motion"] : ""
      }`}
    >
      <div className={classes["image-container"]}>
        <ButtonSquareAdd
          previewData={previewData}
          className={classes["btn-add"]}
        />
        <Link
          to={
            previewData?.type === "collection"
              ? `/images/${previewData.id}`
              : `/models/${previewData.id}`
          }
          onClick={onClick}
        >
          <ResourceTypeLabel
            type={previewData.type}
            className={`${classes["type-position"]} ${
              fullView ? classes.hidden : ""
            }`}
          >
            {previewData.type}
          </ResourceTypeLabel>
          <Image
            ref={imgRef}
            src={imageSrc}
            type={imageType}
            alt="Preview"
            imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_BIG}
            className={true ? classes["card__image"] : ""}
          />
          {!fullView && <PreviewCardShort previewData={previewData} />}
        </Link>
      </div>
      {fullView && (
        <PreviewCardExpanded
          previewData={previewData}
          currVersion={currVersion}
          onClick={onClick}
        />
      )}
    </motion.div>
  );
};

export default PreviewCardContent;
