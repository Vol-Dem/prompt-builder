import React from "react";
import classes from "./ModelTags.module.scss";
import Tag from "../../tag/Tag";
import TagList from "../../tag-list/TagList";
import { useSelector } from "react-redux";

const ModelTags = ({ customData, modelPreview }) => {
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const tagSets = customData?.tagSetsData || model?.tagSetsData;

  const splitTags = (arr) => {
    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
    return arr.split(splitRegEx).flatMap((tag) => tag.trim() || []);
  };

  const tagSetsHtml = tagSets?.map((tagSet, i) => (
    <li key={i}>
      {tagSet.name}:{" "}
      {<TagList tags={splitTags(tagSet.value)} promptType="positive" />}
    </li>
  ));

  return (
    <div className={classes["tags"]}>
      <div>Main tag:</div>
      <ul className={classes["main-tag"]}>
        <Tag
          tag={customData?.mainTag || model?.mainTag}
          promptType="positive"
          modelData={modelPreview}
        />
      </ul>
      {(curVersion?.trainedWords || customData?.trainedWords) && (
        <>
          <div>Trigger Words:</div>
          <TagList
            tags={customData?.trainedWords || curVersion?.trainedWords}
            promptType="positive"
          />
        </>
      )}
      {(model?.helperTags || customData?.helperTags) && (
        <>
          <div>Helper Words:</div>
          <TagList
            tags={customData?.helperTags || model?.helperTags}
            promptType="positive"
          />
        </>
      )}
      {(model?.tagSetsData || customData?.tagSetsData) && (
        <>
          <div>Tag sets:</div>
          <ul className={classes["tag-sets__list"]}>{tagSetsHtml}</ul>
        </>
      )}
      {(model?.negativeTags || customData?.negativeTags) && (
        <>
          <div>Negative Words:</div>
          <TagList
            tags={customData?.negativeTags || model?.negativeTags}
            promptType="negative"
          />
        </>
      )}
    </div>
  );
};

export default ModelTags;
