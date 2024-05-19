import React, { useState } from "react";
import classes from "./ModelTags.module.scss";
// import Tag from "../../tag/Tag";
import TagList from "../../tag-list/TagList";
import { useSelector } from "react-redux";
// import Image from "../../ui/image/Image";
// import Buttton from "../../ui/Button";
// import TagSets from "../tag-sets/TagSets";
import ActivationTag from "../../activation-tag/ActivationTag";
import Modal from "../../ui/Modal";
import TagsForm from "../../forms/tags-form/TagsForm";

// const defVisibleTags = 2;

const ModelTags = ({ customData, modelPreview }) => {
  // const [tagSetsIsOpen, setTagSetsIsOpen] = useState(false);
  // const [tagSets, setTagSets] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);

  // useEffect(() => {
  //   const tagSetsData = customData?.tagSetsData?.length
  //     ? customData?.tagSetsData
  //     : model?.defaultCustomData?.tagSetsData;
  //   setTagSets(
  //     tagSetsData.slice(0, tagSetsIsOpen ? tagSetsData.length : defVisibleTags)
  //   );
  // }, [customData, model, tagSetsIsOpen]);

  // const splitTags = (arr) => {
  //   const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
  //   return arr.split(splitRegEx).flatMap((tag) => tag.trim() || []);
  // };

  // const tagSetsHtml = tagSets?.map((tagSet, i) => (
  //   <li key={i} className={classes["tag-set"]}>
  //     {/* <span className={classes["tag-set__name"]}>{tagSet.name}:</span> */}
  //     <div className={classes["tag-set__img"]}>
  //       <Image src={tagSet?.ImgUrl} alt="Set prewiew image" />
  //     </div>
  //     {
  //       <TagList
  //         name={tagSet.name}
  //         tags={splitTags(tagSet.value)}
  //         promptType="positive"
  //         className={classes["tag-set__tags"]}
  //       />
  //     }
  //   </li>
  // ));

  // const showAllTagSetsHandler = () => {
  //   setTagSetsIsOpen((prevState) => !prevState);
  // };

  const openEditHandler = () => {
    setModalIsOpen(true);
  };

  return (
    <>
      <div className={classes["tags"]}>
        {/* <h2 className={classes.title}>Main</h2> */}
        <div className={classes["tags__main"]}>
          <button
            type="button"
            className={classes["tags__btn-edit"]}
            onClick={openEditHandler}
          >
            <div>Edit...</div>
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
          {modalIsOpen && (
            <Modal
              title="Trigger words"
              onClose={() => {
                setModalIsOpen(false);
              }}
            >
              {/* <div className={classes["tags__form"]}>
                </div> */}
              <TagsForm
                versionData={customData}
                defaultData={model.defaultCustomData}
                modelId={model.id}
              />
            </Modal>
          )}
          {(customData?.mainTag || model?.mainTag) && (
            <div className={classes["activation-tag"]}>
              <h3 className={classes["tags__subtitle"]}>Activation tag:</h3>
              <ActivationTag
                tag={customData?.mainTag || model?.mainTag}
                modelData={modelPreview}
                strength={customData?.weight || model.defaultCustomData?.weight}
              />
              {/* <Tag
                tag={customData?.mainTag || model?.mainTag}
                promptType="positive"
                modelData={modelPreview}
              /> */}
            </div>
          )}
          {(!!curVersion?.trainedWords?.length ||
            !!customData?.trainedWords?.length) && (
            <>
              {/* <div className={classes.title}>Trigger Words:</div> */}
              <TagList
                name="Trigger Words"
                tags={
                  customData?.trainedWords?.length
                    ? customData?.trainedWords
                    : curVersion?.trainedWords
                }
                promptType="positive"
                className={classes["tags__field"]}
              />
            </>
          )}
          {(!!model?.defaultCustomData?.helperTags?.length ||
            !!customData?.helperTags?.length) && (
            <>
              {/* <div className={classes.title}>Helper Words:</div> */}
              <TagList
                name="Helper Words"
                coment={
                  !customData?.helperTags &&
                  model?.defaultCustomData.helperTags &&
                  "Default"
                }
                tags={
                  customData?.helperTags || model?.defaultCustomData.helperTags
                }
                promptType="positive"
                className={classes["tags__field"]}
              />
            </>
          )}
          {(!!model?.defaultCustomData?.negativeTags?.length ||
            !!customData?.negativeTags?.length) && (
            <>
              {/* <div className={classes.title}>Negative Words:</div> */}
              <TagList
                name="Negative Words"
                coment={
                  !customData?.negativeTags &&
                  model?.defaultCustomData.negativeTags &&
                  "Default"
                }
                tags={
                  customData?.negativeTags ||
                  model?.defaultCustomData.negativeTags
                }
                promptType="negative"
                className={classes["tags__field"]}
              />
            </>
          )}
        </div>
        {/* {!!tagSets?.length && (
          // <div className={classes["tag-set__container"]}>
          //   <div className={classes.title}>Tag sets:</div>
          //   <ul className={classes["tag-set__list"]}>{tagSetsHtml}</ul>
          //   <Buttton
          //     type="button"
          //     className={classes["tag-set__btn"]}
          //     onClick={showAllTagSetsHandler}
          //   >
          //     {!tagSetsIsOpen ? "Show All" : "Hide"}
          //   </Buttton>
          // </div>
          <TagSets customData={customData} />
        )} */}
      </div>
    </>
  );
};

export default ModelTags;
