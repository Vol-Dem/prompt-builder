import { useRef, useState } from "react";
import {
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

import classes from "./PromptButtonCopy.module.scss";

/**
 * Prompt copy button.
 *
 * Copies the provided prompt string to the clipboard and
 * briefly shows a visual confirmation state.
 *
 * Responsibilities:
 * - Copies prompt text to the system clipboard.
 * - Displays temporary "copied" feedback.
 *
 * @component
 *
 * @param {Object} props
 * @param {string} props.promptData - Current prompt string to copy.
 *
 * @returns {JSX.Element} Copy prompt button.
 */
const PromptButtonCopy = ({ promptData }) => {
  const [copied, setCopied] = useState(false);
  const timeoutCopiedRef = useRef(null);

  const copyToClipboardHandler = () => {
    if (timeoutCopiedRef.current) {
      clearTimeout(timeoutCopiedRef.current);
    }

    navigator.clipboard.writeText(promptData);
    setCopied(true);

    timeoutCopiedRef.current = setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <button
      type="button"
      data-type="negative"
      onClick={copyToClipboardHandler}
      className={classes["btn-copy"]}
      title="Copy"
    >
      {!copied && <DocumentDuplicateIcon />}
      {copied && <DocumentArrowDownIcon className={classes.copied} />}
    </button>
  );
};

export default PromptButtonCopy;
