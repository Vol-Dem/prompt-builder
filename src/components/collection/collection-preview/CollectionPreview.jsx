import { useRef, useState } from "react";
import Image from "../../ui/image/Image";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_BIG } from "../../../variables/constants";
import { Link } from "react-router-dom";
import classes from "./CollectionPreview.module.scss";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const CollectionPreview = ({ previewData, layout, onClick }) => {
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const isMobile = useSelector((state) => state.general.isMobile);
  const imgRef = useRef();

  return (
    <motion.div
      layoutId={layout && !isMobile ? previewData.id : Math.random()}
      whileHover={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
      transition={{
        layout: { duration: 0 },
      }}
      id={previewData?.id}
      className={`${classes.card} ${layout ? classes["card--motion"] : ""}`}
    >
      <div className={classes["image-container"]}>
        <Link to={`/images/${previewData.id}`} onClick={onClick}>
          <Image
            ref={imgRef}
            src={
              isNsfwMode
                ? previewData?.nsfwPreviewImgUrl ||
                  previewData?.customPreviewImgUrl ||
                  previewData?.imgUrl
                : previewData?.customPreviewImgUrl || previewData?.imgUrl
            }
            alt="Preview"
            imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_BIG}
            className={true ? classes["card__image"] : ""}
          />

          <div className={classes["card__content"]}>
            <h4
              className={classes.title}
              title={previewData.name || previewData.title}
            >
              {previewData.name || previewData.title}
            </h4>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default CollectionPreview;
