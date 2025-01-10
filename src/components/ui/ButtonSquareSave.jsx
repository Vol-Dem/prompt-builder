import classes from "./ButtonSquareSave.module.scss";
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";
import ButtonSquare from "./ButtonSquare";

const ButtonSquareSave = ({ className, onClick }) => {
  return (
    <>
      <ButtonSquare
        className={`${className || ""}`}
        onClick={onClick}
        title="Add model to collection"
      >
        <FolderArrowDownIcon className={classes["icon"]} />
      </ButtonSquare>
    </>
  );
};

export default ButtonSquareSave;
