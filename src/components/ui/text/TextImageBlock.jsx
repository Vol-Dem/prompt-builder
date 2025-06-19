import classes from "./TextImageBlock.module.scss";

const TextImageBlock = ({ col = 1, children, className }) => {
  return (
    <div
      className={`${classes["image-block"]} ${
        classes[`image-block--col-${col}`]
      } ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default TextImageBlock;
