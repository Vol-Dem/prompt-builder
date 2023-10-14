import React, { useState } from "react";
import classes from "./PreviewCard.module.scss";
import Tag from "../tag/Tag";
import { ReactComponent as StarImg } from "../../assets/star.svg";
import { useNavigate } from "react-router-dom";

const PreviewCard = ({ previewData }) => {
  const [helpertagsIsOpen, setHelperTagsIsOpen] = useState(false);
  const navigate = useNavigate();
  // console.log(previewData);

  const openHelperTagsHandler = () => {
    setHelperTagsIsOpen((prev) => !prev);
  };

  const openLoraHandler = (e) => {
    const modelId = e.target.closest(`.card`).id;
    navigate(`model/${modelId}`);
    // console.log(modelId);
  };

  return (
    <div id={previewData.id} className={`${classes.card} card`}>
      <div className={classes.img} onClick={openLoraHandler}>
        <span className={classes.type}>{previewData.type}</span>
        <img src={previewData.imgUrl} alt="" />
      </div>
      <div className={classes.content}>
        <h4 className={classes.title} onClick={openLoraHandler}>
          {previewData.title}
        </h4>
        <div className={classes.info}>
          <span>M: {previewData.baseModel}</span>
          <span>W: {previewData.weight}</span>
          <span>S: {previewData.size}</span>
        </div>
        <ul className={classes["main-tag"]}>
          main tag: <Tag tag={previewData.mainTag} />
        </ul>
        <div>
          <ul className={classes.tags}>
            <span>Tags: </span>
            {previewData.tags?.map((tag) => {
              return <Tag tag={tag} key={tag} />;
            })}
          </ul>
        </div>
        {previewData.helperTags && (
          <>
            {helpertagsIsOpen && (
              <div>
                <ul className={classes.tags}>
                  <span>Halper tags:</span>
                  {previewData.helperTags?.map((tag) => {
                    return <Tag tag={tag} key={tag} />;
                  })}
                </ul>
              </div>
            )}
            <button
              className={classes.btn}
              type="button"
              onClick={openHelperTagsHandler}
            >
              {`${helpertagsIsOpen ? "Hide" : "Show"} halper tags`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewCard;
