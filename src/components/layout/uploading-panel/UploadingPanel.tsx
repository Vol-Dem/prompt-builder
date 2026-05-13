import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import classes from "./UploadingPanel.module.scss";
import { savePost } from "../../../store/upload";
import DropDownList from "../../ui/DropDownList";
import UploadingItem from "./uploading-item/UploadingItem";
import UploadingRejected from "./uploading-rejected/UploadingRejected";
import UploadingCompleted from "./uploading-completed/UploadingCompleted";
import UploadingButton from "./uploading-button/UploadingButton";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

/**
 * Uploading panel controller.
 *
 * Renders a toggle button that opens a dropdown panel for tracking
 * the image uploading queue.
 *
 * Features:
 * - Displays current uploading, rejected, and completed items.
 * - Automatically starts uploading the next item in the queue.
 * - Provides UI to retry rejected uploads and clear completed items.
 * - Shows a browser warning when the user attempts to close the tab
 *   while the upload queue is not empty.
 * - Closes automatically when clicking outside of the panel.
 *
 * @component
 * @returns {JSX.Element} The uploading panel controller.
 */
const UploadingPanel = () => {
  const [uploadingListIsOpen, setUploadingLIstIsOpen] = useState(false);
  const uid = useAppSelector((state) => state.auth.user.uid);
  const queue = useAppSelector((state) => state.upload.queue);
  const curPostId = useAppSelector((state) => state.upload.curPostId);
  const dispatch = useAppDispatch();

  const beforeUnloadHandler = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
    setUploadingLIstIsOpen(true);

    // Included for legacy support, e.g. Chrome/Edge < 119
    e.returnValue = true;
  }, []);

  const closeUploadingLIstHandler = () => {
    setUploadingLIstIsOpen(false);
  };

  const closeMenuHandler = useCallback((e: PointerEvent) => {
    if (!(e.target instanceof HTMLElement)) return;

    if (!e.target.closest(`.${classes.uploading}`)) {
      setUploadingLIstIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (uid && !!queue.length && !curPostId && curPostId !== queue[0].postId) {
      dispatch(savePost(queue[0]));
    }
  }, [dispatch, uid, queue, curPostId]);

  const openUploadingLIstHandler = () => {
    setUploadingLIstIsOpen((prevstate) => !prevstate);
  };

  // Shows a browser warning when the user attempts to close the tab while the upload queue is not empty.
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

  // Closes automatically when clicking outside of the panel.
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
