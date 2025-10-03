import { useEffect, useState } from "react";
import Tag from "../tag/Tag";
import classes from "./ActivationTag.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";
import { getTagWeight } from "../../utils/generalUtils";

const ActivationTag = ({ tag, modelData, strength }) => {
  const dispatch = useDispatch();
  const curPrompt = useSelector((state) => state.prompt.curPrompt);
  const curTagName = tag.split(":").slice(0, -1).join(":");
  const curWieght = getTagWeight(tag);
  const [curTagStrength, setCurTagStrength] = useState(curWieght || null);

  useEffect(() => {
    const curPromptTag = curPrompt
      ?.split(",")
      ?.find((word) => word.includes(curTagName));
    const curStr = getTagWeight(curPromptTag);

    if (curStr) {
      setCurTagStrength(curStr);
    }
  }, [curPrompt, curTagName]);

  const strengthHandler = (e) => {
    setCurTagStrength((prevState) => {
      const strenghth =
        e.target.dataset.type === "inc" ? prevState + 0.1 : prevState - 0.1;

      dispatch(
        promptActions.changeActivationTag({
          prevTag: curTagName,
          newTag: `${curTagName}:${strenghth.toFixed(1)}>`,
          weight: +strenghth.toFixed(1),
        })
      );
      return +strenghth.toFixed(1);
    });
  };

  return (
    <div className={classes["activation-tag"]}>
      <Tag
        tag={
          curTagStrength ? `${curTagName}:${curTagStrength.toFixed(1)}>` : tag
        }
        promptType="positive"
        modelData={modelData}
      />
      {curTagStrength !== null && (
        <div className={classes["activation-tag__btn-container"]}>
          <button
            type="button"
            title="up"
            className={classes["activation-tag__btn"]}
            onClick={strengthHandler}
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
            onClick={strengthHandler}
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
