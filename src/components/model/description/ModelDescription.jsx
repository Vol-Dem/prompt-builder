import React from "react";
import classes from "./ModelDescription.module.scss";

const ModelDescription = ({ mainTag, versionData }) => {
  return (
    <div className={classes["info-container"]}>
      <div className={classes.info}>
        <div>{model?.data.type}</div>
        <div>Base model: {versionData.baseModel}</div>
        <div>Size: {model?.size}</div>
        <div>Weight: {model?.weight}</div>
        <div>Version: {versionData.name}</div>
        {model?.clipSkip && <div>Clip Skip: {model?.clipSkip}</div>}
      </div>
      <div className={classes["tags"]}>
        <div>Main tag:</div>
        <ul className={classes["main-tag"]}>
          <Tag tag={mainTag} />
        </ul>
        {!!versionData.trainedWords.length && (
          <>
            <div>Trigger Words:</div>
            <TagList subcat={versionData.trainedWords} />
          </>
        )}
        {model?.helperTags && (
          <>
            <div>Helper Words:</div>
            <TagList subcat={model?.helperTags} />
          </>
        )}
        {model?.negativeTags && (
          <>
            <div>Negative Words:</div>
            <TagList subcat={model?.negativeTags} />
          </>
        )}
      </div>
    </div>
  );
};

export default ModelDescription;
