import React, { useEffect, useRef, useState } from "react";
import classes from "./PreviewCard.module.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Image from "../ui/image/Image";
import ActivationTag from "../activation-tag/ActivationTag";
import ButtonSquareAdd from "../ui/ButtonSquareAdd";
import { motion } from "framer-motion";
import {
  ANIMATIONS_FM_HOVER_SCALE,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_TAP_SCALE,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
  SETTINGS_IMAGE_PREVIEW_WIDTH_CARD,
} from "../../variables/constants";

const PreviewCard = ({ previewData, onClick, layout, fullView = false }) => {
  const [currVersion, setCurrVersion] = useState({});
  const [currSidePanelData, setCurrSidePanelData] = useState({});
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const isMobile = useSelector((state) => state.general.isMobile);
  // const fullView = useSelector((state) => state.tabs.previewFullView);
  const imgRef = useRef();

  useEffect(() => {
    const curVersionData =
      previewData?.modelVersionsCustomData &&
      Object.values(previewData.modelVersionsCustomData)
        .filter((data) => data.downloadStatus)
        .toSorted((a, b) => b.versionId - a.versionId)[0];

    setCurrVersion(curVersionData);

    const sidePanelData = {
      id: previewData?.id,
      src: previewData?.src,
      main: previewData?.main,
      sub: previewData?.sub,
      title: previewData.name || previewData.title,
      versionName: curVersionData?.name,
      imgUrl: previewData?.imgUrl,
      nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl,
      type: previewData?.modelType,
      baseModel: curVersionData?.baseModel || previewData?.baseModel,
      mainTag: curVersionData?.mainTag || previewData?.mainTag,
      weight: curVersionData?.weight || previewData?.weight,
      minWeight: curVersionData?.minWeight || previewData?.minWeight,
      maxWeight: curVersionData?.maxWeight || previewData?.maxWeight,
      size: curVersionData?.size || previewData?.size,
      tags: curVersionData?.trainedWords || curVersionData?.trainedWords,
      helperTags: curVersionData?.helperTags || previewData?.helperTags,
      updatedAt: previewData?.updatedAt,
    };
    setCurrSidePanelData(sidePanelData);
  }, [previewData, isNsfwMode]);

  return (
    <motion.div
      layoutId={layout && !isMobile ? previewData.id : Math.random()}
      transition={{
        layout: { duration: 0 },
        // type: "spring",
      }}
      // whileHover={!fullView ? ANIMATIONS_FM_HOVER_SCALE : null}
      // whileTap={!fullView ? ANIMATIONS_FM_TAP_SCALE : null}
      // onHoverStart={() => console.log('hover started!')}
      id={previewData.id}
      className={`${classes.card} ${fullView ? classes["card__full"] : ""} ${
        layout ? classes["card--motion"] : ""
      }`}
    >
      <div className={classes["image-container"]}>
        <ButtonSquareAdd
          previewData={previewData}
          className={classes["btn-add"]}
        />
        <Link to={`/models/${previewData.id}`} onClick={onClick}>
          <Image
            ref={imgRef}
            src={
              isNsfwMode
                ? previewData.nsfwPreviewImgUrl ||
                  previewData.customPreviewImgUrl ||
                  previewData.imgUrl
                : previewData.customPreviewImgUrl || previewData.imgUrl
            }
            alt="Preview"
            imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_BIG}
            className={true ? classes["card__image"] : ""}
          />
          {!fullView && (
            <div className={classes["card__content"]}>
              {/* <div className={classes["models__item"]}>
                {previewData?.baseModels[0] ||
                  currVersion?.baseModel ||
                  previewData?.baseModel}
              </div> */}
              <ul className={classes["models"]}>
                {previewData?.baseModels?.map((model, i) => (
                  <li key={i} className={classes["models__item"]}>
                    {model}
                  </li>
                )) ||
                  currVersion?.baseModel ||
                  previewData?.baseModel}
              </ul>
              <h4
                className={classes.title}
                title={previewData.name || previewData.title}
              >
                {previewData.name || previewData.title}
              </h4>
            </div>
          )}
        </Link>
      </div>
      {fullView && (
        <div className={`${classes.content}`}>
          <div className={classes["title-container"]}>
            <Link
              to={`/models/${previewData.id}`}
              className={classes.link}
              onClick={onClick}
            >
              <h4
                className={classes.title}
                title={previewData.name || previewData.title}
              >
                {previewData.name || previewData.title}
              </h4>
            </Link>
          </div>
          <span className={classes.type}>
            {previewData.type === "TextualInversion"
              ? "Embedding"
              : previewData.type}
          </span>
          <div className={classes.info}>
            Model:{" "}
            <ul className={classes["models"]}>
              {previewData?.baseModels?.map((model, i) => (
                <li key={i} className={classes["models__item"]}>
                  {model}
                </li>
              )) ||
                currVersion?.baseModel ||
                previewData?.baseModel}
            </ul>
          </div>
          {currVersion?.versionName && (
            <div className={classes["text"]}>
              Version:{" "}
              <span className={classes["text-secondary"]}>
                {currVersion.name}
              </span>
            </div>
          )}
          {(currVersion?.fileName ||
            previewData?.fileName ||
            currVersion?.defFileName) && (
            <div className={classes["text"]}>
              File name:{" "}
              <span className={classes["text-secondary"]}>
                {currVersion?.fileName ||
                  previewData?.fileName ||
                  currVersion?.defFileName}
              </span>
            </div>
          )}
          {(currVersion?.mainTag ||
            previewData?.mainTag ||
            currVersion?.defActTag) && (
            <ul className={classes["main-tag"]}>
              <ActivationTag
                tag={
                  currVersion?.mainTag ||
                  previewData?.mainTag ||
                  currVersion?.defActTag
                }
                modelData={currSidePanelData}
                strength={currVersion?.weight || previewData?.weight}
              />
            </ul>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PreviewCard;
