import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

import classes from "./ImageSeed.module.scss";
import CopyControl from "../../../../ui/CopyControl";

type ImageSeedProps = { value: number };

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
const ImageSeed = ({ value }: ImageSeedProps) => {
  return (
    <CopyControl
      as="span"
      text={String(value)}
      className={classes.seed}
      copiedClassName={classes["seed--copied"]}
      idleIcon={<ClipboardDocumentIcon />}
      copiedIcon={<ClipboardDocumentCheckIcon />}
    >
      {value}
    </CopyControl>
  );
};

export default ImageSeed;
