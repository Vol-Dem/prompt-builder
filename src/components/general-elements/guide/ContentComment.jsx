import classes from "./ContentComment.module.scss";

const ContentComment = ({ children, className }) => {
  return (
    <span className={`${classes.comment} ${className || ""}`}>{children}</span>
  );
};

export default ContentComment;
