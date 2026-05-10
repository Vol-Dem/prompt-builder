import Button from "./buttons/Button";
import classes from "./DeleteRequest.module.scss";
import ErrorMessage from "./ErrorMessage";
import Modal from "./Modal";
import Spinner from "./Spinner";

type DeleteRequestProps = {
  message: string;
  onSubmit: () => void;
  onClose: () => void;
  isDeleting?: boolean;
  errorMessage?: string;
};

/**
 * Confirmation dialog for destructive delete actions.
 *
 * Displays a message, error state, or loading spinner.
 *
 * @param props
 * @param props.message - Confirmation message.
 * @param props.onSubmit - Called when user confirms delete.
 * @param props.onClose - Called when modal is closed.
 * @param props.isDeleting - Indicates delete is in progress.
 * @param props.errorMessage - Error message from delete request.
 * @returns Rendered delete confirmation modal.
 */
const DeleteRequest = ({
  message,
  onSubmit,
  onClose,
  isDeleting,
  errorMessage,
}: DeleteRequestProps) => {
  return (
    <Modal onClose={onClose}>
      <div className={classes["del-request"]}>
        {!isDeleting && !errorMessage && (
          <div className={classes["del-request__message"]}>{message}</div>
        )}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {isDeleting && (
          <div className={classes["del-request__message"]}>
            Don't close this window until the deletion is complete
          </div>
        )}
        {!isDeleting && !errorMessage && (
          <div className={classes["del-request__btn-container"]}>
            <Button className={classes["btn-del"]} onClick={onSubmit}>
              Delete
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </div>
        )}
        {isDeleting && (
          <div className={classes["spinner-container"]}>
            <Spinner size="medium" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeleteRequest;
