import { useDispatch, useSelector } from "react-redux";

import classes from "./UploadingCompleted.module.scss";
import UploadingItem from "../uploading-item/UploadingItem";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import { uploadActions } from "../../../../store/upload";
import UploadingList from "../uploading-list/UploadingList";

const UploadingCompleted = () => {
  const completed = useSelector((state) => state.upload.completed);
  const curPostId = useSelector((state) => state.upload.curPostId);
  const dispatch = useDispatch();

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

  const title = (
    <p className={`${classes["rejected-panel__title--completed"]}`}>
      -Completed-
    </p>
  );

  const buttons = (
    <>
      <ButtonTertiary
        onClick={() => {
          dispatch(uploadActions.clearCompleted());
        }}
      >
        Clear All
      </ButtonTertiary>
    </>
  );

  return (
    <>
      {!!completed?.length && (
        <UploadingList buttons={buttons} title={title}>
          {completedItems}
        </UploadingList>
      )}
    </>
  );
};

export default UploadingCompleted;
