import React, { useRef, useState } from "react";
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
import EditSvg from "../../../assets/EditSvg";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";
import Tooltip from "../../ui/Tooltip";

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
  console.log(customData);
  return (
    <>
      <div className={classes["tags"]}>
        {/* <h2 className={classes.title}>Main</h2> */}
        <div className={classes["tags__container"]}>
          <div className={classes["tags__param"]}>
            {(customData?.mainTag ||
              model?.mainTag ||
              customData?.defActTag) && (
              <div className={classes["activation-tag"]}>
                <h3 className={classes["tags__subtitle"]}>Activation tag:</h3>
                <div className={classes["activation-tag__container"]}>
                  <ActivationTag
                    tag={
                      customData?.mainTag ||
                      model?.mainTag ||
                      customData?.defActTag
                    }
                    modelData={modelPreview}
                    strength={
                      customData?.weight || model.defaultCustomData?.weight
                    }
                  />
                  {(!customData?.mainTag ||
                    !model?.mainTag ||
                    customData?.defActTag) && (
                    <Tooltip>
                      <p className={classes["tags__notification-text"]}>
                        The activation tag is generated automatically based on
                        the file name.
                      </p>
                      <p className={classes["tags__notification-text"]}>
                        It should work in most cases, but we advise you to
                        replace it with an appropriate name from your local
                        web-UI.
                      </p>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}
            <button
              type="button"
              className={classes["tags__btn-edit"]}
              onClick={openEditHandler}
            >
              <span className={classes["tags__btn-edit-name"]}>Edit...</span>
              <EditSvg />
            </button>
          </div>
          {(!!curVersion?.trainedWords?.length ||
            !!customData?.trainedWords?.length) && (
            <>
              {/* <div className={classes.title}>Trigger Words:</div> */}
              <TagList
                name="Trigger words"
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
                name="Helper words"
                coment={
                  !customData?.helperTags &&
                  model?.defaultCustomData.helperTags &&
                  "Default"
                }
                tags={
                  !!customData?.helperTags?.length
                    ? customData?.helperTags
                    : model?.defaultCustomData?.helperTags
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
                name="Negative words"
                coment={
                  !customData?.negativeTags &&
                  model?.defaultCustomData.negativeTags &&
                  "Default"
                }
                tags={
                  customData?.negativeTags?.length
                    ? customData?.negativeTags
                    : model?.defaultCustomData?.negativeTags
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
      </div>
    </>
  );
};

export default ModelTags;
