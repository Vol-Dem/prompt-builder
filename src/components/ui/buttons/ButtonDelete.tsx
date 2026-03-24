import { useState, type ComponentProps } from "react";
import { AnimatePresence } from "framer-motion";

import Buttton from "./Button";
import classes from "./ButtonDelete.module.scss";
import DeleteRequest from "../DeleteRequest";

type ButtonDeleteProps = ComponentProps<"button"> & {
  isLoading?: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onClick: () => void;
  message: string;
  errorMessage: string;
};

const ButtonDelete = ({
  isLoading,
  isDeleting,
  onClick,
  onDelete,
  message,
  errorMessage,
  className,
  ...props
}: ButtonDeleteProps) => {
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);

  const showDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(true);
    onClick();
  };

  const closeDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(false);
  };
  return (
    <>
      <Buttton
        type="button"
        onClick={showDeleteReqeustHandler}
        className={`${classes["btn-del"]} ${className || ""}`}
        disabled={isLoading}
        {...props}
      >
        Delete
      </Buttton>
      <AnimatePresence>
        {deleteRequestIsOpen && (
          <DeleteRequest
            message={message}
            onSubmit={onDelete}
            onClose={closeDeleteReqeustHandler}
            isDeleting={isDeleting}
            errorMessage={errorMessage}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ButtonDelete;
