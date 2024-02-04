import React, { useEffect, useRef, useState } from "react";
import classes from "./PreviewCard.module.scss";
import Tag from "../tag/Tag";
import { ReactComponent as StarImg } from "../../assets/star.svg";
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
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  // const [taglistItemHeight, setTaglistItemHeight] = useState(null);
  // const [taglistHeight, setTaglistHeight] = useState(null);
  const navigate = useNavigate();
  const tagsRef = useRef();
  const tagsListRef = useRef();
  const helperTagsRef = useRef();
  const imgRef = useRef();
  // const taglistItemHeight = tagsListRef?.current?.offsetHeight;
  const taglistItemHeight = 34;
  // console.log(previewData);

  useEffect(() => {
    const currVersionData = Object.values(
      previewData.modelVersionsCustomData
    ).filter((data) => data.downloadStatus);
    console.log(currVersionData);
    if (currVersionData?.length) setCurrVersion(currVersionData[0]);
  }, []);

  useEffect(() => {
    const taglistHeight = tagsRef?.current?.clientHeight;
    if (taglistHeight) setTaglistHeight(taglistHeight);
  }, [tagsRef, panelIsOpen, previewData]);

  // console.log(taglistItemHeight, taglistHeight);
  // console.log(
  //   previewData.title,
  //   tagsRef?.current?.clientHeight > tagsListRef?.current?.offsetHeight,
  //   tagsRef?.current?.clientHeight,
  //   tagsListRef?.current?.offsetHeight
  // );
  // useEffect(() => {
  //   setTaglistItemHeight(tagsListRef?.current?.offsetHeight);
  //   setTaglistHeight(tagsRef?.current?.clientHeight);
  // }, [tagsListRef, tagsRef]);

  // const test = () => {
  //   console.log(
  //     previewData.title,
  //     tagsRef?.current?.clientHeight > tagsListRef?.current?.offsetHeight,
  //     tagsRef?.current?.clientHeight,
  //     tagsListRef?.current?.offsetHeight,
  //     tagsRef,
  //     tagsListRef,
  //     tagsRef?.current?.clientHeight === tagsListRef?.current?.offsetHeight
  //   );
  // };

  useEffect(() => {
    // console.log("CARD");
    // console.log(imgRef.current.complete);
    // console.log(imgRef.current.complete);
    if (!imgRef.current.complete) setImgIsLoading(true);
  }, []);

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
    // setHelperTagsIsOpen((prev) => !prev);

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
    // console.log(tagsRef.current.clientHeight, tagsListRef.current.offsetHeight);
    // console.log(tagsRef.current, tagsListRef);

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
    navigate(`model/${modelId}`, { state: { type: previewData.type } });
    console.log(previewData);
    // console.log(modelId);
  };

  const imgLoadingHandler = () => {
    console.log("LOAD");
    setImgIsLoading(false);
  };

  const imgErrorHandler = () => {
    console.log("ERR");
    // setImgIsLoading(false);
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
      {/* <div className={classes.img} onClick={openLoraHandler}>
        <span className={classes.type}>{previewData.type}</span>

        <img
          ref={imgRef}
          src={
            isNsfwMode
              ? previewData.nsfwPreviewImgUrl ||
                previewData.customPreviewImgUrl ||
                previewData.imgUrl
              : previewData.customPreviewImgUrl || previewData.imgUrl
          }
          alt="Preview"
          onLoad={imgLoadingHandler}
          onError={imgErrorHandler}
          className={`${imgIsLoading ? classes["img--hidden"] : ""}`}
        />


        {imgIsLoading && (
          <div className={classes.preloader}>
            <StarImg />
          </div>
        )}
      </div> */}
      <div
        className={`${classes.content} ${
          helperTagsIsOpen ? classes["content--open"] : ""
        } `}
      >
        <h4 className={classes.title} onClick={openLoraHandler}>
          {previewData.title}
        </h4>
        <div className={classes.info}>
          <span>M: {previewData.baseModel}</span>
          <span>W: {previewData.weight}</span>
          <span>S: {previewData.size}</span>
        </div>
        <div className={classes["main-tag"]}>
          Version: {currVersion.versionName}
        </div>
        <div className={classes["main-tag"]}>File: {currVersion.fileName}</div>
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
          {previewData.tags.length !== 0 && (
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
        {previewData.helperTags.length !== 0 && (
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
      {/* <button onClick={test}>test</button> */}
    </div>
  );
};

export default PreviewCard;
