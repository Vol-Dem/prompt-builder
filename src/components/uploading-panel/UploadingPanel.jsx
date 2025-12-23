import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";

import classes from "./UploadingPanel.module.scss";
import { savePost } from "../../store/upload";
import DropDownList from "../ui/DropDownList";
import UploadingItem from "./uploading-item/UploadingItem";
import UploadingRejected from "./uploading-rejected/UploadingRejected";
import UploadingCompleted from "./uploading-completed/UploadingCompleted";
import UploadingButton from "./uploading-button/UploadingButton";

const UploadingPanel = () => {
  const [uploadingListIsOpen, setUploadingLIstIsOpen] = useState(false);
  const uid = useSelector((state) => state.auth.user.uid);
  const queue = useSelector((state) => state.upload.queue);
  const curPostId = useSelector((state) => state.upload.curPostId);
  const dispatch = useDispatch();

  const beforeUnloadHandler = useCallback((event) => {
    // Recommended
    event.preventDefault();
    setUploadingLIstIsOpen(true);

    // Included for legacy support, e.g. Chrome/Edge < 119
    event.returnValue = true;
  }, []);

  const closeUploadingLIstHandler = () => {
    setUploadingLIstIsOpen(false);
  };

  const closeMenuHandler = useCallback((e) => {
    if (!e.target.closest(`.${classes.uploading}`)) {
      setUploadingLIstIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (
      uid &&
      !!queue.length &&
      !curPostId &&
      curPostId !== queue[0].curPostId
    ) {
      dispatch(savePost(queue[0]));
    }
  }, [dispatch, uid, queue, curPostId]);

  const openUploadingLIstHandler = () => {
    setUploadingLIstIsOpen((prevstate) => !prevstate);
  };

  useEffect(() => {
    if (queue.length) {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.addEventListener("beforeunload", beforeUnloadHandler);
    } else {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    }

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [queue, beforeUnloadHandler]);

  useEffect(() => {
    if (uploadingListIsOpen) {
      document.removeEventListener("click", closeMenuHandler);
      document.addEventListener("click", closeMenuHandler);
    } else {
      document.removeEventListener("click", closeMenuHandler);
    }

    return () => {
      document.removeEventListener("click", closeMenuHandler);
    };
  }, [uploadingListIsOpen, closeMenuHandler]);

  const uploadingItems = queue.map((item, i) => {
    return <UploadingItem key={i} data={item} curPostId={curPostId} />;
  });

  return (
    <div className={classes.uploading}>
      <UploadingButton onClick={openUploadingLIstHandler} />
      <AnimatePresence>
        {uploadingListIsOpen && (
          <DropDownList
            title="Uploading queue"
            className={classes["uploading-dropdown"]}
            onClose={closeUploadingLIstHandler}
          >
            <ul className={classes["uploading-list"]}>{uploadingItems}</ul>
            {!queue.length && (
              <div className={classes["uploading__empty"]}>
                Uploading queue is empty
              </div>
            )}
            <UploadingRejected />
            <UploadingCompleted />
          </DropDownList>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadingPanel;
