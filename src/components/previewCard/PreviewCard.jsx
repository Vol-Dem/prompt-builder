import React, { useEffect, useState } from "react";
import classes from "./PreviewCard.module.scss";
import Tag from "../tag/Tag";
import { ReactComponent as StarImg } from "../../assets/star.svg";
import { useNavigate } from "react-router-dom";
import TagList from "../tag-list/TagList";

const PreviewCard = ({ previewData }) => {
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const [helpertagsIsOpen, setHelperTagsIsOpen] = useState(false);
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const navigate = useNavigate();
  // console.log(previewData);

  useEffect(() => {
    setImgIsLoading(true);
  }, [previewData]);

  const openHelperTagsHandler = () => {
    setHelperTagsIsOpen((prev) => !prev);
  };

  const openTagsHandler = () => {
    setTagsIsOpen((prev) => !prev);
  };

  const openLoraHandler = (e) => {
    const modelId = e.target.closest(`.card`).id;
    navigate(`model/${modelId}`);
    // console.log(modelId);
  };

  const imgLoadingHandler = () => {
    setImgIsLoading(false);
  };

  return (
    <div id={previewData.id} className={`${classes.card} card`}>
      <div className={classes.img} onClick={openLoraHandler}>
        <span className={classes.type}>{previewData.type}</span>

        <img
          src={previewData.imgUrl}
          alt="Preview"
          onLoad={imgLoadingHandler}
          className={`${imgIsLoading ? classes["img--hidden"] : ""}`}
        />

        {/* {previewData.imgUrl && <img src="#" alt="Preview image" />} */}

        {imgIsLoading && (
          <div className={classes.preloader}>
            <StarImg />
          </div>
        )}
      </div>
      <div
        className={`${classes.content} ${
          helpertagsIsOpen ? classes["content--open"] : ""
        }`}
      >
        <h4 className={classes.title} onClick={openLoraHandler}>
          {previewData.title}
        </h4>
        <div className={classes.info}>
          <span>M: {previewData.baseModel}</span>
          <span>W: {previewData.weight}</span>
          <span>S: {previewData.size}</span>
        </div>
        <ul className={classes["main-tag"]}>
          Triger: <Tag tag={previewData.mainTag} />
        </ul>
        <div
          className={`${classes.tags} ${
            tagsIsOpen ? classes["tags--open"] : ""
          }`}
        >
          {previewData.tags && (
            <>
              <ul>
                <span>Tags: </span>
                <TagList tags={previewData.tags} />
              </ul>
              <button onClick={openTagsHandler}>Open tags</button>
            </>
          )}
        </div>
        {previewData.helperTags && (
          <>
            <div
              className={`${classes[["helper-tags"]]} ${
                helpertagsIsOpen ? classes["helper-tags--open"] : ""
              }`}
            >
              <ul>
                <span>Helper tags:</span>
                <TagList tags={previewData.helperTags} />
              </ul>
            </div>
            <button
              className={classes.btn}
              type="button"
              onClick={openHelperTagsHandler}
            >
              {`${helpertagsIsOpen ? "Hide" : "Show"} helper tags`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewCard;
