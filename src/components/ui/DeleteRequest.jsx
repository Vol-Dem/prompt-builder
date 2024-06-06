import Buttton from "./Button";
import classes from "./DeleteRequest.module.scss";
import Modal from "./Modal";
import Spinner from "./Spinner";

const DeleteRequest = ({ message, onSubmit, onClose, isDeleting }) => {
  return (
    <Modal onClose={onClose}>
      <div className={classes["del-request"]}>
        {!isDeleting && (
          <div className={classes["del-request__message"]}>{message}</div>
        )}
        {isDeleting && (
          <div className={classes["del-request__message"]}>
            Don't close this window until deleting is complete
          </div>
        )}
        {!isDeleting && (
          <div className={classes["del-request__btn-container"]}>
            <Buttton className={classes["btn-del"]} onClick={onSubmit}>
              Delete
            </Buttton>
            <Buttton onClick={onClose}>Cancel</Buttton>
          </div>
        )}
        {isDeleting && <Spinner size="medium" />}
      </div>
    </Modal>
  );
};

export default DeleteRequest;
