import Buttton from "../../ui/buttons/Button";
import Modal from "../../ui/Modal";
import classes from "./ExitGuideRequest.module.scss";

const ExitGuideRequest = (props) => {
  const { onSubmit, onClose } = props;
  return (
    <Modal onClose={onClose} className={classes.modal}>
      <div className={classes["exit-request"]}>
        <div className={classes["exit-request__message"]}>{props.children}</div>
        <div className={classes["exit-request__btn-container"]}>
          <Buttton className={classes["btn-exit"]} onClick={onSubmit}>
            Exit tutorial
          </Buttton>
          <Buttton onClick={onClose}>Cancel</Buttton>
        </div>
      </div>
    </Modal>
  );
};

export default ExitGuideRequest;
