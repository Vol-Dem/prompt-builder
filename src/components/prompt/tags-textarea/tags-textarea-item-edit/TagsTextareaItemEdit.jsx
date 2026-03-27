import { CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Input from "../../../ui/forms/Input";
import classes from "./TagsTextareaItemEdit.module.scss";
import { promptActions } from "../../../../store/prompt";
import { changeTagWeight } from "../../../../utils/promptUtils";

/**
 * Inline tag editor.
 *
 * Allows editing the tag text and its weight.
 *
 * Responsibilities:
 * - Edits tag value and weight.
 * - Validates and normalizes input.
 * - Commits changes back to Redux.
 *
 * @component
 *
 * @param {Object} props
 * @param {'positive' | 'negative'} props.promptType - Prompt channel this tag belongs to.
 * @param {Object} props.item - Current tag data being edited.
 * @param {number} props.inputWidth - Calculated width for the input field.
 *
 * @returns {JSX.Element} Tag edit controls.
 */
const TagsTextareaItemEdit = ({ item, inputWidth, promptType }) => {
  const [editTagInput, setEditTagInput] = useState({ value: item.tag });
  const [editWeightInput, setEditWeightInput] = useState({
    value: item?.weight || 1,
  });
  const curPosPromptArr = useSelector((state) => state.prompt.curPromptArr);
  const curNegPromptArr = useSelector((state) => state.prompt.curNegPromptArr);
  const dispatch = useDispatch();

  const changeWeightHandler = (e) => {
    setEditWeightInput((prevState) => {
      const strenghth =
        e.target.dataset.type === "+"
          ? prevState.value + 0.1
          : prevState.value - 0.1;

      return { value: +strenghth.toFixed(1) };
    });
  };

  const submitEditHandler = (e) => {
    e.preventDefault();

    const newTag = editTagInput.value;
    const newWeight = editWeightInput.value;

    const curPrompt =
      promptType === "positive" ? curPosPromptArr : curNegPromptArr;

    const newPrompt = curPrompt.map((tagData) => {
      if (tagData.id === item.id) {
        const tag = changeTagWeight(newTag, newWeight);

        return {
          ...tagData,
          tag: tag,
          weight: newWeight,
          edit: false,
        };
      }

      return tagData;
    });

    if (promptType === "positive") {
      dispatch(promptActions.setCurPromptArr(newPrompt));
    }

    if (promptType === "negative") {
      dispatch(promptActions.setCurNegPromptArr(newPrompt));
    }
  };

  return (
    <form onSubmit={submitEditHandler} className={classes["tag__content"]}>
      <Input
        autoFocus={true}
        autoComplete="off"
        fitContent={true}
        type="text"
        name="tag"
        value={editTagInput.value}
        onChange={(e) => {
          setEditTagInput({ value: e.target.value });
        }}
        style={{
          width: inputWidth ? inputWidth + 15 : "auto",
          maxWidth: inputWidth ? inputWidth + 15 : "auto",
        }}
      />
      <Input
        type="text"
        name="weight"
        value={editWeightInput.value}
        autoComplete="off"
        onChange={(e) => {
          setEditWeightInput({ value: e.target.value });
        }}
        className={classes["tag__weight"]}
      />
      <div className={classes["activation-tag__btn-container"]}>
        <button
          type="button"
          title="up"
          className={classes["activation-tag__btn"]}
          onClick={changeWeightHandler}
          data-type="+"
        >
          <span
            data-type="+"
            className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--up"]}`}
          ></span>
        </button>
        <button
          type="button"
          title="down"
          className={classes["activation-tag__btn"]}
          onClick={changeWeightHandler}
          data-type="-"
        >
          <span
            data-type="-"
            className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--down"]}`}
          ></span>
        </button>
      </div>
      <button
        type="submit"
        className={`${classes.btn} ${classes["btn--submit"]}`}
      >
        <span
          className={`${classes["tag__cross"]} ${classes["tag__cross--submit"]}`}
        >
          <CheckIcon />
        </span>
      </button>
    </form>
  );
};

export default TagsTextareaItemEdit;
