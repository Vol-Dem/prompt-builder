import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { promptActions } from "../../../store/prompt";
import classes from "./Tag.module.scss";
import { addModelToPanel } from "../../../store/usedModels";
import { splitTags } from "../../../utils/promptUtils";

/**
 * Interactive tag used to build a prompt.
 *
 * Adds or removes the tag from the prompt field when clicked, highlights
 * itself when already present in the prompt, and optionally adds the related
 * model to the sidebar when model data is provided.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.tag - Tag label displayed to the user.
 * @param {'positive' | 'negative'} props.promptType - Type of prompt this tag belongs to.
 * @param {object} [props.modelData] - Optional model data added to the sidebar when the tag is selected.
 * @param {React.Ref<HTMLElement>} [props.ref] - Optional ref to the tag element (React 19 ref-as-prop).
 *
 * @returns {JSX.Element} The interactive tag element.
 */
const Tag = ({ tag, promptType, modelData, ref }) => {
  const [isInPrompt, setIsInPrompt] = useState(false);
  const dispatch = useDispatch();
  const curPromt = useSelector((state) => state.prompt.curPrompt);
  const curNegPromt = useSelector((state) => state.prompt.curNegPrompt);

  useEffect(() => {
    let isActive = false;

    const positiveWordsArr = splitTags(curPromt);
    const negativeWordsArr = splitTags(curNegPromt);

    if (promptType === "positive") {
      isActive = positiveWordsArr.some((word) => word === tag);
    } else if (promptType === "negative") {
      isActive = negativeWordsArr.some((word) => word === tag);
    }

    setIsInPrompt(isActive);
  }, [promptType, curPromt, curNegPromt, tag]);

  const addTagHandler = () => {
    if (!isInPrompt) {
      dispatch(
        promptActions.addTagToPrompt({
          type: promptType,
          value: tag,
        })
      );
      if (modelData) {
        dispatch(addModelToPanel(modelData));
      }
    } else {
      dispatch(
        promptActions.removeTag({
          type: promptType,
          value: tag,
        })
      );
    }
  };

  return (
    <div
      ref={ref}
      onClick={addTagHandler}
      data-type={promptType}
      className={`${classes.tag} ${isInPrompt ? classes.active : ""}`}
    >
      {tag}
    </div>
  );
};

export default Tag;
