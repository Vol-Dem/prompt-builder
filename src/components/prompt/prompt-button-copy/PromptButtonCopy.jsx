import { useRef, useState } from "react";
import {
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

import classes from "./PromptButtonCopy.module.scss";

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
