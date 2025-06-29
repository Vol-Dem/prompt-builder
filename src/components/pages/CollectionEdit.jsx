import { useNavigate, useParams } from "react-router-dom";
import CollectionEditForm from "../forms/collection-edit-from/CollectionEditForm";
import classes from "./CollectionEdit.module.scss";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCollection,
  getCollection,
  imagesActions,
} from "../../store/images";
import Spinner from "../ui/Spinner";
import ButtonDelete from "../ui/buttons/ButtonDelete";
import { MESSAGE_DELETE_COLLECTION } from "../../variables/constants";
import ErrorMessage from "../ui/ErrorMessage";

const CollectionEdit = () => {
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

  const deleteCollectionHandler = async () => {
    try {
      setIsDeleting(true);
      await dispatch(
        deleteCollection(collectionData.id, collectionData.category)
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
