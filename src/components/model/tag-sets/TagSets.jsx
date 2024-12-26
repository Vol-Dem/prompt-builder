import React, { useEffect, useRef, useState } from "react";
import classes from "./TagSets.module.scss";
import TagList from "../../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import Image from "../../ui/image/Image";
import Buttton from "../../ui/Button";
import TagSetGuide from "../../ui/guide/model/TagSetGuide";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  GUIDE_STEP_MODEL_TAGSET,
} from "../../../variables/constants";
import { guideActions } from "../../../store/guide";
import Modal from "../../ui/Modal";
import TagSetsForm from "../../forms/tag-sets-form/TagSetsForm";
import { AnimatePresence, motion } from "framer-motion";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";

const defVisibleTags = 2;

const TagSets = ({ customData, defaultData }) => {
  const [tagSetsIsOpen, setTagSetsIsOpen] = useState(false);
  const [tagSetsFormIsOpen, setTagSetsFormIsOpen] = useState(false);
  const [tagSets, setTagSets] = useState([]);
  const [allTagSets, setAllTagSets] = useState([]);
  const [tagsetItemHeight, setTagsetItemHeight] = useState(500);
  const [tagsetListHeight, setTagsetListHeight] = useState(500);
  const model = useSelector((state) => state.model.model);
  // const curVersion = useSelector((state) => state.model.curVersion);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const guideActive = useSelector((state) => state.guide.model.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const tagSetItemRef = useRef();
  const tagSetListRef = useRef();
  const dispatch = useDispatch();
  const guideTimeoutRef = useRef(null);

  useEffect(() => {
    if (guideActive && guideStep === GUIDE_STEP_MODEL_TAGSET) {
      if (!tagSets?.length)
        dispatch(guideActions.guideNextStep({ type: "model" }));
      // if (guideTimeoutRef.current) {
      //   clearTimeout(guideTimeoutRef.current);
      // }
      // guideTimeoutRef.current = setTimeout(() => {
      //   if (!tagSets?.length)
      //     dispatch(guideActions.guideNextStep({ type: "model" }));
      // }, 1000);
    }
  }, [guideStep, dispatch, guideActive, tagSets]);

  useEffect(() => {
    if (!tagSets?.length) return;
    const itemHeight = tagSetItemRef?.current?.offsetHeight;
    const listHeight = tagSetListRef?.current?.offsetHeight;
    setTagsetItemHeight(itemHeight);
    setTagsetListHeight(listHeight);
  }, [
    tagSetItemRef?.current?.offsetHeight,
    tagSetListRef?.current?.offsetHeight,
    customData,
    tagSets,
  ]);

  useEffect(() => {
    // const tagSetsData = customData?.length ? customData : defaultData;
    let tagSetsData = [];

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

    if (!tagSetsData?.length) return;
    setAllTagSets(tagSetsData);
    setTagSets(tagSetsData);
    const itemHeight = tagSetItemRef?.current?.offsetHeight;
    const listHeight = tagSetListRef?.current?.offsetHeight;
    setTagsetItemHeight(itemHeight);
    setTagsetListHeight(listHeight);

    return () => {
      setAllTagSets([]);
      setTagSets([]);
      setTagsetItemHeight(500);
      setTagsetListHeight(500);
    };
  }, [
    customData,
    defaultData,
    model,
    tagSetsIsOpen,
    tagSetItemRef?.current?.offsetHeight,
    tagSetListRef?.current?.offsetHeight,
  ]);

  const splitTags = (arr) => {
    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
    return arr.split(splitRegEx).flatMap((tag) => tag.trim() || []);
  };

  const tagSetsHtml = tagSets?.map((tagSet, i) => (
    <motion.li
      key={i}
      initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
      animate={ANIMATIONS_FM_SLIDEIN}
      // exit={ANIMATIONS_FM_SLIDEIN_INITIAL}
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
        />
      </div>
      {
        <TagList
          name={tagSet.name}
          // coment={!customData?.length && !!defaultData?.length && "Default"}
          coment={tagSet?.default && "Default"}
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
        <div className={classes.title}>Tag sets:</div>
        <Buttton onClick={openTagSetsForm}>Add tag set</Buttton>
      </div>
      {!tagSets?.length && (
        <div className={classes["notification"]}>
          {/* <ExclamationCircleSvg className={classes["notification__svg"]} /> */}
          <p className={classes["notification__text"]}>
            You don't have any tag sets. Press "Add tag set" to add new tag set.
          </p>
        </div>
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
      {allTagSets?.length > 1 && (
        <Buttton
          type="button"
          className={`${classes["tag-sets__btn"]} ${
            allTagSets.length <= defVisibleTags
              ? classes["tag-sets__btn--hidden"]
              : ""
          }`}
          onClick={showAllTagSetsHandler}
        >
          {!tagSetsIsOpen ? "Show All" : "Hide"}
        </Buttton>
      )}
      <TagSetGuide />
      <AnimatePresence>
        {tagSetsFormIsOpen && (
          <Modal onClose={closeTagSetsForm}>
            <TagSetsForm modelId={model.id} onClose={closeTagSetsForm} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagSets;
