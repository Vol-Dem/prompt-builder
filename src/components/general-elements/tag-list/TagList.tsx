import { useState, type ComponentProps } from "react";
import { motion } from "framer-motion";

import Tag from "../tag/Tag";
import classes from "./TagList.module.scss";
import { promptActions } from "../../../store/prompt";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import type { PromptType } from "../../../types/prompt.types";
import { useAppDispatch } from "../../../store/hooks/hooks";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

type TagListProps = ComponentProps<"div"> & {
  tags: string[];
  name: string;
  coment?: string;
  promptType: PromptType;
};

/**
 * List of interactive tags used to build a prompt.
 *
 * Renders list of interactive tags and buttons to add or remove all tags from the prompt field.
 * Only tags that is not yet in the prompt would be added.
 *
 * @component
 *
 * @param props
 * @param props.tags - List of tags.
 * @param props.name - List name.
 * @param props.coment - Additional text.
 * @param props.className - Optional class name.
 * @param props.promptType - Type of prompt this tag belongs to.
 * @param props.ref - Optional ref to the tag element.
 *
 * @returns {JSX.Element} The list of interactive tags element.
 */
const TagList = ({
  tags,
  name,
  coment,
  className,
  promptType,
  ref,
}: TagListProps) => {
  const [copied, setCopied] = useState(false);
  const dispatch = useAppDispatch();

  const addAllPromptHandler = () => {
    dispatch(
      promptActions.addAllTagsToPrompt({
        type: promptType,
        value: tags,
      }),
    );
  };

  const removeAllPromptHandler = () => {
    dispatch(
      promptActions.removeAllTags({
        type: promptType,
        value: tags,
      }),
    );
  };

  const copyHandler = () => {
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
          {!copied && <ClipboardDocumentIcon />}
          {copied && <ClipboardDocumentCheckIcon />}
        </ButtonTertiary>
      </div>
      <motion.ul className={classes.tags}>
        {!!tags?.length &&
          tags?.map((tag, i) => {
            return (
              <motion.li key={`${tag}-${i}`}>
                <Tag ref={ref} tag={tag} promptType={promptType} />
              </motion.li>
            );
          })}
      </motion.ul>
    </div>
  );
};

export default TagList;
