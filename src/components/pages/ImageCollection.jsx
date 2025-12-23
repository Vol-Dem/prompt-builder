import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";

import classes from "./ImageCollection.module.scss";
import { getCollection, imagesActions } from "../../store/images";
import CollectionImages from "../collection/collection-images/CollectionImages";
import NavigationPanel from "../layout/navigation-panel/NavigationPanel";
import Buttton from "../ui/Button";
import Modal from "../ui/Modal";
import SaveImageForm from "../forms/save-image-form/SaveImageForm";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import ButtonSquareAdd from "../ui/ButtonSquareAdd";

const ImageCollection = ({ title }) => {
  const [addImgModalIsOpen, setAddImgModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isAuth = useSelector((state) => state.auth.user.uid);
  const { collectionId } = useParams();
  const dispatch = useDispatch();
  const collectionData = useSelector((state) => state.images.collectionData);
  const collectionPreviews = useSelector(
    (state) => state.images.collectionPreviews
  );
  const categoriesData = useSelector((state) => state.images.categories);
  const collectionPreview = collectionPreviews?.data?.find(
    (preview) => preview.id === collectionData.id
  );
  document.title = collectionData?.name || title;

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

  const openCategoriesHandler = (category, subcategory) => {
    dispatch(imagesActions.setActiveCategory(category));

    if (subcategory) dispatch(imagesActions.setActiveSubcategory(subcategory));

    dispatch(imagesActions.resetCollectionPreviews());
  };

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/images");
  };
  const activeCategoryData = categoriesData.find(
    (category) => category.id === collectionData?.category
  );

  const subcategoriesHtml = collectionData?.subcategories?.flatMap(
    (subcategoryId, i) => {
      const subcategoryName = activeCategoryData?.subcategories?.find(
        (subcategory) => subcategory.id === subcategoryId
      )?.name;

      if (!subcategoryName) {
        return [];
      }

      return (
        <li key={i}>
          <Link
            to="/images"
            className={classes["link"]}
            onClick={openCategoriesHandler.bind(
              null,
              collectionData?.category,
              subcategoryId
            )}
          >
            {subcategoryName}
          </Link>
        </li>
      );
    }
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
              onClick={openCategoriesHandler.bind(
                null,
                collectionData?.category,
                null
              )}
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
                      id: activeCategoryData.id,
                      name: activeCategoryData.name,
                    },
                    subcategoriesData: activeCategoryData.subcategories.filter(
                      (subcategory) =>
                        collectionData?.subcategories.includes(subcategory.id)
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

export default ImageCollection;
