import classes from "./TextButtonCollection.module.scss";

const TextButtonCollection = ({ className }) => {
  return (
    <span className={`${classes.btn} ${className || ""}`}>Collection</span>
  );
};

export default TextButtonCollection;
