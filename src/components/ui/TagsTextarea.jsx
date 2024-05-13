import { useDispatch } from "react-redux";
import classes from "./TagsTextarea.module.scss";
import { promptActions } from "../../store/prompt";

const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

const TagsTextarea = ({ data, className, placeholder, promptType }) => {
  const dispatch = useDispatch();

  const removeTagHandler = (e) => {
    dispatch(
      promptActions.removeTag({
        //   type: props.promptType,
        type: promptType,
        value: e.target.dataset.value,
      })
    );
  };

  const tagItemsHtml = data
    .trim()
    .split(splitRegEx)
    .flatMap((item, i) => {
      if (!item) return [];
      return (
        <li key={i} className={classes.tag}>
          <div className={classes["tag__content"]}>
            <span className={classes["tag__text"]}>{item.trim()}</span>
            <button
              type="button"
              className={classes.btn}
              onClick={removeTagHandler}
              data-value={item.trim()}
              data-type=""
            >
              <span className={classes["tag__cross"]}></span>
            </button>
          </div>
        </li>
      );
    });

  return (
    <ul className={`${classes.field} ${className || ""}`}>
      {!tagItemsHtml.length && (
        <li className={classes.placeholder}>{placeholder}</li>
      )}
      {tagItemsHtml}
    </ul>
  );
};

export default TagsTextarea;
