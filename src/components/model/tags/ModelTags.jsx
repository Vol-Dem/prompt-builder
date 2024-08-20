import React, { useState } from "react";
import classes from "./ModelTags.module.scss";
import TagList from "../../tag-list/TagList";
import { useSelector } from "react-redux";
import ActivationTag from "../../activation-tag/ActivationTag";
import Modal from "../../ui/Modal";
import TagsForm from "../../forms/tags-form/TagsForm";
import EditSvg from "../../../assets/EditSvg";
import Tooltip from "../../ui/Tooltip";

const ModelTags = ({ customData, modelPreview }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);

  const openEditHandler = () => {
    setModalIsOpen(true);
  };

  return (
    <>
      <div className={classes["tags"]}>
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
        {modalIsOpen && (
          <Modal
            title="Trigger words"
            onClose={() => {
              setModalIsOpen(false);
            }}
          >
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
