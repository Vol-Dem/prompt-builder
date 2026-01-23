import Buttton from "./buttons/Button";
import classes from "./DeleteRequest.module.scss";
import ErrorMessage from "./ErrorMessage";
import Modal from "./Modal";
import Spinner from "./Spinner";

/**
 * Confirmation dialog for destructive delete actions.
 *
 * Displays a message, error state, or loading spinner.
 *
 * @param {string} message - Confirmation message.
 * @param {function} onSubmit - Called when user confirms delete.
 * @param {function} onClose - Called when modal is closed.
 * @param {boolean} isDeleting - Indicates delete is in progress.
 * @param {string} [errorMessage] - Error message from delete request.
 * @returns {JSX.Element} Rendered delete confirmation modal.
 */
const DeleteRequest = ({
  message,
  onSubmit,
  onClose,
  isDeleting,
  errorMessage,
}) => {
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
            <Buttton className={classes["btn-del"]} onClick={onSubmit}>
              Delete
            </Buttton>
            <Buttton onClick={onClose}>Cancel</Buttton>
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
