import React, { useEffect, useRef, useState } from "react";
import classes from "./PreviewCard.module.scss";
// import Tag from "../tag/Tag";
// import { ReactComponent as StarImg } from "../../assets/star.svg";
import { useNavigate } from "react-router-dom";
// import TagList from "../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import Image from "../ui/image/Image";
import { addModelToPanel } from "../../store/usedModels";
import ActivationTag from "../activation-tag/ActivationTag";

const PreviewCard = ({ previewData }) => {
  // const [tagsIsOpen, setTagsIsOpen] = useState(false);
  // const [tagsHeight, setTagsHeight] = useState(null);
  const [currVersion, setCurrVersion] = useState({});
  const [currSidePanelData, setCurrSidePanelData] = useState({});
  // const [taglistHeight, setTaglistHeight] = useState(null);
  // const [helperTagsIsOpen, setHelperTagsIsOpen] = useState(false);
  // const [helpertagsHeight, setHelperTagsHeight] = useState(null);
  const dispatch = useDispatch();
  // const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const navigate = useNavigate();
  // const tagsRef = useRef();
  // const tagsListRef = useRef();
  // const helperTagsRef = useRef();
  const imgRef = useRef();
  // const taglistItemHeight = tagsListRef?.current?.offsetHeight;
  // const taglistItemHeight = 34;

  useEffect(() => {
    let curVersionData =
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

  // useEffect(() => {
  //   const taglistHeight = tagsRef?.current?.clientHeight;
  //   if (taglistHeight) setTaglistHeight(taglistHeight);
  // }, [tagsRef, panelIsOpen, previewData]);

  // useEffect(() => {
  //   if (taglistHeight === taglistItemHeight) setTagsHeight(taglistItemHeight);
  //   if (tagsIsOpen) setTagsHeight(taglistHeight);
  //   if (helperTagsIsOpen)
  //     setHelperTagsHeight(helperTagsRef.current.clientHeight);
  // }, [
  //   previewData,
  //   taglistHeight,
  //   taglistItemHeight,
  //   panelIsOpen,
  //   tagsIsOpen,
  //   helperTagsIsOpen,
  // ]);

  // const openHelperTagsHandler = () => {
  //   setHelperTagsIsOpen((prev) => {
  //     if (prev) {
  //       setHelperTagsHeight(0);
  //       if (tagsHeight > 300)
  //         imgRef.current.scrollIntoView({
  //           behavior: "smooth",
  //         });
  //     } else {
  //       setHelperTagsHeight(helperTagsRef.current.clientHeight);
  //     }
  //     return !prev;
  //   });
  // };

  // const openTagsHandler = () => {
  //   setTagsIsOpen((prev) => {
  //     if (prev) {
  //       setTagsHeight(null);
  //       if (tagsHeight > 300)
  //         imgRef.current.scrollIntoView({
  //           behavior: "smooth",
  //         });
  //     } else {
  //       setTagsHeight(taglistHeight);
  //     }
  //     return !prev;
  //   });
  // };

  const openLoraHandler = (e) => {
    const modelId = e.target.closest(`.card`).id;
    navigate(`model/${modelId}`);
  };

  const addToSidePanelHandler = () => {
    dispatch(addModelToPanel(currSidePanelData));
  };

  return (
    <div id={previewData.id} className={`${classes.card} card`}>
      <span className={classes["btn-add"]} onClick={addToSidePanelHandler}>
        +
      </span>
      <Image
        onClick={openLoraHandler}
        // type={previewData.type}
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
        className={`${classes.content}`}
        // className={`${classes.content} ${
        //   helperTagsIsOpen ? classes["content--open"] : ""
        // } `}
      >
        <h4 className={classes.title} onClick={openLoraHandler}>
          {previewData.name || previewData.title}
        </h4>
        <div className={classes.info}>
          <span className={classes.type}>{previewData.type}</span>
          <span>
            M: (
            {previewData?.baseModels?.join(", ") ||
              currVersion?.baseModel ||
              previewData?.baseModel}
            )
          </span>
          <span>
            W: {currVersion?.minWeight || previewData?.minWeight} -{" "}
            {currVersion?.maxWeight || previewData?.maxWeight}
          </span>
          {!currVersion?.minWeight && !previewData?.minWeight && (
            <span>W: {currVersion?.weight || previewData?.weight}</span>
          )}
          {/* <span>S: {currVersion?.size || previewData?.size}</span> */}
        </div>
        {currVersion?.versionName && (
          <div className={classes["main-tag"]}>
            Version: {currVersion.versionName}
          </div>
        )}
        <div className={classes["main-tag"]}>
          File: {currVersion?.fileName || previewData?.fileName}
        </div>
        {(currVersion?.mainTag || previewData?.mainTag) && (
          <ul className={classes["main-tag"]}>
            {/* Activation tag: */}
            <ActivationTag
              tag={currVersion.mainTag || previewData.mainTag}
              modelData={currSidePanelData}
              strength={currVersion.weight || previewData.weight}
            />
          </ul>
        )}
        {/* <div className={classes["tags-container"]}>
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
        </div> */}
        {/* {previewData?.helperTags?.length !== 0 && (
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
        )} */}
      </div>
    </div>
  );
};

export default PreviewCard;
