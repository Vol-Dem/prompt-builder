import classes from "./TextHighlight.module.scss";

const TextHighlight = ({ children, className }) => {
  return (
    <span className={`${classes["highlight"]} ${className || ""}`}>
      {children}
    </span>
  );
};

export default TextHighlight;
