import { useEffect, useState } from "react";
import classes from "./UploadingPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { savePost, uploadActions } from "../../store/upload";
import Image from "../ui/image/Image";
import DropDownList from "../ui/DropDownList";
import UploadingItem from "./uploading-item/UploadingItem";
import ButtonTertiary from "../ui/ButtonTertiary";

const UploadingPanel = () => {
  const [uploadingLIstIsOpen, setUploadingLIstIsOpen] = useState(false);
  const uid = useSelector((state) => state.auth.user.uid);
  const queue = useSelector((state) => state.upload.queue);
  const rejected = useSelector((state) => state.upload.rejected);
  const curPostId = useSelector((state) => state.upload.curPostId);
  const isUploading = useSelector((state) => state.upload.isUploading);
  const dispatch = useDispatch();

  const beforeUnloadHandler = (event) => {
    // Recommended
    event.preventDefault();

    // Included for legacy support, e.g. Chrome/Edge < 119
    event.returnValue = true;
  };

  useEffect(() => {
    if (!!queue.length) {
      window.addEventListener("beforeunload", beforeUnloadHandler);
    } else {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    }

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [queue]);

  useEffect(() => {
    if (
      uid &&
      !!queue.length &&
      !curPostId &&
      curPostId !== queue[0].curPostId
    ) {
      console.log(queue);
      console.log("UPLOAD", queue);
      console.log("POST", curPostId);
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

  return (
    <div className={classes.uploading}>
      <div
        className={`${classes["uploading__btn"]} ${
          uploadingLIstIsOpen ? classes["uploading__btn--active"] : ""
        }`}
        onClick={openUploadingLIstHandler}
      >
        Up
        {!!queue.length && (
          <span
            className={`${classes["uploading__amount"]} ${classes["uploading__amount--queue"]}`}
          >
            {queue.length}
          </span>
        )}
        {!!rejected.length && (
          <span
            className={`${classes["uploading__amount"]} ${classes["uploading__amount--rejected"]}`}
          >
            {rejected.length}
          </span>
        )}
        {/* , Re: {rejected.length} */}
      </div>
      {uploadingLIstIsOpen && (
        <div>
          <DropDownList
            className={classes["uploading-dropdown"]}
            onClose={closeUploadingLIstHandler}
          >
            <ul className={classes["uploading-list"]}>{uploadingItems}</ul>
            {!queue.length && (
              <div className={classes["uploading__empty"]}>Queue is empty</div>
            )}
            {!!rejected?.length && (
              <>
                <div className={classes["rejected-panel"]}>
                  <div className={classes["rejected-panel__title"]}>
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
          </DropDownList>
        </div>
      )}
    </div>
  );
};

export default UploadingPanel;
