import { useSelector } from "react-redux";

import { useOnlineStatus } from "../../../hooks/use-online-status";
import Spinner from "../../ui/Spinner";
import classes from "./CollectionList.module.scss";
import ErrorMessage from "../../ui/ErrorMessage";
import { ERROR_MESSAGE_OFFLINE } from "../../../variables/constants";
import NotificationMessage from "../../ui/NotificationMessage";
import PreviewCard from "../../preview-card/PreviewCard";

const CollectionList = () => {
  const collectionPreviews = useSelector(
    (state) => state.images.collectionPreviews
  );
  const isLoading = useSelector((state) => state.images.previewsIsLoading);
  const errorMessage = useSelector(
    (state) => state.images.previewsErrorMessage
  );
  const isOnline = useOnlineStatus();

  const collectionsHtml = collectionPreviews?.data?.map((collection, i) => {
    return <PreviewCard key={i} item={collection} />;
  });

  return (
    <div className={classes["container"]}>
      {!!collectionPreviews?.data?.length && (
        <div className={`${classes["collections"]}`}>{collectionsHtml}</div>
      )}
      {!collectionPreviews?.data?.length && !isLoading && (
        <NotificationMessage>This category is empty</NotificationMessage>
      )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default CollectionList;
