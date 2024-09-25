import React, { useEffect, useRef, useState } from "react";
import classes from "./TagSets.module.scss";
import TagList from "../../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import Image from "../../ui/image/Image";
import Buttton from "../../ui/Button";
import TagSetGuide from "../../ui/guide/model/TagSetGuide";
import { GUIDE_STEP_MODEL_TAGSET } from "../../../variables/constants";
import { guideActions } from "../../../store/guide";

const defVisibleTags = 2;

const TagSets = ({ customData, defaultData }) => {
  const [tagSetsIsOpen, setTagSetsIsOpen] = useState(false);
  const [tagSets, setTagSets] = useState([]);
  const [allTagSets, setAllTagSets] = useState([]);
  const [tagsetItemHeight, setTagsetItemHeight] = useState(500);
  const [tagsetListHeight, setTagsetListHeight] = useState(500);
  const model = useSelector((state) => state.model.model);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const guideActive = useSelector((state) => state.guide.model.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const tagSetItemRef = useRef();
  const tagSetListRef = useRef();
  const dispatch = useDispatch();
  const guideTimeoutRef = useRef(null);

  useEffect(() => {
    if (guideActive && guideStep === GUIDE_STEP_MODEL_TAGSET) {
      if (guideTimeoutRef.current) {
        clearTimeout(guideTimeoutRef.current);
      }
      guideTimeoutRef.current = setTimeout(() => {
        if (!tagSets?.length)
          dispatch(guideActions.guideNextStep({ type: "model" }));
      }, 1000);
    }
  }, [guideStep, dispatch, guideActive, tagSets]);

  useEffect(() => {
    const itemHeight = tagSetItemRef?.current?.offsetHeight;
    const listHeight = tagSetListRef?.current?.offsetHeight;
    setTagsetItemHeight(itemHeight);
    setTagsetListHeight(listHeight);
  }, [
    tagSetItemRef?.current?.offsetHeight,
    tagSetListRef?.current?.offsetHeight,
    customData,
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
    <li
      key={i}
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
    </li>
  ));

  const showAllTagSetsHandler = () => {
    setTagSetsIsOpen((prevState) => !prevState);
  };

  return (
    <div className={classes["tag-sets__wrap"]}>
      {!!tagSets?.length && <div className={classes.title}>Tag sets:</div>}
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
      {!!tagSets?.length && <TagSetGuide />}
    </div>
  );
};

export default TagSets;
