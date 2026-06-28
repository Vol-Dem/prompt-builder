import Tooltip from "../../../ui/Tooltip";
import ModelTooltip from "../../model-tooltip/ModelTooltip";
import classes from "./ImageTabs.module.scss";

type ImageTabsProps = {
  curTab: string;
  saved: boolean;
  onClick: (tab: "saved" | "all") => void;
};

/**
 * Displays buttons that allow to change current tab
 *
 * @component
 *
 * @param props
 * @param props.curTab - Current tab.
 * @param props.onClick - Callback when tab clicked.
 *
 * @returns Image tabs component.
 */
const ImageTabs = ({ curTab, onClick, saved }: ImageTabsProps) => {
  return (
    <div className={classes["mode-switch"]}>
      <span
        className={`${classes["btn-mode"]} ${classes["btn-mode--left"]} ${
          curTab === "saved" ? classes["btn-mode--active"] : ""
        }`}
        onClick={() => saved && onClick("saved")}
      >
        <Tooltip
          className={classes["tags__btn-edit-tooltip"]}
          content={!saved ? <ModelTooltip /> : ""}
        >
          Saved
        </Tooltip>
      </span>
      <span
        className={`${classes["btn-mode"]} ${classes["btn-mode--right"]} ${
          curTab === "all" ? classes["btn-mode--active"] : ""
        }`}
        onClick={() => onClick("all")}
      >
        All
      </span>
    </div>
  );
};

export default ImageTabs;
