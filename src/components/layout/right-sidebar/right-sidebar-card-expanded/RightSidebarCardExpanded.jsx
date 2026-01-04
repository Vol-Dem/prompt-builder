import { useEffect, useRef, useState } from "react";

import ActivationTag from "../../../general-elements/activation-tag/ActivationTag";
import TagList from "../../../general-elements/tag-list/TagList";
import Arrow from "../../../ui/Arrow";
import classes from "./RightSidebarCardExpanded.module.scss";

const taglistItemHeight = 68;

/**
 * Animated right sidebar card component.
 *
 * Renders an expanded layout of the preview card inside the right sidebar.
 * Provides quick access to model tags and activation tag.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.previewData - Data used to render the preview card.
 *
 * @returns {JSX.Element} The expanded content of the right sidebar card component.
 */
const RightSidebarCardExpanded = ({ previewData }) => {
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const [tagsHeight, setTagsHeight] = useState(null);
  const [taglistHeight, setTaglistHeight] = useState(null);
  const tagsRef = useRef();
  const tagsListRef = useRef();

  const openTagsHandler = () => {
    setTagsIsOpen((prev) => {
      if (prev) {
        setTagsHeight(null);
      } else {
        setTagsHeight(taglistHeight);
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (tagsRef?.current?.clientHeight)
      setTaglistHeight(tagsRef?.current?.clientHeight);
    if (taglistHeight === taglistItemHeight) setTagsHeight(taglistItemHeight);
  }, [previewData, taglistHeight, tagsRef?.current?.clientHeight]);

  return (
    <div className={classes.content}>
      {(!!previewData?.minWeight || !!previewData?.weight) && (
        <div className={classes["weight"]}>
          <span>Weight:</span>
          <span className={classes["weight__value"]}>
            {previewData?.minWeight
              ? `${previewData?.minWeight?.toFixed(1)} -
                    ${previewData?.maxWeight?.toFixed(1)}`
              : ""}{" "}
            {previewData?.weight ? `(${previewData?.weight?.toFixed(1)})` : ""}
          </span>
        </div>
      )}
      {!!previewData?.mainTag && (
        <div className={classes["main-tag"]}>
          <ActivationTag
            tag={previewData.mainTag}
            modelData={previewData}
            strength={previewData.weight}
          />
        </div>
      )}

      <div className={classes["tags-container"]}>
        {!!previewData?.tags?.length && (
          <>
            <div
              className={`${classes.tags} ${
                tagsIsOpen ? classes["tags--open"] : ""
              }`}
              style={tagsHeight ? { maxHeight: `${tagsHeight}px` } : {}}
            >
              <div
                ref={tagsRef}
                className={`${classes["tags__list"]} ${
                  taglistHeight > taglistItemHeight ? classes.shadow : ""
                }`}
              >
                <TagList
                  name="Trigger words"
                  ref={tagsListRef}
                  tags={previewData.tags}
                  className={classes["tag-list"]}
                  promptType="positive"
                />
              </div>
            </div>
            {taglistHeight > taglistItemHeight && (
              <button
                className={`${classes["tags__btn"]} ${
                  !tagsIsOpen ? classes["tags__btn--shadow"] : ""
                }`}
                onClick={openTagsHandler}
              >
                <Arrow direction={tagsIsOpen ? "up" : "down"} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RightSidebarCardExpanded;
