import type { Image } from "../../../../shared/types/image";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { getSuggestedCollections } from "./suggestedCollectionsUtils";
import classes from "./SuggestedCollections.module.scss";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import type {
  SuggestedCollection,
  SuggestedCollectionsSortType,
} from "../../../types/collections.types";
import { generalActions } from "../../../store/general";

type SuggestedCollectionsProps = {
  images: Image[];
  selectedCategoryId: string | null;
  selectedCollectionId: number | null;
  onSelect: (suggestedCollectionData: SuggestedCollection) => void;
};

const SuggestedCollections = ({
  images,
  selectedCategoryId,
  selectedCollectionId,
  onSelect,
}: SuggestedCollectionsProps) => {
  const sortBy = useAppSelector(
    (state) => state.general.suggestedCollectionsSortBy,
  );
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.images.categories);
  const suggestedCollectionsSorted = getSuggestedCollections(
    images,
    categories,
    sortBy,
  );

  const suggestedHtml = suggestedCollectionsSorted.map(
    (suggestedCollection) => {
      const collectionIsSellected =
        selectedCategoryId === suggestedCollection.categoryId &&
        selectedCollectionId === suggestedCollection.collectionId;

      let categoriesTitle = `${suggestedCollection.categoryName} / `;

      const collectionSubcategoriesHtml =
        suggestedCollection?.collectionSubcategories?.map((sub, i) => {
          const subcategoryText = `${!!i ? " | " : ""}${sub}`;
          categoriesTitle += subcategoryText;
          return (
            <span
              key={i}
              className={classes["suggested-collections__subcategory"]}
            >
              {subcategoryText}
            </span>
          );
        });

      return (
        <li
          key={suggestedCollection.collectionId}
          className={`${classes["suggested-collections__item"]} ${collectionIsSellected ? classes["suggested-collections__item--active"] : ""}`}
          onClick={() => onSelect(suggestedCollection)}
        >
          <div
            className={classes["suggested-collections__category"]}
            title={categoriesTitle}
          >
            {suggestedCollection.categoryName} / {collectionSubcategoriesHtml}
          </div>
          <div className={classes["suggested-collections__collection"]}>
            {suggestedCollection.collectionName}
          </div>
        </li>
      );
    },
  );

  const changeSortHandler = (value: SuggestedCollectionsSortType) => {
    dispatch(generalActions.setSuggestedCollectionsSortBy(value));
  };

  return (
    <>
      {!!suggestedHtml?.length && (
        <div className={classes["suggested-collections"]}>
          <div className={classes["suggested-collections__panel"]}>
            <span className={classes["suggested-collections__title"]}>
              Suggested:
            </span>
            <div className={classes["suggested-collections__sort"]}>
              <span
                className={`${classes["suggested-collections__sort-item"]} ${sortBy === "name" ? classes["suggested-collections__sort-item--active"] : ""}`}
                onClick={() => changeSortHandler("name")}
              >
                <ArrowsUpDownIcon />
                Name
              </span>
              <span
                className={`${classes["suggested-collections__sort-item"]} ${sortBy === "category" ? classes["suggested-collections__sort-item--active"] : ""}`}
                onClick={() => changeSortHandler("category")}
              >
                <ArrowsUpDownIcon />
                Category
              </span>
            </div>
          </div>
          <ul className={classes["suggested-collections__list"]}>
            {suggestedHtml}
          </ul>
        </div>
      )}
    </>
  );
};

export default SuggestedCollections;
