import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import classes from "./SetTagSetPreview.module.scss";
import { setTagSetPreviewImg } from "../../../../store/modelThunks";
import ButttonTertiary from "../../../ui/buttons/ButtonTertiary";
import Image from "../../../ui/image/Image";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ERROR_MESSAGE_TAG_SET_PREVIEW_SAVE,
  SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL,
} from "../../../../variables/constants";
import TagSetsForm from "../../../forms/tag-sets-form/TagSetsForm";
import Button from "../../../ui/buttons/Button";
import Modal from "../../../ui/Modal";
import TextHighlight from "../../../ui/text/TextHighlight";
import ErrorMessage from "../../../ui/ErrorMessage";
import Spinner from "../../../ui/Spinner";
import { normalizeError, reportError } from "../../../../utils/generalUtils";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

type SetTagSetPreviewProps = { src: string };

/**
 * Set tagset preview component.
 *
 * Displays tag sets associated with the current model version including their names,
 * preview images, and controls to assign the current image as a SFW or NSFW preview.
 * Provides access to `TagSetsForm` for creating and editing tag sets.
 * Allows switching between versions that contain tag sets.
 *
 * When the application NSFW mode is enabled, also renders:
 * - A SFW / NSFW toggle for preview filtering.
 * - A button to assign the current image as an NSFW preview.
 *
 * Responsibilities:
 * - Renders tag set previews for the selected model version.
 * - Allows assigning the current image as preview or NSFW preview.
 * - Provides navigation between versions that have tag sets.
 *
 * @component
 *
 * @param props
 * @param props.src - Source URL of the currently active image used for preview assignment.
 *
 * @returns Set tagset preview.
 */
const SetTagSetPreview = ({ src }: SetTagSetPreviewProps) => {
  const [tagSetsFormIsOpen, setTagSetsFormIsOpen] = useState(false);
  const [showNsfwPreview, setShowNsfwPreview] = useState(false);
  const [curTagSetVersionId, setCurTagSetVersionId] = useState("tsv-def");
  const [savingPreview, setSavingPreview] = useState<{
    versionId: string;
    tagSetIndex: number;
    isNsfw: boolean;
  } | null>(null);
  const previewIsSaving = savingPreview !== null;
  const [previewError, setPreviewError] = useState("");
  const previewPendingRef = useRef(false);
  const model = useAppSelector((state) => state.model.model);
  const curVersion = useAppSelector((state) => state.model.curVersion);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setShowNsfwPreview(nsfwMode);
  }, [nsfwMode]);

  useEffect(() => {
    if (
      curVersion &&
      model?.modelVersionsCustomData &&
      model.modelVersionsCustomData[curVersion.id]?.tagSetsData?.length
    ) {
      setCurTagSetVersionId(`${curVersion.id}`);
    }
  }, [model, curVersion]);

  const setTagSetPreviwImgHandler = async (id: number, isNsfw: boolean) => {
    if (previewPendingRef.current) return;
    let curtagSet;

    if (curTagSetVersionId === "tsv-def" && model?.defaultCustomData) {
      curtagSet = model?.defaultCustomData.tagSetsData;
    } else if (model?.modelVersionsCustomData) {
      curtagSet =
        model?.modelVersionsCustomData[curTagSetVersionId]?.tagSetsData;
    }

    const imgKey = isNsfw ? "nsfwImgUrl" : "imgUrl";

    const updatedTagSet = curtagSet?.map((tagSet, i) => {
      if (i === id) {
        return {
          ...tagSet,
          [imgKey]: src,
        };
      }
      return tagSet;
    });

    if (!updatedTagSet) return;

    previewPendingRef.current = true;
    setSavingPreview({ versionId: curTagSetVersionId, tagSetIndex: id, isNsfw });
    setPreviewError("");
    try {
      await dispatch(setTagSetPreviewImg(curTagSetVersionId, updatedTagSet));
      setShowNsfwPreview(isNsfw);
    } catch (error) {
      reportError(normalizeError(error));
      setPreviewError(ERROR_MESSAGE_TAG_SET_PREVIEW_SAVE);
    } finally {
      previewPendingRef.current = false;
      setSavingPreview(null);
    }
  };

  const openTagSetVersionHandler = (id: string) => {
    if (previewPendingRef.current) return;
    setCurTagSetVersionId(id);
    setPreviewError("");
  };

  const nsfwSwitchHandler = () => {
    setShowNsfwPreview((prevState) => !prevState);
  };

  const openTagSetsForm = () => {
    if (previewPendingRef.current) return;
    setTagSetsFormIsOpen(true);
  };
  const closeTagSetsForm = () => {
    setTagSetsFormIsOpen(false);
  };

  const renderPreviewButton = (versionId: string, id: number, isNsfw: boolean) => {
    const isSaving =
      savingPreview?.versionId === versionId &&
      savingPreview.tagSetIndex === id &&
      savingPreview.isNsfw === isNsfw;
    const label = isNsfw ? "Set as NSFW preview" : "Set as preview";

    return (
      <ButttonTertiary
        type="button"
        className={classes["preview-btn"]}
        disabled={previewIsSaving}
        aria-label={label}
        aria-busy={isSaving}
        onClick={() => setTagSetPreviwImgHandler(id, isNsfw)}
      >
        <span className={isSaving ? classes["preview-btn__label--hidden"] : ""}>
          {label}
        </span>
        {isSaving && (
          <span
            className={classes["preview-btn__spinner"]}
            role="status"
            aria-label="Saving tag-set preview"
          >
            <Spinner size="small" />
          </span>
        )}
      </ButttonTertiary>
    );
  };

  const tagSetVersionsHtml =
    model?.modelVersionsCustomData &&
    Object.values(model?.modelVersionsCustomData)
      ?.sort((a, b) => {
        if (a?.index && b?.index) {
          return a?.index - b?.index;
        }
        return 0;
      })
      .flatMap((version, i) => {
        if (!version?.tagSetsData?.length) return [];
        return (
          <li
            key={i}
            id={`${version.versionId}`}
            className={`${classes["tag-sets-versions__item"]} ${
              curTagSetVersionId === `${version.versionId}`
                ? classes["tag-sets-versions__item--active"]
                : ""
            }`}
            onClick={() => openTagSetVersionHandler(`${version.versionId}`)}
            aria-disabled={previewIsSaving}
          >
            {version.name}
          </li>
        );
      });

  const defTagSetsHtml = model?.defaultCustomData?.tagSetsData?.map(
    (tagSet, i) => {
      return (
        <motion.li
          key={i}
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          data-id={i}
          className={classes["tag-sets__item"]}
        >
          <div className={classes["tag-sets__img"]}>
            <Image
              src={
                showNsfwPreview
                  ? tagSet.nsfwImgUrl || "#"
                  : tagSet.imgUrl || "#"
              }
              imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
            />
          </div>
          <div className={classes["tag-sets__info"]}>
            <h3 className={classes["tag-sets__name"]}>{tagSet.name}</h3>
            <div className={classes["tag-sets__btn-container"]}>
              {renderPreviewButton("tsv-def", i, false)}
              {nsfwMode && renderPreviewButton("tsv-def", i, true)}
            </div>
          </div>
        </motion.li>
      );
    },
  );

  const versionTagsetsHtml =
    model?.modelVersionsCustomData &&
    model?.modelVersionsCustomData[curTagSetVersionId]?.tagSetsData?.map(
      (tagSet, i) => {
        return (
          <motion.li
            key={i}
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            data-id={i}
            className={classes["tag-sets__item"]}
          >
            <div className={classes["tag-sets__img"]}>
              <Image
                src={
                  showNsfwPreview
                    ? tagSet.nsfwImgUrl || "#"
                    : tagSet.imgUrl || "#"
                }
                imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL}
              />
            </div>
            <div className={classes["tag-sets__info"]}>
              <h3 className={classes["tag-sets__name"]} title={tagSet.name}>
                {tagSet.name}
              </h3>
              <div className={classes["tag-sets__btn-container"]}>
                {renderPreviewButton(curTagSetVersionId, i, false)}
                {nsfwMode && renderPreviewButton(curTagSetVersionId, i, true)}
              </div>
            </div>
          </motion.li>
        );
      },
    );

  return (
    <div aria-busy={previewIsSaving}>
      {!tagSetsFormIsOpen && (
        <>
          <div className={classes["tag-sets-head"]}>
            <div className={classes["tag-sets-title"]}>Tag sets</div>
            <Button onClick={openTagSetsForm} disabled={previewIsSaving}>
              Add tag set
            </Button>
            {nsfwMode && (
              <div className={classes["mode-switch"]}>
                <button
                  type="button"
                  onClick={nsfwSwitchHandler}
                  className={`${classes["btn-mode"]} ${
                    !showNsfwPreview ? classes["btn-mode--active"] : ""
                  }`}
                >
                  SFW
                </button>
                <button
                  type="button"
                  onClick={nsfwSwitchHandler}
                  className={`${classes["btn-mode"]} ${
                    showNsfwPreview ? classes["btn-mode--active"] : ""
                  }`}
                >
                  NSFW
                </button>
              </div>
            )}
          </div>
          {previewError && <ErrorMessage>{previewError}</ErrorMessage>}
          <ul className={classes["tag-sets-versions"]}>
            {!!model?.defaultCustomData?.tagSetsData?.length && (
              <li
                id={`tsv-def`}
                className={`${classes["tag-sets-versions__item"]} ${
                  curTagSetVersionId === "tsv-def"
                    ? classes["tag-sets-versions__item--active"]
                    : ""
                }`}
                onClick={() => openTagSetVersionHandler(`tsv-def`)}
                aria-disabled={previewIsSaving}
              >
                Default
              </li>
            )}
            {tagSetVersionsHtml}
          </ul>
          {!model?.defaultCustomData?.tagSetsData?.length &&
            !tagSetVersionsHtml?.length && (
              <div className={classes["notification"]}>
                <ExclamationCircleIcon
                  className={classes["notification__svg"]}
                />
                <p className={classes["notification__text"]}>
                  You don't have any tag sets. <br /> Press "Add tag set" to add
                  new tag set!
                </p>
              </div>
            )}
          {!!tagSetVersionsHtml?.length && !versionTagsetsHtml && (
            <div className={classes["notification"]}>
              <ExclamationCircleIcon className={classes["notification__svg"]} />
              <p className={classes["notification__text"]}>
                You don't have tag sets for this{" "}
                <TextHighlight>version</TextHighlight>. <br /> Press "Add tag
                set" to add new tag set!
              </p>
            </div>
          )}
          {curTagSetVersionId === "tsv-def" && (
            <ul className={classes["tag-sets"]}>{defTagSetsHtml}</ul>
          )}
          {curTagSetVersionId !== "tsv-def" && (
            <ul className={classes["tag-sets"]}>{versionTagsetsHtml}</ul>
          )}
        </>
      )}
      {tagSetsFormIsOpen && model?.id && (
        <Modal onClose={closeTagSetsForm}>
          <TagSetsForm modelId={model.id} onClose={closeTagSetsForm} />
        </Modal>
      )}
    </div>
  );
};

export default SetTagSetPreview;
