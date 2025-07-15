import classes from "./TextButtonCreate.module.scss";

const TextButtonCreate = ({ className }) => {
  return <span className={`${classes.btn} ${className || ""}`}>Create</span>;
};

export default TextButtonCreate;
