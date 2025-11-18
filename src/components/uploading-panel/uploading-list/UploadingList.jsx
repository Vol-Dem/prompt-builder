import classes from "./UploadingList.module.scss";

const UploadingList = ({ children, title, buttons }) => {
  return (
    <>
      <div className={classes["rejected-panel"]}>
        <div
          className={`${classes["rejected-panel__title"]} ${classes["rejected-panel__title--rejected"]}`}
        >
          {title}
        </div>
        <div className={classes["btns-container"]}>{buttons}</div>
      </div>
      <ul>{children}</ul>
    </>
  );
};

export default UploadingList;
