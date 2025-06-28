import { useState } from "react";
import Buttton from "../Button";
import classes from "./ButtonDelete.module.scss";
import { AnimatePresence } from "framer-motion";
import DeleteRequest from "../DeleteRequest";

const ButtonDelete = ({
  isLoading,
  isDeleting,
  onClick,
  onDelete,
  message,
  errorMessage,
  className,
}) => {
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
