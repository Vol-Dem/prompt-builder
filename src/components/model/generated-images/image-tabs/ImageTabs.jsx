import classes from "./ImageTabs.module.scss";

/**
 * Displays buttons that allow to change current tab
 *
 * @component
 *
 * @param {object} props
 * @param {number} props.curTab - Current tab.
 * @param {(tab: ('saved' | 'all'))=>} props.onClick - Callback when tab clicked.
 *
 * @returns {JSX.Element} Image tabs component.
 */
const ImageTabs = ({ curTab, onClick }) => {
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
