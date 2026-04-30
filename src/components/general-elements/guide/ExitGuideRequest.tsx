import type { ComponentProps } from "react";
import Button from "../../ui/buttons/Button";
import Modal from "../../ui/Modal";
import classes from "./ExitGuideRequest.module.scss";

type ExitGuideRequestProps = ComponentProps<"div"> & {
  onSubmit: () => void;
  onClose: () => void;
};

/**
 * Exit guide request component.
 *
 * Displays close guide popup.
 *
 * @component
 *
 * @param props
 * @param onClose - Callback to close the request.
 * @param onSubmit - Callback to close the tutorial.
 * @param className - Optional class name.
 *
 * @returns Exit guide request element.
 */
const ExitGuideRequest = ({
  onSubmit,
  onClose,
  children,
}: ExitGuideRequestProps) => {
  return (
    <Modal onClose={onClose}>
      <div className={classes["exit-request"]}>
        <div className={classes["exit-request__message"]}>{children}</div>
        <div className={classes["exit-request__btn-container"]}>
          <Button className={classes["btn-exit"]} onClick={onSubmit}>
            Exit tutorial
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExitGuideRequest;
