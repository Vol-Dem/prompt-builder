import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";

import classes from "./UploadingButton.module.scss";

/**
 * Uploading panel toggle button.
 *
 * Displays counters for uploading, completed, and rejected image posts
 * and toggles the visibility of the uploading queue dropdown.
 *
 * @component
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the uploading list dropdown is currently open.
 * @param {() => void} props.onClick - Callback invoked to toggle the uploading list.
 *
 * @returns {JSX.Element} The uploading panel toggle button.
 */
const UploadingButton = ({ isOpen, onClick }) => {
  const queue = useSelector((state) => state.upload.queue);
  const rejected = useSelector((state) => state.upload.rejected);
  const completedAmount = useSelector((state) => state.upload.completedAmount);

  return (
    <button
      className={`${classes["uploading__btn"]} ${
        isOpen ? classes["uploading__btn--open"] : ""
      }`}
      onClick={onClick}
      title="Uploading queue"
    >
      <div
        className={`${classes["uploading__btn-content"]} ${
          queue?.length ? classes["uploading__btn-content--loading"] : ""
        }`}
      >
        <ArrowDownTrayIcon />
      </div>

      {!!queue.length && (
        <span
          className={`${classes["uploading__amount"]} ${classes["uploading__amount--queue"]}`}
        >
          {queue.length}
        </span>
      )}
      {!!completedAmount && !rejected.length && (
        <span
          className={`${classes["uploading__amount"]} ${classes["uploading__amount--completed"]}`}
        >
          {completedAmount}
        </span>
      )}
      {!!rejected.length && (
        <span
          className={`${classes["uploading__amount"]} ${classes["uploading__amount--rejected"]}`}
        >
          {rejected.length}
        </span>
      )}
    </button>
  );
};

export default UploadingButton;
