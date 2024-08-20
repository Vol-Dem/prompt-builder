import classes from "./DropDownList.module.scss";
const DropDownList = (props) => {
  return (
    <div className={`${classes["search__dropdown"]} ${props.className || ""}`}>
      <div className={classes["search__settings"]}>
        <button
          className={classes["search__btn-close"]}
          onClick={() => {
            props.onClose();
          }}
        >
          <span className={classes["search__cross"]}></span>
        </button>
      </div>
      <div className={classes["search__result"]}>{props.children}</div>
    </div>
  );
};

export default DropDownList;
