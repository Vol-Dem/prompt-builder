import { FolderArrowDownIcon } from "@heroicons/react/24/outline";

import classes from "./ButtonSquareSave.module.scss";
import ButtonSquare from "./ButtonSquare";
import type { ComponentProps } from "react";

type ButtonSquareSaveProps = ComponentProps<"button">;

const ButtonSquareSave = ({ className, ...props }: ButtonSquareSaveProps) => {
  return (
    <>
      <ButtonSquare
        className={`${className || ""}`}
        title="Add model to collection"
        {...props}
      >
        <FolderArrowDownIcon className={classes["icon"]} />
      </ButtonSquare>
    </>
  );
};

export default ButtonSquareSave;
