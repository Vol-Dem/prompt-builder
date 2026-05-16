import type { ComponentProps } from "react";
import classes from "./PresetsBlock.module.scss";

type PresetsBlockProps = ComponentProps<"div"> & { title: string };

const PresetsBlock = ({ title, children }: PresetsBlockProps) => {
  return (
    <div>
      <div className={classes[`title`]}>{title}:</div>
      <div className={classes[`content`]}>{children}</div>
    </div>
  );
};

export default PresetsBlock;
