import { useDispatch, useSelector } from "react-redux";
import classes from "./UploadingRejected.module.scss";
import UploadingItem from "../uploading-item/UploadingItem";
import ButtonTertiary from "../../ui/ButtonTertiary";
import { uploadActions } from "../../../store/upload";
import UploadingList from "../uploading-list/UploadingList";

const UploadingRejected = () => {
  const rejected = useSelector((state) => state.upload.rejected);
  const curPostId = useSelector((state) => state.upload.curPostId);
  const dispatch = useDispatch();
  //   console.log(rejected);
  const rejectedItems = rejected.map((item, i) => {
    // const isRejected = !!rejected.find(
    //   (rejectedItem) => item.curPostId === rejectedItem.curPostId
    // );
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
