import { useMemo } from "react";
import { Link } from "react-router-dom";

import classes from "./PreviewCardExpanded.module.scss";
import ResourceTypeLabel from "../../general-elements/ResourceTypeLabel";
import ActivationTag from "../../activation-tag/ActivationTag";

const PreviewCardExpanded = ({ previewData, currVersion, onClick }) => {
  const currSidePanelData = useMemo(() => {
    return {
      id: previewData?.id,
      src: previewData?.src || null,
      main: previewData?.main || null,
      sub: previewData?.sub || null,
      title: previewData.name || previewData.title || null,
      versionName: currVersion?.name || null,
      imgUrl: previewData?.imgUrl || null,
      nsfwPreviewImgUrl: previewData?.nsfwPreviewImgUrl || null,
      type: previewData?.modelType || previewData?.type || null,
      baseModel: currVersion?.baseModel || previewData?.baseModel || null,
      mainTag: currVersion?.mainTag || previewData?.mainTag || null,
      weight: currVersion?.weight || previewData?.weight || null,
      minWeight: currVersion?.minWeight || previewData?.minWeight || null,
      maxWeight: currVersion?.maxWeight || previewData?.maxWeight || null,
      size: currVersion?.size || previewData?.size || null,
      tags: currVersion?.trainedWords || currVersion?.trainedWords || null,
      helperTags: currVersion?.helperTags || previewData?.helperTags || null,
      updatedAt: previewData?.updatedAt || null,
    };
  }, [currVersion, previewData]);

  return (
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
      <ResourceTypeLabel>
        {previewData.type === "TextualInversion"
          ? "Embedding"
          : previewData.type}
      </ResourceTypeLabel>
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
          <span className={classes["text-secondary"]}>{currVersion.name}</span>
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
  );
};

export default PreviewCardExpanded;
