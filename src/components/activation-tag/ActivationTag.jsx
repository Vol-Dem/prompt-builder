import { useEffect, useState } from "react";
import Tag from "../tag/Tag";
import classes from "./ActivationTag.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { promptActions } from "../../store/prompt";

const ActivationTag = ({ tag, modelData, strength }) => {
  const [curTagName, setCurTagName] = useState(tag);
  const [curTagStrength, setCurTagStrength] = useState(null);
  const dispatch = useDispatch();
  const curPrompt = useSelector((state) => state.prompt.curPrompt);

  useEffect(() => {
    // console.log(tag);
    const tagName = tag.split(":").slice(0, -1).join(":");
    const curStr = parseFloat(tag?.split(":")?.slice(-1));
    // console.log(tag.split(":"));
    // console.log(tagName);
    setCurTagName(tagName);
    if (curStr) {
      setCurTagStrength(curStr);
    }
  }, [tag]);

  useEffect(() => {
    const curPromptTag = curPrompt
      ?.split(",")
      ?.find((word) => word.includes(curTagName));
    const curStr = parseFloat(curPromptTag?.split(":")?.slice(-1));

    if (curStr) {
      setCurTagStrength(curStr);
    }
  }, [curPrompt, curTagName]);

  const strengthHandler = (e) => {
    setCurTagStrength((prevState) => {
      const strenghth =
        e.target.dataset.type === "inc" ? prevState + 0.1 : prevState - 0.1;
      console.log(strenghth);
      dispatch(
        promptActions.changeActivationTag({
          prevTag: curTagName,
          newTag: `${curTagName}:${+strenghth.toFixed(2)}>`,
        })
      );
      return +strenghth.toFixed(2);
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
    </div>
  );
};

export default ActivationTag;
