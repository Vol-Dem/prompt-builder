import type { Image } from "../../../../shared/types/image";
import type { CollectionCategory } from "../../../../shared/types/user";
import type {
  SuggestedCollection,
  SuggestedCollectionsSortType,
} from "../../../types/collections.types";
import { filterDuplicates, sortArrayBy } from "../../../utils/generalUtils";

const SUGGESTED_FILTER_LIST = ["in", "and", "or", "for", "on"];

const createNameWords = (nameString: string) => {
  const regex = /[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/g;

  return nameString
    .toLocaleLowerCase()
    .replace(regex, "")
    .split(" ")
    .filter((word) => !SUGGESTED_FILTER_LIST.includes(word));
};

/** Matches collection names against combined image prompts and orders suggestions. */
export const getSuggestedCollections = (
  images: readonly Pick<Image, "meta">[],
  categories: readonly CollectionCategory[],
  sortBy: SuggestedCollectionsSortType,
): (SuggestedCollection & { collectionSubcategories: string[] | undefined })[] => {
  const allPrompt = images.reduce((prev, curr) => {
    if (curr.meta?.prompt) {
      return prev + " " + curr.meta.prompt;
    }
    return prev;
  }, "");

  const suggestedCollections = filterDuplicates(
    categories.flatMap((category) => {
      const collNames = category.collectionNames
        ?.filter((collection) => {
          const nameWords = createNameWords(collection.name);

          return nameWords.every((nameWord) =>
            allPrompt
              ?.toLocaleLowerCase()
              .includes(nameWord.trim().toLocaleLowerCase()),
          );
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

  const sortedByName = sortArrayBy(suggestedCollections, "collectionName");
  return sortBy === "category"
    ? sortArrayBy(sortedByName, "categoryName")
    : sortedByName;
};
