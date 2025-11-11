import classes from "./ImageInfoItem.module.scss";

const ImageInfoItem = ({ name, children }) => {
  return (
    <li className={classes["info-item"]}>
      <span className={classes["info-name"]}>{name}:</span>
      {children}
    </li>
  );
};

export default ImageInfoItem;
