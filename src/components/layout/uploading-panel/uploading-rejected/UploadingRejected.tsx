import classes from "./UploadingRejected.module.scss";
import UploadingItem from "../uploading-item/UploadingItem";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import { uploadActions } from "../../../../store/upload";
import UploadingList from "../uploading-list/UploadingList";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";

/**
 * Renders a list of rejected images with buttons to clear the list or re-upload.
 *
 * @component
 *
 * @returns The list of rejected images.
 */
const UploadingRejected = () => {
  const rejected = useAppSelector((state) => state.upload.rejected);
  const curPostId = useAppSelector((state) => state.upload.curPostId);
  const dispatch = useAppDispatch();

  const rejectedItems = rejected.map((item, i) => {
    return (
      <UploadingItem
        key={i}
        data={item}
        curPostId={curPostId}
        rejected={true}
      />
    );
  });

  const title = (
    <p className={`${classes["rejected-panel__title--rejected"]}`}>
      -Rejected-
    </p>
  );

  const buttons = (
    <>
      {" "}
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
    </>
  );

  return (
    <>
      {!!rejected?.length && (
        <UploadingList buttons={buttons} title={title}>
          {rejectedItems}
        </UploadingList>
      )}
    </>
  );
};

export default UploadingRejected;
