import {
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

import classes from "./PromptButtonCopy.module.scss";
import CopyControl from "../../ui/CopyControl";

type PromptButtonCopyProps = { promptData: string };

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
 * @param props
 * @param props.promptData - Current prompt string to copy.
 *
 * @returns Copy prompt button.
 */
const PromptButtonCopy = ({ promptData }: PromptButtonCopyProps) => {
  return (
    <CopyControl
      type="button"
      data-type="negative"
      text={promptData}
      className={classes["btn-copy"]}
      title="Copy"
      idleIcon={<DocumentDuplicateIcon />}
      copiedIcon={<DocumentArrowDownIcon className={classes.copied} />}
    />
  );
};

export default PromptButtonCopy;
