import React, { useEffect, useRef, useState } from "react";
import classes from "./TagSets.module.scss";
// import Tag from "../../tag/Tag";
import TagList from "../../tag-list/TagList";
import { useSelector } from "react-redux";
import Image from "../../ui/image/Image";
import Buttton from "../../ui/Button";

const defVisibleTags = 2;

const TagSets = ({ customData, defaultData }) => {
  const [tagSetsIsOpen, setTagSetsIsOpen] = useState(false);
  const [tagSets, setTagSets] = useState([]);
  const [allTagSets, setAllTagSets] = useState([]);
  const [tagsetItemHeight, setTagsetItemHeight] = useState(500);
  const [tagsetListHeight, setTagsetListHeight] = useState(500);
  const model = useSelector((state) => state.model.model);
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const tagSetItemRef = useRef();
  const tagSetListRef = useRef();

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
    const tagSetsData = customData?.length ? customData : defaultData;
    console.log(tagSetsData);
    console.log(customData, defaultData);
    if (!tagSetsData) return;
    setAllTagSets(tagSetsData);
    setTagSets(tagSetsData);
    const itemHeight = tagSetItemRef?.current?.offsetHeight;
    const listHeight = tagSetListRef?.current?.offsetHeight;
    setTagsetItemHeight(itemHeight);
    setTagsetListHeight(listHeight);
    // setTagSets(
    //   tagSetsData.slice(0, tagSetsIsOpen ? tagSetsData.length : defVisibleTags)
    // );

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
      {/* <span className={classes["tag-sets__name"]}>{tagSet.name}:</span> */}
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
          coment={!customData?.length && !!defaultData?.length && "Default"}
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
    <div>
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

      {allTagSets.length > defVisibleTags && (
        <Buttton
          type="button"
          className={classes["tag-sets__btn"]}
          onClick={showAllTagSetsHandler}
        >
          {!tagSetsIsOpen ? "Show All" : "Hide"}
        </Buttton>
      )}
    </div>
  );
};

export default TagSets;
