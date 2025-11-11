import { useState } from "react";
import classes from "./ImageSeed.module.scss";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

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
