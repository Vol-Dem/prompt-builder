import classes from "./ImageTabs.module.scss";
const ImageTabs = ({ curTab, onClick }) => {
  return (
    <div className={classes["mode-switch"]}>
      <span
        className={`${classes["btn-mode"]} ${classes["btn-mode--left"]} ${
          curTab === "saved" ? classes["btn-mode--active"] : ""
        }`}
        data-tab="saved"
        onClick={onClick}
      >
        Saved
      </span>
      <span
        className={`${classes["btn-mode"]} ${classes["btn-mode--right"]} ${
          curTab === "all" ? classes["btn-mode--active"] : ""
        }`}
        data-tab="all"
        onClick={onClick}
      >
        All
      </span>
    </div>
  );
};

export default ImageTabs;
