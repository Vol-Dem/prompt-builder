import type { ComponentProps } from "react";
import classes from "./TextButtonCollection.module.scss";

type TextButtonCollectionProps = ComponentProps<"span">;

const TextButtonCollection = ({ className }: TextButtonCollectionProps) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>Collection</span>
  );
};

export default TextButtonCollection;
