import classes from "./TextContentBlock.module.scss";

const TextContentBlock = ({ children, className }) => {
  return (
    <div className={`${classes.content} ${className || ""}`}>{children}</div>
  );
};

export default TextContentBlock;
