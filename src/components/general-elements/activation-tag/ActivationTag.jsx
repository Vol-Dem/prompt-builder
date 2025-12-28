import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Tag from "../tag/Tag";
import classes from "./ActivationTag.module.scss";
import { promptActions } from "../../../store/prompt";
import { getTagWeight, splitTags } from "../../../utils/promptUtils";

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
const ActivationTag = ({ tag, modelData }) => {
  const dispatch = useDispatch();
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const curTagName = tag.split(":").slice(0, -1).join(":");
  const curTagWeight = useMemo(() => {
    const activationTagFromPrompt = splitTags(curPrompt)?.find((word) =>
      word.includes(curTagName)
    );

    return getTagWeight(activationTagFromPrompt);
  }, [curPrompt, curTagName]);

  const weightHandler = (e) => {
    const weight =
      e.target.dataset.type === "inc" ? curTagWeight + 0.1 : curTagWeight - 0.1;

    dispatch(
      promptActions.changeActivationTag({
        prevTag: curTagName,
        newTag: `${curTagName}:${weight.toFixed(1)}>`,
        weight: +weight.toFixed(1),
      })
    );
  };

  return (
    <div className={classes["activation-tag"]}>
      <Tag
        tag={curTagWeight ? `${curTagName}:${curTagWeight.toFixed(1)}>` : tag}
        promptType="positive"
        modelData={modelData}
      />
      {curTagWeight !== null && (
        <div className={classes["activation-tag__btn-container"]}>
          <button
            type="button"
            title="up"
            className={classes["activation-tag__btn"]}
            onClick={weightHandler}
            data-type="inc"
          >
            <span
              data-type="inc"
              className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--up"]}`}
            ></span>
          </button>
          <button
            type="button"
            title="down"
            className={classes["activation-tag__btn"]}
            onClick={weightHandler}
            data-type="dec"
          >
            <span
              data-type="dec"
              className={`${classes["activation-tag__btn-arrow"]} ${classes["activation-tag__btn-arrow--down"]}`}
            ></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivationTag;
