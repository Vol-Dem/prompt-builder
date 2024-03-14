import React, { useEffect, useRef, useState } from "react";
import classes from "./PreviewCard.module.scss";
import Tag from "../tag/Tag";
// import { ReactComponent as StarImg } from "../../assets/star.svg";
import { useNavigate } from "react-router-dom";
import TagList from "../tag-list/TagList";
import { useSelector } from "react-redux";
import Image from "../ui/image/Image";

const PreviewCard = ({ previewData }) => {
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const [tagsHeight, setTagsHeight] = useState(null);
  const [currVersion, setCurrVersion] = useState({});
  const [taglistHeight, setTaglistHeight] = useState(null);
  const [helperTagsIsOpen, setHelperTagsIsOpen] = useState(false);
  const [helpertagsHeight, setHelperTagsHeight] = useState(null);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const navigate = useNavigate();
  const tagsRef = useRef();
  const tagsListRef = useRef();
  const helperTagsRef = useRef();
  const imgRef = useRef();
  // const taglistItemHeight = tagsListRef?.current?.offsetHeight;
  const taglistItemHeight = 34;

  useEffect(() => {
    const currVersionData =
      previewData?.modelVersionsCustomData &&
      Object.values(previewData.modelVersionsCustomData).filter(
        (data) => data.downloadStatus
      );
    if (currVersionData?.length) setCurrVersion(currVersionData[0]);
  }, [previewData]);

  useEffect(() => {
    const taglistHeight = tagsRef?.current?.clientHeight;
    if (taglistHeight) setTaglistHeight(taglistHeight);
  }, [tagsRef, panelIsOpen, previewData]);

  useEffect(() => {
    if (taglistHeight === taglistItemHeight) setTagsHeight(taglistItemHeight);
    if (tagsIsOpen) setTagsHeight(taglistHeight);
    if (helperTagsIsOpen)
      setHelperTagsHeight(helperTagsRef.current.clientHeight);
  }, [
    previewData,
    taglistHeight,
    taglistItemHeight,
    panelIsOpen,
    tagsIsOpen,
    helperTagsIsOpen,
  ]);

  const openHelperTagsHandler = () => {
    setHelperTagsIsOpen((prev) => {
      if (prev) {
        setHelperTagsHeight(0);
        if (tagsHeight > 300)
          imgRef.current.scrollIntoView({
            behavior: "smooth",
          });
      } else {
        setHelperTagsHeight(helperTagsRef.current.clientHeight);
      }
      return !prev;
    });
  };

  const openTagsHandler = () => {
    setTagsIsOpen((prev) => {
      if (prev) {
        setTagsHeight(null);
        if (tagsHeight > 300)
          imgRef.current.scrollIntoView({
            behavior: "smooth",
          });
      } else {
        setTagsHeight(taglistHeight);
      }
      return !prev;
    });
  };

  const openLoraHandler = (e) => {
    const modelId = e.target.closest(`.card`).id;
    navigate(`model/${modelId}`);
  };

  return (
    <div id={previewData.id} className={`${classes.card} card`}>
      <Image
        onClick={openLoraHandler}
        type={previewData.type}
        ref={imgRef}
        src={
          isNsfwMode
            ? previewData.nsfwPreviewImgUrl ||
              previewData.customPreviewImgUrl ||
              previewData.imgUrl
            : previewData.customPreviewImgUrl || previewData.imgUrl
        }
        alt="Preview"
      />
      <div
        className={`${classes.content} ${
          helperTagsIsOpen ? classes["content--open"] : ""
        } `}
      >
        <h4 className={classes.title} onClick={openLoraHandler}>
          {previewData.name || previewData.title}
        </h4>
        <div className={classes.info}>
          <span>M: {previewData.baseModel}</span>
          <span>W: {previewData.weight}</span>
          <span>S: {previewData.size}</span>
        </div>
        <div className={classes["main-tag"]}>
          Version: {currVersion.versionName}
        </div>
        <div className={classes["main-tag"]}>
          File: {currVersion.fileName || previewData.fileName}
        </div>
        {previewData.mainTag && (
          <ul className={classes["main-tag"]}>
            Triger:
            <Tag
              tag={previewData.mainTag}
              promptType="positive"
              modelData={previewData}
            />
          </ul>
        )}
        <div className={classes["tags-container"]}>
          {previewData?.tags?.length !== 0 && (
            <>
              <span>Tags: </span>
              <div
                className={`${classes.tags}`}
                style={tagsHeight ? { height: `${tagsHeight}px` } : {}}
              >
                <div
                  ref={tagsRef}
                  className={`${classes["tags__list"]} ${
                    taglistHeight > taglistItemHeight ? classes.shadow : ""
                  }`}
                >
                  <TagList
                    ref={tagsListRef}
                    tags={previewData.tags}
                    promptType="positive"
                  />
                </div>
              </div>
              {taglistHeight > taglistItemHeight && (
                <button
                  className={`${classes["tags__btn"]} ${
                    !tagsIsOpen ? classes["tags__btn--closed"] : ""
                  }`}
                  onClick={openTagsHandler}
                >
                  {tagsIsOpen ? "A" : "V"}
                </button>
              )}
            </>
          )}
        </div>
        {previewData?.helperTags?.length !== 0 && (
          <>
            <div
              className={`${classes[["helper-tags"]]} ${
                helperTagsIsOpen ? classes["helper-tags--open"] : ""
              }`}
              style={
                helpertagsHeight ? { height: `${helpertagsHeight}px` } : {}
              }
            >
              <div ref={helperTagsRef} className={classes["helper-tags__list"]}>
                <span>Helper tags:</span>
                <TagList tags={previewData.helperTags} promptType="positive" />
              </div>
            </div>
            <button
              className={classes.btn}
              type="button"
              onClick={openHelperTagsHandler}
            >
              {`${helperTagsIsOpen ? "Hide" : "Show"} helper tags`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewCard;
