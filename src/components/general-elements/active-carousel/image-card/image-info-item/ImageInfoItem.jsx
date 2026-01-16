import classes from "./ImageInfoItem.module.scss";

/**
 * Image info item container.
 *
 * Renders metadata field.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.name - Metadata filed name.
 * @param {React.ReactNode} props.children - Metadata value.
 * @returns {JSX.Element} Image info item container.
 */
const ImageInfoItem = ({ name, children }) => {
  return (
    <li className={classes["info-item"]}>
      <span className={classes["info-name"]}>{name}:</span>
      {children}
    </li>
  );
};

export default ImageInfoItem;
