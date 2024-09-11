import React, { useEffect, useRef, useState } from "react";
import classes from "./UsedCard.module.scss";
import { Link } from "react-router-dom";
import TagList from "../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import {
  removeModelFromPanel,
  usedModelsActions,
} from "../../store/usedModels";
import { promptActions } from "../../store/prompt";
import ActivationTag from "../activation-tag/ActivationTag";
import Arrow from "../ui/Arrow";
import Image from "../ui/image/Image";
import { modelActions } from "../../store/model";

const UsedCard = ({ previewData, fullView }) => {
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const [tagsHeight, setTagsHeight] = useState(null);
  const [taglistHeight, setTaglistHeight] = useState(null);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const model = useSelector((state) => state.model.model);
  const dispatch = useDispatch();
  const tagsRef = useRef();
  const tagsListRef = useRef();
  const taglistItemHeight = 68;

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

  const closeCardHandler = () => {
    dispatch(removeModelFromPanel(previewData.id));
    dispatch(promptActions.removeTag(previewData.mainTag));
  };

  const closePanelHandler = () => {
    if (previewData?.id !== model?.id) {
      dispatch(modelActions.resetModelData());
    }
    if (document.body.offsetWidth < 1024) {
      dispatch(usedModelsActions.panelState(false));
    }
  };

  return (
    <li id={previewData.id} className={`${classes.card} card`}>
      <div className={classes.head}>
        <Link
          to={`/models/${previewData.id}`}
          state={{ versionId: previewData?.activeVersionId || null }}
          className={classes.link}
          onClick={closePanelHandler}
        >
          <Image
            src={
              isNsfwMode
                ? previewData.nsfwPreviewImgUrl ||
                  previewData.customPreviewImgUrl ||
                  previewData.imgUrl
                : previewData.customPreviewImgUrl || previewData.imgUrl
            }
            alt="Preview"
          />
        </Link>
        <div className={classes.info}>
          <div className={classes["title-container"]}>
            <Link
              to={`/models/${previewData.id}`}
              state={{ versionId: previewData?.activeVersionId || null }}
              className={classes.link}
              onClick={closePanelHandler}
            >
              <h4
                className={classes.title}
                title={previewData.name || previewData.title}
              >
                {previewData.name || previewData.title}
              </h4>
            </Link>
          </div>
          {previewData?.versionName && (
            <div className={classes["version-name"]}>
              {previewData?.versionName}
            </div>
          )}
          <div>
            <span className={classes.type}>
              {previewData.type || previewData.modelType}
            </span>
            {previewData?.baseModel && (
              <span className={classes.models}>{previewData.baseModel}</span>
            )}
          </div>
        </div>
        <button className={classes["btn__close"]} onClick={closeCardHandler}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {fullView &&
        (previewData?.minWeight ||
          previewData?.mainTag ||
          !!previewData?.tags?.length) && (
          <div className={`${fullView ? classes.content : ""}`}>
            {(!!previewData?.minWeight || !!previewData?.weight) && (
              <div className={classes["weight"]}>
                <span>Weight:</span>
                <span className={classes["weight__value"]}>
                  {previewData?.minWeight
                    ? `${previewData?.minWeight?.toFixed(1)} - 
                    ${previewData?.maxWeight?.toFixed(1)}`
                    : ""}{" "}
                  {previewData?.weight
                    ? `(${previewData?.weight?.toFixed(1)})`
                    : ""}
                </span>
              </div>
            )}
            {!!previewData.mainTag && fullView && (
              <div className={classes["main-tag"]}>
                <ActivationTag
                  tag={previewData.mainTag}
                  modelData={previewData}
                  strength={previewData.weight}
                />
              </div>
            )}

            <div className={classes["tags-container"]}>
              {!!previewData?.tags?.length && (
                <>
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
                      className={`${classes["tags__btn"]} ${
                        !tagsIsOpen ? classes["tags__btn--shadow"] : ""
                      }`}
                      onClick={openTagsHandler}
                    >
                      <Arrow direction={tagsIsOpen ? "up" : "down"} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
    </li>
  );
};

export default UsedCard;
