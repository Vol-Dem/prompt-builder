import { useState } from "react";

import { useAppDispatch } from "../store/hooks/hooks";
import { addNewCollectionCategories } from "../store/imagesThunks";
import { getCollectionData } from "../utils/fetch/fetchCollection";
import { AppError, filterDuplicates, handleErrors, normalizeError } from "../utils/generalUtils";
import { ERROR_MESSAGE_INPUT_DEF, SUCCESS_MESSAGE_SAVED } from "../variables/constants";
import type { SelectInput, SubcategoryInput } from "../types/forms.types";
import type { CollectionSavedPost } from "../../shared/types/collection";
import type { UploadingCollectionData } from "../types/upload.types";

type CollectionDestinationSelection = {
  mainCategorySelected: SelectInput<string>;
  collectionNameSelected: SelectInput<number>;
  subcategoryInputs: SubcategoryInput[];
};

type CollectionDestinationOptions = {
  postId?: number;
  hasImages: boolean;
};

/** Resolves a collection destination before image selection; field state stays in the form. */
const useCollectionDestination = ({ postId, hasImages }: CollectionDestinationOptions) => {
  const [stage, setStage] = useState<"destination" | "images">("destination");
  const [collectionInfoIsLoading, setCollectionInfoIsLoading] = useState(false);
  const [collectionInfo, setCollectionInfo] =
    useState<UploadingCollectionData | null>(null);
  const [savedPostData, setSavedPostData] =
    useState<CollectionSavedPost | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const dispatch = useAppDispatch();

  const prepare = async ({
    mainCategorySelected, collectionNameSelected, subcategoryInputs,
  }: CollectionDestinationSelection) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const subcategoriesIsInvalid = !!subcategoryInputs.find(
        (subcategory) => !subcategory.isValid,
      );
      if (
        !collectionNameSelected.isValid ||
        !mainCategorySelected.isValid ||
        subcategoriesIsInvalid
      ) {
        throw new AppError(ERROR_MESSAGE_INPUT_DEF);
      }
      setCollectionInfoIsLoading(true);

      let curCollectionSabcategories: string[] = [];
      let postData: CollectionSavedPost | null = null;

      if (mainCategorySelected?.id && collectionNameSelected?.id) {
        const collectionData = await getCollectionData(
          collectionNameSelected.id,
        );
        postData =
          collectionData?.posts?.find((post) => post.postId === postId) || null;

        curCollectionSabcategories = collectionData.subcategories;
      }

      const inputSubcatsData = subcategoryInputs.flatMap((subcat) => {
        if (!subcat?.selected?.name) {
          return [];
        }
        return subcat.selected;
      });
      const subcategories = filterDuplicates(inputSubcatsData, "name").map(
        (subcategory) => {
          return {
            ...subcategory,
            name: subcategory.name.trim(),
          };
        },
      );

      const collectionInputData = {
        collectionData: {
          id: collectionNameSelected.id,
          name: collectionNameSelected.name.trim(),
        },
        categoryData: {
          id: mainCategorySelected.id,
          name: mainCategorySelected.name.trim(),
        },
        subcategoriesData: subcategories,
        curCollectionSabcategories,
      };

      const categoriesWithId = await dispatch(
        addNewCollectionCategories(collectionInputData),
      );

      setCollectionInfo(categoriesWithId);
      if (hasImages) {
        if (postData?.imageIds?.length) {
          setSavedPostData(postData);
        }

        setStage("images");
      }

      setSuccessMessage(SUCCESS_MESSAGE_SAVED);
    } catch (err) {
      const errorMessage = handleErrors(normalizeError(err));
      setErrorMessage(errorMessage);
      setShowErrorMessage(true);
    } finally {
      setCollectionInfoIsLoading(false);
    }
  };

  return {
    stage,
    destination: { collectionInfo, savedPostData },
    status: { collectionInfoIsLoading, errorMessage, successMessage, showErrorMessage },
    prepare,
  };
};

export default useCollectionDestination;
