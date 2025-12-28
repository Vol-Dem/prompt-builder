import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";

import Tag from "../tag/Tag";
import classes from "./TagList.module.scss";
import { promptActions } from "../../../store/prompt";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import CopiedSvg from "../../../assets/CopiedSvg";
import CopySvg from "../../../assets/CopySvg";

const TagList = ({ tags, name, coment, className, promptType, ref }) => {
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();

  const addAllPromptHandler = (e) => {
    dispatch(
      promptActions.addAllTagsToPrompt({
        type: e.target.dataset.type,
        value: tags,
      })
    );
  };

  const removeAllPromptHandler = (e) => {
    dispatch(
      promptActions.removeAllTags({
        type: e.target.dataset.type,
        value: tags,
      })
    );
  };

  const copyHandler = () => {
    if (!tags?.length) return;
    navigator.clipboard.writeText(tags.join(", "));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className={`${classes["container"]} ${className || ""}`}>
      <div className={classes.title}>
        <div className={classes["title__text"]}>
          {name}:{coment && <span className={classes.coment}>({coment})</span>}
        </div>

        <span>
          <button
            data-type={promptType}
            onClick={addAllPromptHandler}
            className={classes["btn-copy"]}
          >
            Add all
          </button>
          <button
            data-type={promptType}
            onClick={removeAllPromptHandler}
            className={classes["btn-copy"]}
          >
            Remove all
          </button>
        </span>
        <ButtonTertiary
          className={`${classes["btn-copy"]} ${
            copied ? classes["btn-copy--copied"] : ""
          }`}
          onClick={copyHandler}
          title="Copy"
        >
          {!copied && <CopySvg />}
          {copied && <CopiedSvg />}
        </ButtonTertiary>
      </div>
      <motion.ul className={classes.tags}>
        {!!tags?.length &&
          tags?.map((tag, i) => {
            return (
              <li key={`${tag}-${i}`}>
                <Tag ref={ref} tag={tag} promptType={promptType} />
              </li>
            );
          })}
      </motion.ul>
    </div>
  );
};

export default TagList;
