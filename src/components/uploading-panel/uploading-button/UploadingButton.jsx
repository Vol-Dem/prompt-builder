import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import classes from "./UploadingButton.module.scss";
import { useSelector } from "react-redux";

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
