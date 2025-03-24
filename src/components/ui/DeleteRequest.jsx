import Buttton from "./Button";
import classes from "./DeleteRequest.module.scss";
import ErrorMessage from "./ErrorMessage";
import Modal from "./Modal";
import Spinner from "./Spinner";

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
