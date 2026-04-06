import type { Image } from "../../../../shared/types/image";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { filterDuplicates, sortArrayBy } from "../../../utils/generalUtils";
import classes from "./SuggestedCollections.module.scss";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import type { SuggestedCollectionsSortType } from "../../../types/collections.types";
import { generalActions } from "../../../store/general";

type SuggestedCollectionsProps = {
  images: Image[];
  selectedCategoryId: string;
  selectedCollectionId: number;
  onSelect: (suggestedCollectionData: SuggestedCollection) => void;
};

type SuggestedCollection = {
  categoryId: string;
  categoryName: string;
  collectionId: number;
  collectionName: string;
};

const SUGGESTED_FILTER_LIST = ["in", "and", "or", "for", "on"];

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
  // const [filterType, setFilterType] = useState<"loose" | "balanced" | "strict">(
  //   "balanced",
  // );
  const filterType = "balanced";
  const categories = useAppSelector((state) => state.images.categories);

  const allPrompt = images.reduce((prev, curr) => {
    if (curr.meta?.prompt) {
      return prev + " " + curr.meta.prompt;
    }
    return prev;
  }, "");

  const createNameWords = (nameString: string) => {
    const regex = /[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/g;

    return nameString
      .toLocaleLowerCase()
      .replace(regex, "")
      .split(" ")
      .filter((word) => !SUGGESTED_FILTER_LIST.includes(word));
  };

  const suggestedCollections = filterDuplicates(
    categories.flatMap((category) => {
      const collNames = category.collectionNames
        ?.filter((collection) => {
          const nameWords = createNameWords(collection.name);

          // if (filterType === "loose") {
          //   return nameWords.some((nameWord) =>
          //     allPrompt
          //       ?.toLocaleLowerCase()
          //       .includes(nameWord.trim().toLocaleLowerCase()),
          //   );
          // }

          if (filterType === "balanced") {
            return nameWords.every((nameWord) =>
              allPrompt
                ?.toLocaleLowerCase()
                .includes(nameWord.trim().toLocaleLowerCase()),
            );
          }

          // if (filterType === "strict") {
          //   return allPrompt
          //     ?.toLocaleLowerCase()
          //     .includes(collection.name.toLocaleLowerCase());
          // }
        })
        .map((collection) => {
          const subcategoryNames = collection.subcategories?.flatMap(
            (subcategoryId) => {
              const subcategoryName = category?.subcategories?.find(
                (subcategory) => subcategory.id === subcategoryId,
              )?.name;
              return subcategoryName || [];
            },
          );

          return {
            categoryId: category.id,
            categoryName: category.name,
            collectionId: collection.id,
            collectionName: collection.name,
            collectionSubcategories: subcategoryNames,
          };
        });
      if (collNames?.length) {
        return collNames;
      }
      return [];
    }),

    "collectionId",
  ).toSorted((a, b) =>
    a.categoryName.toUpperCase().localeCompare(b.categoryName.toUpperCase()),
  );

  let suggestedCollectionsSorted = sortArrayBy(
    suggestedCollections,
    "collectionName",
  );

  if (sortBy === "category") {
    suggestedCollectionsSorted = sortArrayBy(
      suggestedCollectionsSorted,
      "categoryName",
    );
  }

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
