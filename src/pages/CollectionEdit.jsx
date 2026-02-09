import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import classes from "./CollectionEdit.module.scss";
import {
  deleteCollection,
  getCollection,
  imagesActions,
} from "../store/images";
import {
  DEFAULT_PAGE_TITLE,
  MESSAGE_DELETE_COLLECTION,
} from "../variables/constants";
import CollectionEditForm from "../components/forms/collection-edit-from/CollectionEditForm";
import Spinner from "../components/ui/Spinner";
import ButtonDelete from "../components/ui/buttons/ButtonDelete";
import ErrorMessage from "../components/ui/ErrorMessage";

/**
 * Collection edit page.
 *
 * High-level route responsible for displaying a collection editing form.
 *
 * Responsibilities:
 * - Displays collection and version settings.
 * - Loads collection data from Firestore.
 * - Handles collection deletion and navigates away on success.
 * - Manages page-level loading, error, and empty states.
 * - Updates the document title based on the active collection.
 *
 * Side effects:
 * - Fetches collection data on route change.
 * - Updates Redux collection state.
 * - Sets and restores `document.title`.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.title - Fallback page title used before collection data is loaded.
 *
 * @returns {JSX.Element} Collection edit page.
 */
const CollectionEdit = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const isAuth = useSelector((state) => state.auth.user.uid);
  const collectionData = useSelector((state) => state.images.collectionData);
  const { collectionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth || !collectionId) return;

    const getCollectionData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        await dispatch(getCollection(collectionId));
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    getCollectionData();

    return () => {
      dispatch(imagesActions.resetCollectionData());
    };
  }, [collectionId, isAuth, dispatch]);

  useEffect(() => {
    document.title = collectionData?.name
      ? `Edit - ${collectionData?.name}`
      : title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title, collectionData]);

  const deleteCollectionHandler = async () => {
    try {
      setIsDeleting(true);
      await dispatch(
        deleteCollection(collectionData.id, collectionData.category),
      );
      dispatch(imagesActions.resetCollectionListState());
      navigate("/images");
    } catch (err) {
      setDeleteErrorMessage(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteHandler = () => {
    setDeleteErrorMessage("");
  };

  return (
    <div>
      {collectionData?.id && (
        <>
          <ButtonDelete
            isDeleting={isDeleting}
            onClick={openDeleteHandler}
            onDelete={deleteCollectionHandler}
            message={MESSAGE_DELETE_COLLECTION}
            errorMessage={deleteErrorMessage}
            className={classes["btn-del"]}
          />
          <CollectionEditForm collectionData={collectionData} />
        </>
      )}
      {isLoading && <Spinner />}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </div>
  );
};

export default CollectionEdit;
