import Buttton from "./Button";
import classes from "./DeleteRequest.module.scss";
import Modal from "./Modal";

const DeleteRequest = ({ message, onSubmit, onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className={classes["del-request"]}>
        <div className={classes["del-request__message"]}>{message}</div>
        <div className={classes["del-request__btn-container"]}>
          <Buttton className={classes["btn-del"]} onClick={onSubmit}>
            Delete
          </Buttton>
          <Buttton onClick={onClose}>Cancel</Buttton>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRequest;
