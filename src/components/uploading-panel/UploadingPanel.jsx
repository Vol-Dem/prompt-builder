import { useCallback, useEffect, useState } from "react";
import classes from "./UploadingPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { savePost, uploadActions } from "../../store/upload";
import DropDownList from "../ui/DropDownList";
import UploadingItem from "./uploading-item/UploadingItem";
import ButtonTertiary from "../ui/ButtonTertiary";
import { AnimatePresence } from "framer-motion";

const UploadingPanel = () => {
  const [uploadingListIsOpen, setUploadingLIstIsOpen] = useState(false);
  const uid = useSelector((state) => state.auth.user.uid);
  const queue = useSelector((state) => state.upload.queue);
  const rejected = useSelector((state) => state.upload.rejected);
  const completed = useSelector((state) => state.upload.completed);
  const completedAmount = useSelector((state) => state.upload.completedAmount);
  const curPostId = useSelector((state) => state.upload.curPostId);
  const dispatch = useDispatch();

  const beforeUnloadHandler = useCallback((event) => {
    // Recommended
    event.preventDefault();
    setUploadingLIstIsOpen(true);

    // Included for legacy support, e.g. Chrome/Edge < 119
    event.returnValue = true;
  }, []);

  useEffect(() => {
    if (!!queue.length) {
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
  const closeUploadingLIstHandler = () => {
    setUploadingLIstIsOpen(false);
  };

  const uploadingItems = queue.map((item, i) => {
    return <UploadingItem key={i} data={item} curPostId={curPostId} />;
  });
  const rejectedItems = rejected.map((item, i) => {
    const isRejected = !!rejected.find(
      (rejectedItem) => item.curPostId === rejectedItem.curPostId
    );
    return (
      <UploadingItem
        key={i}
        data={item}
        curPostId={curPostId}
        rejected={isRejected}
      />
    );
  });
  const completedItems = completed.map((item, i) => {
    return (
      <UploadingItem
        key={i}
        data={item}
        curPostId={curPostId}
        rejected={false}
        completed={true}
      />
    );
  });

  const closeMenuHandler = useCallback((e) => {
    if (!e.target.closest(`.${classes.uploading}`)) {
      setUploadingLIstIsOpen(false);
    }
  }, []);

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

  return (
    <div className={classes.uploading}>
      <button
        className={`${classes["uploading__btn"]} ${
          uploadingListIsOpen ? classes["uploading__btn--open"] : ""
        }`}
        onClick={openUploadingLIstHandler}
        title="Uploading queue"
      >
        <div
          className={`${classes["uploading__btn-content"]} ${
            queue?.length ? classes["uploading__btn-content--loading"] : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </div>

        {!!queue.length && (
          <span
            className={`${classes["uploading__amount"]} ${classes["uploading__amount--queue"]}`}
          >
            {queue.length}
          </span>
        )}
        {!!completedAmount && !rejected.length && (
          <span
            className={`${classes["uploading__amount"]} ${classes["uploading__amount--completed"]}`}
          >
            {completedAmount}
          </span>
        )}
        {!!rejected.length && (
          <span
            className={`${classes["uploading__amount"]} ${classes["uploading__amount--rejected"]}`}
          >
            {rejected.length}
          </span>
        )}
      </button>
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
            {!!rejected?.length && (
              <>
                <div className={classes["rejected-panel"]}>
                  <div
                    className={`${classes["rejected-panel__title"]} ${classes["rejected-panel__title--rejected"]}`}
                  >
                    -Rejected-
                  </div>
                  <div className={classes["btns-container"]}>
                    <ButtonTertiary
                      onClick={() => {
                        dispatch(uploadActions.retryUploadingAll());
                      }}
                    >
                      Retry All
                    </ButtonTertiary>
                    <ButtonTertiary
                      onClick={() => {
                        dispatch(uploadActions.clearRejected());
                      }}
                    >
                      Clear All
                    </ButtonTertiary>
                  </div>
                </div>

                <ul className={classes["uploading-list"]}>{rejectedItems}</ul>
              </>
            )}
            {!!completed?.length && (
              <>
                <div className={classes["rejected-panel"]}>
                  <div
                    className={`${classes["rejected-panel__title"]} ${classes["rejected-panel__title--completed"]}`}
                  >
                    -Completed-
                  </div>
                  <div className={classes["btns-container"]}>
                    <ButtonTertiary
                      onClick={() => {
                        dispatch(uploadActions.clearCompleted());
                      }}
                    >
                      Clear All
                    </ButtonTertiary>
                  </div>
                </div>

                <ul className={classes["uploading-list"]}>{completedItems}</ul>
              </>
            )}
          </DropDownList>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadingPanel;
