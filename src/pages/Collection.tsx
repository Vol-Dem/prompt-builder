import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import classes from "./Collection.module.scss";
import { getCollection, imagesActions } from "../store/images";
import { DEFAULT_PAGE_TITLE } from "../variables/constants";
import CollectionImages from "../components/collection/collection-images/CollectionImages";
import NavigationPanel from "../components/layout/navigation-panel/NavigationPanel";
import Buttton from "../components/ui/buttons/Button";
import Modal from "../components/ui/Modal";
import SaveImageForm from "../components/forms/save-image-form/SaveImageForm";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import ButtonSquareAdd from "../components/general-elements/button-square-add/ButtonSquareAdd";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { handleErrors, normalizeError } from "../utils/generalUtils";

interface CollectionProps {
  title: string;
}

/**
 * Collection page.
 *
 * High-level route responsible for displaying a collection.
 *
 * Responsibilities:
 * - Loads collection data from Firestore.
 * - Manages page-level loading, error, and empty states.
 * - Updates the document title based on the active collection.
 * - Provides actions to add images manually.
 * - Provides a back button to return to the collection page.
 *
 * Side effects:
 * - Fetches collection data on route change.
 * - Updates Redux collection state.
 * - Sets and restores `document.title`.
 *
 * @component
 *
 * @param {Object} props
 * @param {string} props.title - Fallback page title used before collection data is loaded.
 *
 * @returns {JSX.Element} Collection page.
 */
const Collection = ({ title }: CollectionProps) => {
  const [addImgModalIsOpen, setAddImgModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isAuth = useAppSelector((state) => state.auth.user.uid);
  const collectionData = useAppSelector((state) => state.images.collectionData);
  const collectionPreviews = useAppSelector(
    (state) => state.images.collectionPreviews,
  );
  const categoriesData = useAppSelector((state) => state.images.categories);
  const dispatch = useAppDispatch();
  const { collectionId } = useParams();
  const collectionPreview = collectionPreviews?.data?.find(
    (preview) => preview?.id === collectionData?.id,
  );

  useEffect(() => {
    document.title = collectionData?.name || title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title, collectionData?.name]);

  useEffect(() => {
    if (!isAuth || !collectionId) return;
    dispatch(imagesActions.resetCollectionData());
    const getCollectionData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        await dispatch(getCollection(collectionId));
      } catch (error) {
        const errorMessage = handleErrors(normalizeError(error));
        setErrorMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    getCollectionData();

    return () => {
      dispatch(imagesActions.resetCollectionData());
    };
  }, [collectionId, isAuth, dispatch]);

  const openCategoriesHandler = (
    category: string,
    subcategory?: string | null,
  ) => {
    dispatch(imagesActions.setActiveCategory(category));

    dispatch(imagesActions.setActiveSubcategory(subcategory || null));

    dispatch(imagesActions.resetCollectionPreviews());
  };

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/images");
  };
  const activeCategoryData = categoriesData.find(
    (category) => category.id === collectionData?.category,
  );

  const subcategoriesHtml = collectionData?.subcategories?.flatMap(
    (subcategoryId, i) => {
      const subcategoryName = activeCategoryData?.subcategories?.find(
        (subcategory) => subcategory.id === subcategoryId,
      )?.name;

      if (!subcategoryName) {
        return [];
      }

      return (
        <li key={i}>
          <Link
            to="/images"
            className={classes["link"]}
            onClick={() =>
              openCategoriesHandler(collectionData?.category, subcategoryId)
            }
          >
            {subcategoryName}
          </Link>
        </li>
      );
    },
  );

  const addImgByIdHandler = () => {
    setAddImgModalIsOpen(true);
  };

  return (
    <>
      {isLoading && <Spinner />}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {collectionData?.id && (
        <div className={classes["collection"]}>
          <NavigationPanel onBack={backHandler}>
            <Link
              to="/images"
              className={classes["link"]}
              onClick={() =>
                openCategoriesHandler(collectionData?.category, null)
              }
            >
              {activeCategoryData?.name}
            </Link>
            <ul className={classes["subcategories"]}>{subcategoriesHtml}</ul>
          </NavigationPanel>
          <div className={classes["title-container"]}>
            <h1 className={classes.title}>{collectionData?.name}</h1>
            {collectionPreview && (
              <ButtonSquareAdd
                previewData={collectionPreview}
                type="collection"
              />
            )}
          </div>
          {collectionData?.description && <p>{collectionData?.description}</p>}
          <Buttton
            className={classes["button-add"]}
            onClick={addImgByIdHandler}
          >
            Add Image by ID
          </Buttton>
          <div className={classes["images"]}>
            <CollectionImages />
          </div>
          <AnimatePresence>
            {addImgModalIsOpen && (
              <Modal
                title="Add images by Post ID"
                onClose={() => {
                  setAddImgModalIsOpen(false);
                }}
              >
                <SaveImageForm
                  location="collections"
                  savedPosts={collectionData?.posts}
                  collectionInfo={{
                    collectionData: {
                      id: collectionData.id,
                      name: collectionData.name,
                    },
                    categoryData: {
                      id: activeCategoryData?.id,
                      name: activeCategoryData?.name,
                    },
                    subcategoriesData:
                      activeCategoryData?.subcategories?.filter((subcategory) =>
                        collectionData?.subcategories.includes(subcategory.id),
                      ),
                  }}
                />
              </Modal>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default Collection;
