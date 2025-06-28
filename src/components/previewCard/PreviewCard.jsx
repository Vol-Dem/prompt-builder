import { useEffect, useRef, useState } from "react";
import classes from "./PreviewCard.module.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Image from "../ui/image/Image";
import ActivationTag from "../activation-tag/ActivationTag";
import ButtonSquareAdd from "../ui/ButtonSquareAdd";
import { motion } from "framer-motion";
import { SETTINGS_IMAGE_PREVIEW_WIDTH_BIG } from "../../variables/constants";

const PreviewCard = ({ previewData, onClick, layout, fullView = false }) => {
  const [currVersion, setCurrVersion] = useState({});
  const [currSidePanelData, setCurrSidePanelData] = useState({});
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const isMobile = useSelector((state) => state.general.isMobile);
  const categoriesData = useSelector((state) => state.images.categories);
  const imageCategoryData = categoriesData.find(
    (category) => category.id === previewData?.category
  );
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
      src: previewData?.src || null,
      main: previewData?.main || null,
      sub: previewData?.sub || null,
      title: previewData.name || previewData.title || null,
      versionName: curVersionData?.name || null,
      imgUrl: previewData?.imgUrl || null,
      nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl || null,
      type: previewData?.modelType || previewData?.type || null,
      baseModel: curVersionData?.baseModel || previewData?.baseModel || null,
      mainTag: curVersionData?.mainTag || previewData?.mainTag || null,
      weight: curVersionData?.weight || previewData?.weight || null,
      minWeight: curVersionData?.minWeight || previewData?.minWeight || null,
      maxWeight: curVersionData?.maxWeight || previewData?.maxWeight || null,
      size: curVersionData?.size || previewData?.size || null,
      tags:
        curVersionData?.trainedWords || curVersionData?.trainedWords || null,
      helperTags: curVersionData?.helperTags || previewData?.helperTags || null,
      updatedAt: previewData?.updatedAt || null,
    };
    setCurrSidePanelData(sidePanelData);
  }, [previewData, isNsfwMode]);

  return (
    <motion.div
      layoutId={layout && !isMobile ? previewData.id : Math.random()}
      whileHover={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
      transition={{
        layout: { duration: 0 },
      }}
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
        <Link
          to={
            previewData?.type === "collection"
              ? `/images/${previewData.id}`
              : `/models/${previewData.id}`
          }
          onClick={onClick}
        >
          <div
            className={`${classes["type"]} ${classes["type--position"]} ${
              fullView ? classes.hidden : ""
            }`}
          >
            {previewData.type}
          </div>
          <Image
            ref={imgRef}
            src={
              isNsfwMode
                ? previewData.nsfwPreviewImgUrl ||
                  previewData.customPreviewImgUrl ||
                  previewData.imgUrl
                : previewData.customPreviewImgUrl || previewData.imgUrl
            }
            type={
              isNsfwMode
                ? previewData?.nsfwPreviewImgType || previewData.imgType
                : previewData?.customPreviewImgType || previewData.imgType
            }
            alt="Preview"
            imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_BIG}
            className={true ? classes["card__image"] : ""}
          />
          {!fullView && (
            <div className={classes["card__content"]}>
              <ul className={classes["models"]}>
                {previewData?.baseModels?.map((model, i) => (
                  <li key={i} className={classes["models__item"]}>
                    {model}
                  </li>
                )) || (
                  <li className={classes["models__item"]}>
                    {currVersion?.baseModel ||
                      previewData?.baseModel ||
                      imageCategoryData?.name}
                  </li>
                )}
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
              to={
                previewData?.type === "collection"
                  ? `/images/${previewData.id}`
                  : `/models/${previewData.id}`
              }
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
