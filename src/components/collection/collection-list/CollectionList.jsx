import { useSelector } from "react-redux";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import usePageEnd from "../../../hooks/use-page-end";
import Spinner from "../../ui/Spinner";
import classes from "./CollectionList.module.scss";
import { useEffect, useRef, useState } from "react";
import ErrorMessage from "../../ui/ErrorMessage";
import { ERROR_MESSAGE_OFFLINE } from "../../../variables/constants";
import NotificationMessage from "../../ui/NotificationMessage";
import PreviewCard from "../../previewCard/PreviewCard";
import AddToPanelAnimContainer from "../../ui/AddToPanelAnimContainer";

const sortTypes = [
  { name: "Newest", value: "createdAt" },
  { name: "Name", value: "name" },
];

const CollectionList = ({ sortBy }) => {
  const collectionPreviews = useSelector(
    (state) => state.images.collectionPreviews
  );
  const isLoading = useSelector((state) => state.images.previewsIsLoading);
  const errorMessage = useSelector(
    (state) => state.images.previewsErrorMessage
  );

  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const endPage = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const isPageEnd = usePageEnd(100);
  const isOnline = useOnlineStatus();

  //Rerender component for sidepanel animation
  const usedModels = useSelector((state) => state.used.models);

  useEffect(() => {
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  let sortSelectOption = sortTypes.map((version) => {
    return {
      name: version.name,
      value: version.value,
    };
  });

  const collectionsHtml = collectionPreviews?.data?.map((collection, i) => {
    return (
      <AddToPanelAnimContainer key={i}>
        <PreviewCard layout={false} previewData={collection} fullView={false} />
        <PreviewCard layout={true} previewData={collection} fullView={false} />
      </AddToPanelAnimContainer>
    );
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
      <div ref={endPage}></div>
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
    </div>
  );
};

export default CollectionList;
