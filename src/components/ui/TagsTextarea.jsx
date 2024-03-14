import { useDispatch } from "react-redux";
import classes from "./TagsTextarea.module.scss";
import { promptActions } from "../../store/prompt";

const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

const TagsTextarea = ({ data, className, placeholder }) => {
  const dispatch = useDispatch();

  const removeTagHandler = (e) => {
    dispatch(
      promptActions.addTagToPrompt({
        //   type: props.promptType,
        type: "positive",
        value: e.target.dataset.value,
      })
    );
  };

  const tagItemsHtml = data
    .trim()
    .split(splitRegEx)
    .flatMap((item) => {
      if (!item) return [];
      return (
        <li className={classes.tag}>
          <span className={classes["tag__text"]}>{item.trim()}</span>
          <button
            type="button"
            className={classes.btn}
            onClick={removeTagHandler}
            data-value={item.trim()}
          >
            X
          </button>
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
