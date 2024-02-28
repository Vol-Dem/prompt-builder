import React, { useEffect, useRef, useState } from "react";
import classes from "./UsedCard.module.scss";
import Tag from "../tag/Tag";
import { ReactComponent as StarImg } from "../../assets/star.svg";
import { useNavigate } from "react-router-dom";
import TagList from "../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import { usedModelsActions } from "../../store/usedModels";
import { promptActions } from "../../store/prompt";

const UsedCard = ({ previewData }) => {
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const [tagsHeight, setTagsHeight] = useState(null);
  const [helperTagsIsOpen, setHelperTagsIsOpen] = useState(false);
  const [helpertagsHeight, setHelperTagsHeight] = useState(null);
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tagsRef = useRef();
  const tagsListRef = useRef();
  const helperTagsRef = useRef();
  const taglistItemHeight = 34;
  const taglistHeight = tagsRef?.current?.clientHeight;

  useEffect(() => {
    setImgIsLoading(true);
  }, []);

  useEffect(() => {
    if (taglistHeight === taglistItemHeight) setTagsHeight(taglistItemHeight);
  }, [previewData, taglistHeight, taglistItemHeight]);

  const openHelperTagsHandler = () => {
    setHelperTagsIsOpen((prev) => {
      if (prev) {
        setHelperTagsHeight(0);
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
      } else {
        setTagsHeight(taglistHeight);
      }
      return !prev;
    });
  };

  const openLoraHandler = (e) => {
    const modelId = e.target.closest(`.card`).id;
    navigate(`model/${modelId}`, { state: { type: previewData.type } });
  };

  const imgLoadingHandler = () => {
    setImgIsLoading(false);
  };

  const closeCardHandler = () => {
    dispatch(usedModelsActions.removeModel(previewData.id));
    dispatch(promptActions.removeTag(previewData.mainTag));
  };

  return (
    <div id={previewData.id} className={`${classes.card} card`}>
      <div className={classes.head}>
        <div className={classes.img} onClick={openLoraHandler}>
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
        </div>
        <h4 className={classes.title} onClick={openLoraHandler}>
          {previewData.title}
        </h4>
        <button className={classes["btn__close"]} onClick={closeCardHandler}>
          X
        </button>
      </div>
      <div className={`${classes.content}`}>
        <div className={classes.info}>
          <span className={classes.type}>{previewData.type}</span>
          <span>W: {previewData.weight}</span>
          <span>S: {previewData.size}</span>
        </div>
        <ul className={classes["main-tag"]}>
          Triger:
          <Tag
            tag={previewData.mainTag}
            promptType="positive"
            modelData={previewData}
          />
        </ul>
        <div className={classes["tags-container"]}>
          {!!previewData.tags?.length && (
            <>
              <span>Tags: </span>
              <div
                className={`${classes.tags} ${
                  tagsIsOpen ? classes["tags--open"] : ""
                }`}
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
                  className={classes["tags__btn"]}
                  onClick={openTagsHandler}
                >
                  v
                </button>
              )}
            </>
          )}
        </div>
        {!!previewData.helperTags?.length && (
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

export default UsedCard;
