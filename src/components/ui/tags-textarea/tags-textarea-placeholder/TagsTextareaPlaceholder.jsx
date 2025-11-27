import classes from "./TagsTextareaPlaceholder.module.scss";

const TagsTextareaPlaceholder = ({ aditional, children }) => {
  return (
    <li
      className={`${classes.placeholder} ${
        aditional ? classes["placeholder--aditional"] : ""
      }`}
    >
      {children}
    </li>
  );
};

export default TagsTextareaPlaceholder;
