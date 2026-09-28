import { useEffect, useRef, useState, type MouseEvent } from "react";

import { imagesActions } from "../store/images";
import { getCollectionPreviews } from "../store/imagesThunks";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { useOnlineStatus } from "./use-online-status";
import useIntersection from "./use-intersection";
import { SETTINGS_LOAD_MORE_MARGIN_SMALL } from "../variables/constants";

/** Coordinates collection category selection, preview resets, and pagination. */
const useCollectionPreviewsController = () => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const categories = useAppSelector((state) => state.images.categories);
  const collectionPreviews = useAppSelector(
    (state) => state.images.collectionPreviews,
  );
  const isLastPage = useAppSelector((state) => state.images.isLastPreviewsPage);
  const isLoading = useAppSelector((state) => state.images.previewsIsLoading);
  const errorMessage = useAppSelector(
    (state) => state.images.previewsErrorMessage,
  );
  const activeCategory = useAppSelector((state) => state.images.activeCategory);
  const activeSubcategory = useAppSelector(
    (state) => state.images.activeSubcategory,
  );
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const endPageRef = useRef(null);
  const isOnline = useOnlineStatus();
  const dispatch = useAppDispatch();
  const subcategories = categories?.find(
    (category) => category.id === activeCategory,
  )?.subcategories;
  const intersecting = useIntersection(endPageRef, false, 0);
  const intersectingSmall = useIntersection(
    endPageRef,
    false,
    0,
    `${SETTINGS_LOAD_MORE_MARGIN_SMALL}px`,
  );

  useEffect(() => {
    setIsIntersecting(intersecting || intersectingSmall);
  }, [intersecting, intersectingSmall, activeCategory, activeSubcategory]);

  const openCategoryHandler = (e: MouseEvent<HTMLElement>) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (activeCategory === e.target.dataset.value) return;
    dispatch(imagesActions.setActiveCategory(e.target.dataset.value));
    dispatch(imagesActions.setActiveSubcategory(""));
    dispatch(imagesActions.setCollectionPreviews([]));
    dispatch(imagesActions.resetCollectionPreviews());
  };

  const openSubcategoryHandler = (e: MouseEvent<HTMLElement>) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (activeSubcategory === e.target.dataset.value) return;
    dispatch(imagesActions.setActiveSubcategory(e.target.dataset.value));
    dispatch(imagesActions.setCollectionPreviews([]));
    dispatch(imagesActions.resetCollectionPreviews());
  };

  //Load previews on scroll
  useEffect(() => {
    const rule =
      activeSubcategory || activeCategory === "all" || !subcategories?.length;

    if (
      !isLastPage &&
      isIntersecting &&
      rule &&
      isOnline &&
      !isLoading &&
      activeCategory
    ) {
      setIsIntersecting(false);

      dispatch(
        getCollectionPreviews(
          activeCategory,
          activeSubcategory,
          !!collectionPreviews?.data?.length,
          nsfwMode,
        ),
      );
    }
  }, [
    isIntersecting,
    dispatch,
    isLastPage,
    collectionPreviews,
    nsfwMode,
    isOnline,
    activeCategory,
    activeSubcategory,
    isLoading,
    subcategories,
  ]);

  return {
    categories: { items: categories, activeId: activeCategory, onSelect: openCategoryHandler },
    subcategories: { items: subcategories, activeId: activeSubcategory, onSelect: openSubcategoryHandler },
    status: { isLoading, errorMessage, isOnline },
    endPageRef,
  };
};

export default useCollectionPreviewsController;
