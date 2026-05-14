import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import classes from "./TagSets.module.scss";
import TagList from "../../general-elements/tag-list/TagList";
import Image from "../../ui/image/Image";
import Button from "../../ui/buttons/Button";
import TagSetGuide from "../../general-elements/guide/model/TagSetGuide";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  GUIDE_STEP_MODEL_TAGSET,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
  SETTINGS_MODEL_VISIBLE_TAGSETS_AMOUNT,
} from "../../../variables/constants";
import { guideActions } from "../../../store/guide";
import Modal from "../../ui/Modal";
import TagSetsForm from "../../forms/tag-sets-form/TagSetsForm";
import ButtonInfo from "../../ui/buttons/ButtonInfo";
import InfoTagsets from "../../general-elements/info/InfoTagSets";
import NotificationMessage from "../../ui/NotificationMessage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { TagSet } from "../../../types/prompt.types";
import { splitTags } from "../../../utils/promptUtils";

type TagSetsProps = {
  customData?: TagSet[];
  defaultData?: TagSet[];
};

/**
 * Model tag sets component.
 *
 * Displays user-defined tag sets for the active model version, including
 * version-specific and default tag sets.
 *
 * Responsibilities:
 * - Renders tag sets with preview images.
 * - Allows adding or removing all tags to/from the prompt.
 * - Supports copying tag sets to the clipboard.
 * - Provides controls to add new tag sets and display contextual hints.
 *
 * @component
 *
 * @param props
 * @param props.customData - User-defined tag sets for the current version.
 * @param props.defaultData - Default tag sets shared across versions.
 *
 * @returns Model tag sets panel.
 */
const TagSets = ({ customData, defaultData }: TagSetsProps) => {
  const [tagSetsIsOpen, setTagSetsIsOpen] = useState(false);
  const [tagSetsFormIsOpen, setTagSetsFormIsOpen] = useState(false);
  const [tagsetItemHeight, setTagsetItemHeight] = useState(500);
  const [tagsetListHeight, setTagsetListHeight] = useState(500);
  const model = useAppSelector((state) => state.model.model);
  const isNsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const guideActive = useAppSelector((state) => state.guide.model.active);
  const guideStep = useAppSelector((state) => state.guide.model.step);
  const tagSetItemRef = useRef<HTMLLIElement>(null);
  const tagSetListRef = useRef<HTMLUListElement>(null);
  const dispatch = useAppDispatch();

  const tagSets = useMemo(() => {
    let tagSetsData: TagSet[] = [];

    const defaultDataWithDefMark = defaultData?.map((tagSet) => {
      return {
        ...tagSet,
        default: true,
      };
    });

    if (customData?.length) {
      tagSetsData = [...customData];
    }
    if (defaultDataWithDefMark?.length) {
      tagSetsData = [...tagSetsData, ...defaultDataWithDefMark];
    }

    return tagSetsData;
  }, [customData, defaultData]);

  useEffect(() => {
    if (guideActive && guideStep === GUIDE_STEP_MODEL_TAGSET) {
      if (!tagSets?.length)
        dispatch(guideActions.guideNextStep({ type: "model" }));
    }
  }, [guideStep, dispatch, guideActive, tagSets]);

  useEffect(() => {
    if (!tagSets?.length) return;

    const itemHeight = tagSetItemRef?.current?.offsetHeight;
    const listHeight = tagSetListRef?.current?.offsetHeight;

    if (itemHeight) setTagsetItemHeight(itemHeight);
    if (listHeight) setTagsetListHeight(listHeight);
  }, [
    tagSetItemRef?.current?.offsetHeight,
    tagSetListRef?.current?.offsetHeight,
    customData,
    tagSets,
  ]);

  const tagSetsHtml = tagSets?.map((tagSet, i) => (
    <motion.li
      key={i}
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      exit={{ opacity: 0, y: 30, transition: { delay: 1 } }}
      ref={i === 0 ? tagSetItemRef : null}
      className={classes["tag-sets"]}
    >
      <div className={classes["tag-sets__img"]}>
        <Image
          src={
            isNsfwMode ? tagSet?.nsfwImgUrl || tagSet?.imgUrl : tagSet?.imgUrl
          }
          alt="Set prewiew image"
          imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_BIG}
        />
      </div>
      {
        <TagList
          name={tagSet.name}
          coment={tagSet?.default ? "Default" : ""}
          tags={splitTags(tagSet.value)}
          promptType="positive"
          className={classes["tag-sets__tags"]}
        />
      }
    </motion.li>
  ));

  const showAllTagSetsHandler = () => {
    setTagSetsIsOpen((prevState) => !prevState);
  };

  const openTagSetsForm = () => {
    setTagSetsFormIsOpen(true);
  };

  const closeTagSetsForm = () => {
    setTagSetsFormIsOpen(false);
  };

  return (
    <div className={classes["tag-sets__wrap"]}>
      <div className={classes["tag-sets__header"]}>
        <div className={classes.title}>
          Tag sets:{" "}
          <ButtonInfo>
            <InfoTagsets />
          </ButtonInfo>
        </div>

        <Button onClick={openTagSetsForm}>Add tag set</Button>
      </div>
      {!tagSets?.length && (
        <NotificationMessage>
          <p>
            You don't have any tag sets. Press "Add tag set" to add new tag set.
          </p>
        </NotificationMessage>
      )}
      <AnimatePresence>
        {!!tagSets?.length && (
          <div
            className={classes["tag-sets__container"]}
            style={{
              maxHeight: `${
                !tagSetsIsOpen ? tagsetItemHeight : tagsetListHeight
              }px`,
              overflow: "hidden",
            }}
          >
            <ul
              className={`${classes["tag-sets__list"]} ${
                tagSetsIsOpen ? classes["tag-sets__list--open"] : ""
              }`}
              ref={tagSetListRef}
            >
              {tagSetsHtml}
            </ul>
          </div>
        )}
      </AnimatePresence>
      {tagSets?.length > 1 && (
        <Button
          type="button"
          className={`${classes["tag-sets__btn"]} ${
            tagSets.length <= SETTINGS_MODEL_VISIBLE_TAGSETS_AMOUNT
              ? classes["tag-sets__btn--hidden"]
              : ""
          }`}
          onClick={showAllTagSetsHandler}
        >
          {!tagSetsIsOpen ? "Show All" : "Hide"}
        </Button>
      )}
      <TagSetGuide />
      <AnimatePresence>
        {tagSetsFormIsOpen && model && (
          <Modal onClose={closeTagSetsForm}>
            <TagSetsForm modelId={model.id} onClose={closeTagSetsForm} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagSets;
