import classes from "./ImageTabs.module.scss";

type ImageTabsProps = {
  curTab: string;
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
const ImageTabs = ({ curTab, onClick }: ImageTabsProps) => {
  return (
    <div className={classes["mode-switch"]}>
      <span
        className={`${classes["btn-mode"]} ${classes["btn-mode--left"]} ${
          curTab === "saved" ? classes["btn-mode--active"] : ""
        }`}
        onClick={() => onClick("saved")}
      >
        Saved
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
