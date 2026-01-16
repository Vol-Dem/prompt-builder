import Buttton from "../../ui/buttons/Button";
import Modal from "../../ui/Modal";
import classes from "./ExitGuideRequest.module.scss";

/**
 * Exit guide request component.
 *
 * Displays close guide popup.
 *
 * @component
 *
 * @param {object} props
 * @param {() => void} onClose - Callback to close the request.
 * @param {() => void} onSubmit - Callback to close the tutorial.
 * @param {string} className - Optional class name.
 *
 * @returns {JSX.Element} Exit guide request element.
 */
const ExitGuideRequest = ({ onSubmit, onClose, children }) => {
  return (
    <Modal onClose={onClose}>
      <div className={classes["exit-request"]}>
        <div className={classes["exit-request__message"]}>{children}</div>
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
