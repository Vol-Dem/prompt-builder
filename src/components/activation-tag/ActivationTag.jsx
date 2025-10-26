import { useEffect, useState } from "react";
import Tag from "../tag/Tag";
import classes from "./ActivationTag.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";
import { getTagWeight, splitTags } from "../../utils/promptUtils";

const ActivationTag = ({ tag, modelData }) => {
  const dispatch = useDispatch();
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const curTagName = tag.split(":").slice(0, -1).join(":");
  const [curTagWeight, setCurTagWeight] = useState(null);

  useEffect(() => {
    const activationTagFromPrompt = splitTags(curPrompt)?.find((word) =>
      word.includes(curTagName)
    );
    const curWeight = getTagWeight(activationTagFromPrompt);

    if (curWeight) {
      setCurTagWeight(curWeight);
    }
  }, [curPrompt, curTagName]);

  const weightHandler = (e) => {
    setCurTagWeight((prevState) => {
      const weight =
        e.target.dataset.type === "inc" ? prevState + 0.1 : prevState - 0.1;

      dispatch(
        promptActions.changeActivationTag({
          prevTag: curTagName,
          newTag: `${curTagName}:${weight.toFixed(1)}>`,
          weight: +weight.toFixed(1),
        })
      );
      return +weight.toFixed(1);
    });
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
