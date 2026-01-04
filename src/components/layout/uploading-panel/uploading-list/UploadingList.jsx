import classes from "./UploadingList.module.scss";

/**
 * Uploading list container.
 *
 * Renders a titled dropdown panel used by the uploading queue, including
 * a header with control buttons and a content area for list items.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.title - Dropdown title displayed in the header.
 * @param {React.ReactNode} [props.buttons] - Optional control buttons rendered in the header.
 * @param {React.ReactNode} props.children - Uploading list content.
 *
 * @returns {JSX.Element} The uploading list container element.
 */
const UploadingList = ({ children, title, buttons }) => {
  return (
    <>
      <div className={classes["panel"]}>
        <div
          className={`${classes["panel__title"]} ${classes["panel__title--rejected"]}`}
        >
          {title}
        </div>
        <div className={classes["btns-container"]}>{buttons}</div>
      </div>
      <ul>{children}</ul>
    </>
  );
};

export default UploadingList;
