import type { ComponentProps } from "react";

import { promptActions } from "../../../store/prompt";
import classes from "./Tag.module.scss";
import { addModelToPanel } from "../../../store/usedModels";
import { splitTags } from "../../../utils/promptUtils";
import type { PromptType } from "../../../types/prompt.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { SidebarPreviewData } from "../../../types/general.types";

type TagProps = ComponentProps<"div"> & {
  tag: string;
  promptType: PromptType;
  modelData?: SidebarPreviewData;
};

/**
 * Interactive tag used to build a prompt.
 *
 * Adds or removes the tag from the prompt field when clicked, highlights
 * itself when already present in the prompt, and optionally adds the related
 * model to the sidebar when model data is provided.
 *
 * @component
 *
 * @param props
 * @param props.tag - Tag label displayed to the user.
 * @param props.promptType - Type of prompt this tag belongs to.
 * @param props.modelData - Optional model data added to the sidebar when the tag is selected.
 * @param props.ref - Optional ref to the tag element.
 *
 * @returns The interactive tag element.
 */
const Tag = ({ tag, promptType, modelData, ref }: TagProps) => {
  const curPrompt = useAppSelector((state) =>
    promptType === "positive" ? state.prompt.curPrompt : state.prompt.curNegPrompt,
  );
  const isInPrompt = splitTags(curPrompt).includes(tag);
  const dispatch = useAppDispatch();

  const addTagHandler = () => {
    if (!isInPrompt) {
      dispatch(
        promptActions.addTagToPrompt({
          type: promptType,
          value: tag,
        }),
      );
      if (modelData) {
        dispatch(addModelToPanel(modelData));
      }
    } else {
      dispatch(
        promptActions.removeTag({
          type: promptType,
          value: tag,
        }),
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
