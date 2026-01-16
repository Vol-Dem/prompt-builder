import { useState } from "react";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

import classes from "./ImageSeed.module.scss";

/**
 * Image seed component.
 *
 * Renders image seed.
 * Handles copying seed to clipboard on click.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.value - Seed value.
 * @returns {JSX.Element} Image seed.
 */
const ImageSeed = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const copyHandler = (e) => {
    const seed = e.target.closest(`.${classes.seed}`)?.innerText;
    if (!seed) return;

    navigator.clipboard.writeText(seed);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <span
      className={`${classes.seed} ${copied ? classes["seed--copied"] : ""}`}
      onClick={copyHandler}
    >
      {value}
      {!copied && <ClipboardDocumentIcon />}
      {copied && <ClipboardDocumentCheckIcon />}
    </span>
  );
};

export default ImageSeed;
