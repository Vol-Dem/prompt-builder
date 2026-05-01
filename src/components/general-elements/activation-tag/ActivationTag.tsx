import { useEffect, useState } from "react";

import Tag from "../tag/Tag";
import classes from "./ActivationTag.module.scss";
import { promptActions } from "../../../store/prompt";
import { getTagWeight, splitTags } from "../../../utils/promptUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import type { SidebarPreviewData } from "../../../types/general.types";

type ActivationTagProps = { tag: string; modelData: SidebarPreviewData };

/**
 * Enhanced Tag component that allows adjusting tag weight inside the prompt.
 *
 * Parses the current prompt to extract the tag weight, keeps it in sync with
 * Redux state, and provides increment/decrement controls to modify the weight.
 * Also passes model data through to the underlying Tag component.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.tag - Initial tag value including weight suffix.
 * @param {object} props.modelData - Model data passed to the Tag and added to the sidebar on interaction.
 *
 * @returns {JSX.Element} Activation tag with weight controls.
 */
const ActivationTag = ({ tag, modelData }: ActivationTagProps) => {
  const [tagWeight, setTagWeight] = useState(1);
  const curPrompt = useAppSelector((state) => state.prompt.curPrompt);
  const dispatch = useAppDispatch();
  const curTagName = tag.split(":").slice(0, -1).join(":");
  useEffect(() => {
    const activationTagFromPrompt = splitTags(curPrompt)?.find((word) =>
      word.includes(curTagName),
    );
    if (activationTagFromPrompt) {
      setTagWeight(getTagWeight(activationTagFromPrompt));
    }
  }, [curPrompt, curTagName]);

  const weightHandler = (type: "inc" | "dec") => {
    const weight = type === "inc" ? tagWeight + 0.1 : tagWeight - 0.1;
    setTagWeight(weight);
    dispatch(
      promptActions.changeActivationTag({
        prevTag: curTagName,
        newTag: `${curTagName}:${weight.toFixed(1)}>`,
        weight: +weight.toFixed(1),
      }),
    );
  };

  return (
    <div className={classes["activation-tag"]}>
      <Tag
        tag={tagWeight ? `${curTagName}:${tagWeight.toFixed(1)}>` : tag}
        promptType="positive"
        modelData={modelData}
      />
      {tagWeight !== null && (
        <div className={classes["activation-tag__btn-container"]}>
          <button
            type="button"
            title="up"
            className={classes["activation-tag__btn"]}
            onClick={() => weightHandler("inc")}
          >
            <span
              className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--up"]}`}
            ></span>
          </button>
          <button
            type="button"
            title="down"
            className={classes["activation-tag__btn"]}
            onClick={() => weightHandler("dec")}
          >
            <span
              className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--down"]}`}
            ></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivationTag;
