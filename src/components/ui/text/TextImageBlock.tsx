import type { ComponentProps } from "react";
import classes from "./TextImageBlock.module.scss";

type TextImageBlockProps = ComponentProps<"div"> & {
  col?: number;
};

const TextImageBlock = ({
  col = 1,
  children,
  className,
}: TextImageBlockProps) => {
  return (
    <div
      className={`${classes["image-block"]} ${
        classes[`image-block--col-${col}`]
      } ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default TextImageBlock;
