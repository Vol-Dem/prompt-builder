import React, { useEffect, useRef, useState } from "react";
import classes from "./UsedCard.module.scss";
// import Tag from "../tag/Tag";
// import { ReactComponent as StarImg } from "../../assets/star.svg";
import { Link } from "react-router-dom";
import TagList from "../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import { removeModelFromPanel } from "../../store/usedModels";
import { promptActions } from "../../store/prompt";
import ActivationTag from "../activation-tag/ActivationTag";
import Arrow from "../ui/Arrow";
import Image from "../ui/image/Image";

const UsedCard = ({ previewData, fullView }) => {
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const [tagsHeight, setTagsHeight] = useState(null);
  const [taglistHeight, setTaglistHeight] = useState(null);
  // const [helperTagsIsOpen, setHelperTagsIsOpen] = useState(false);
  // const [helpertagsHeight, setHelperTagsHeight] = useState(null);
  // const [imgIsLoading, setImgIsLoading] = useState(false);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const tagsRef = useRef();
  const tagsListRef = useRef();
  // const helperTagsRef = useRef();
  const taglistItemHeight = 34;
  // const taglistHeight = tagsRef?.current?.clientHeight;
  // console.log(taglistHeight);

  // useEffect(() => {
  //   setImgIsLoading(true);
  // }, []);

  useEffect(() => {
    if (tagsRef?.current?.clientHeight)
      setTaglistHeight(tagsRef?.current?.clientHeight);
    if (taglistHeight === taglistItemHeight) setTagsHeight(taglistItemHeight);
  }, [
    previewData,
    taglistHeight,
    taglistItemHeight,
    tagsRef?.current?.clientHeight,
  ]);

  // const openHelperTagsHandler = () => {
  //   setHelperTagsIsOpen((prev) => {
  //     if (prev) {
  //       setHelperTagsHeight(0);
  //     } else {
  //       setHelperTagsHeight(helperTagsRef.current.clientHeight);
  //     }
  //     return !prev;
  //   });
  // };

  const openTagsHandler = () => {
    setTagsIsOpen((prev) => {
      if (prev) {
        setTagsHeight(null);
      } else {
        setTagsHeight(taglistHeight);
      }
      return !prev;
    });
  };

  // const openLoraHandler = (e) => {
  //   const modelId = e.target.closest(`.card`).id;
  //   navigate(`model/${modelId}`, { state: { type: previewData.type } });
  // };

  // const imgLoadingHandler = () => {
  //   setImgIsLoading(false);
  // };

  const closeCardHandler = () => {
    dispatch(removeModelFromPanel(previewData.id));
    dispatch(promptActions.removeTag(previewData.mainTag));
  };

  return (
    <li id={previewData.id} className={`${classes.card} card`}>
      <div className={classes.head}>
        <Link to={`/model/${previewData.id}`} className={classes.link}>
          <Image
            src={
              isNsfwMode
                ? previewData.nsfwPreviewImgUrl ||
                  previewData.customPreviewImgUrl ||
                  previewData.imgUrl
                : previewData.customPreviewImgUrl || previewData.imgUrl
            }
            alt="Preview"
            // className={`${imgIsLoading ? classes["img--hidden"] : ""}`}
          />
          {/* <div className={classes.img} onClick={openLoraHandler}>
            <img
              src={
                isNsfwMode
                  ? previewData.nsfwPreviewImgUrl ||
                    previewData.customPreviewImgUrl ||
                    previewData.imgUrl
                  : previewData.customPreviewImgUrl || previewData.imgUrl
              }
              alt="Preview"
              onLoad={imgLoadingHandler}
              className={`${imgIsLoading ? classes["img--hidden"] : ""}`}
            />
            {imgIsLoading && (
              <div className={classes.preloader}>
                <StarImg />
              </div>
            )}
          </div> */}
        </Link>
        <div className={classes.info}>
          <div className={classes["title-container"]}>
            <Link to={`/model/${previewData.id}`} className={classes.link}>
              <h4
                className={classes.title}
                title={previewData.name || previewData.title}
              >
                {previewData.name || previewData.title}
              </h4>
            </Link>
          </div>
          <div>
            <span className={classes.type}>{previewData.type}</span>
            {previewData?.baseModel && <span>{previewData.baseModel}</span>}
          </div>
        </div>
        <button className={classes["btn__close"]} onClick={closeCardHandler}>
          X
        </button>
      </div>
      <div className={`${fullView ? classes.content : ""}`}>
        {previewData?.minWeight && fullView && (
          <div>
            Weight: {previewData?.minWeight?.toFixed(1)}-
            {previewData?.maxWeight?.toFixed(1)}
          </div>
        )}
        {/* {previewData.size && <span>S: {previewData.size}</span>} */}
        {!!previewData.mainTag && fullView && (
          <div className={classes["main-tag"]}>
            {/* Activation tag: */}
            <ActivationTag
              tag={previewData.mainTag}
              modelData={previewData}
              strength={previewData.weight}
            />
          </div>
        )}
        {fullView && (
          <div className={classes["tags-container"]}>
            {!!previewData.tags?.length && (
              <>
                {/* <span>Tags: </span> */}
                <div
                  className={`${classes.tags} ${
                    tagsIsOpen ? classes["tags--open"] : ""
                  }`}
                  style={tagsHeight ? { maxHeight: `${tagsHeight}px` } : {}}
                >
                  <div
                    ref={tagsRef}
                    className={`${classes["tags__list"]} ${
                      taglistHeight > taglistItemHeight ? classes.shadow : ""
                    }`}
                  >
                    <TagList
                      name="Trigger words"
                      ref={tagsListRef}
                      tags={previewData.tags}
                      className={classes["tag-list"]}
                      promptType="positive"
                    />
                  </div>
                </div>
                {taglistHeight > taglistItemHeight && (
                  <button
                    className={classes["tags__btn"]}
                    onClick={openTagsHandler}
                  >
                    <Arrow direction={tagsIsOpen ? "up" : "down"} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
        {/* {!!previewData.helperTags?.length && (
          <>
            <div
              className={`${classes[["helper-tags"]]} ${
                helperTagsIsOpen ? classes["helper-tags--open"] : ""
              }`}
              style={
                helpertagsHeight ? { maxHeight: `${helpertagsHeight}px` } : {}
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
    </li>
  );
};

export default UsedCard;
