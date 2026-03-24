import { useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";

import classes from "./ModelTags.module.scss";
import TagList from "../../general-elements/tag-list/TagList";
import ActivationTag from "../../general-elements/activation-tag/ActivationTag";
import Modal from "../../ui/Modal";
import TagsForm from "../../forms/tags-form/TagsForm";
import EditSvg from "../../../assets/EditSvg";
import Tooltip from "../../ui/Tooltip";
import ModelTagsGuide from "../../general-elements/guide/model/ModelTagsGuide";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoQuickEdit from "../../general-elements/info/InfoQuickEdit";

/**
 * Model tags panel.
 *
 * Displays model activation tag, trigger words, helper words, and negative words,
 * along with controls to manage and apply them to the prompt.
 *
 * Responsibilities:
 * - Renders model activation and trigger-related tags.
 * - Allows adding or removing all trigger words to/from the prompt.
 * - Supports copying trigger words to the clipboard.
 * - Opens a modal form to edit trigger words.
 * - Generates an activation tag based on the model file name.
 *
 * @component
 *
 * @param {Object} props
 * @param {Object | null} props.customData - User-specific model data.
 * @param {Object | null} props.modelPreview - Default model preview data.
 *
 * @returns {JSX.Element} Model tags panel.
 */
const ModelTags = ({ customData, modelPreview }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);

  const openEditHandler = () => {
    setModalIsOpen(true);
  };

  const closeTagsFormHabdler = () => {
    setModalIsOpen(false);
  };

  return (
    <>
      <div className={classes["tags"]}>
        <div className={classes["tags__container"]}>
          <ModelTagsGuide />
          <div className={classes["tags__param"]}>
            {(customData?.mainTag ||
              model?.mainTag ||
              customData?.defActTag) && (
              <div className={classes["activation-tag"]}>
                <div className={classes["tags__subtitle"]}>Activation tag:</div>
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
                    <Tooltip
                      content={
                        <div className={classes["tooltip__content"]}>
                          <p className={classes["tags__notification-text"]}>
                            The activation tag is generated automatically based
                            on the file name.
                          </p>
                          <p className={classes["tags__notification-text"]}>
                            It should work in most cases, but we advise you to
                            replace it with an appropriate name from your local
                            web-UI.
                          </p>
                        </div>
                      }
                    >
                      <div className={classes.tooltip}>
                        <ExclamationCircleSvg />
                      </div>
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
                  customData?.helperTags?.length
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
        <AnimatePresence>
          {modalIsOpen && (
            <Modal
              title={
                <>
                  Trigger words{" "}
                  <ButtonInfo>
                    <InfoQuickEdit />
                  </ButtonInfo>
                </>
              }
              onClose={closeTagsFormHabdler}
            >
              <TagsForm
                versionData={customData}
                defaultData={model.defaultCustomData}
                modelId={model.id}
                onClose={closeTagsFormHabdler}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ModelTags;
