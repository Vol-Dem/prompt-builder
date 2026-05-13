import classes from "./UploadingCompleted.module.scss";
import UploadingItem from "../uploading-item/UploadingItem";
import ButtonTertiary from "../../../ui/buttons/ButtonTertiary";
import { uploadActions } from "../../../../store/upload";
import UploadingList from "../uploading-list/UploadingList";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";

/**
 * Renders a list of successfully uploaded images with a button to clear the list.
 *
 * @component
 *
 * @returns The list of uploaded images.
 */
const UploadingCompleted = () => {
  const completed = useAppSelector((state) => state.upload.completed);
  const curPostId = useAppSelector((state) => state.upload.curPostId);
  const dispatch = useAppDispatch();

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
