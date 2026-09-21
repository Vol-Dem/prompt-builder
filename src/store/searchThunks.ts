import type {
  CivitaiModelDoc,
  ModelPreviewDoc,
} from "../../shared/types/firestore";
import type { AppThunk } from "./store";
import { AppError, handleErrors, normalizeError } from "../utils/generalUtils";
import type {
  NsfwSearchResult,
  SearchFilter,
  SearchResult,
  SearchResultCollection,
} from "../types/search.types";
import { fetchData } from "../utils/fetch/fetchUtils";
import {
  createFirestoreSearchRequests,
  type SearchCursor,
  type SearchPage,
} from "../utils/fetch/fetchSearch";
import type { CivitaiFetchResult } from "../../shared/types/api";
import { ERROR_MESSAGE_CIV_CONNECTION } from "../variables/constants";
import { createCivitaiSearchUrl } from "../utils/searchUtils";
import { createModelPreviewData } from "../utils/modelUtils";

import { searchActions } from "./search";

let lastVisible: SearchCursor = "";
let lastVisibleCollection: SearchCursor = "";
let lastVisibleSub: SearchCursor = "";
// let currCursor: string | null = "";
let nextCursor: string | null = "";

/**
 * Searches for model and collection previews.
 *
 * Side effects:
 * - Fetches model previews from Firestore
 * - Optionally merges with already loaded previews
 *
 * @param {string} searchString - Search query.
 * @param {boolean} nsfw - Whether to include NSFW models and collections.
 * @param {number} [limitAmount=5] - Results per request.
 * @param {boolean} [loadMore=false] - Whether to append to existing previews instead of replacing them.
 * @param {boolean} [quickSerch=false] - Whether to perform a quick search (limited result set).
 * @param {boolean} [isHashtag=false] - Whether to search only by hashtags.
 * @param {Object} [filter] - Optional filter data.
 * @returns {Function} Redux thunk.
 */
export const liveSearch = (
  searchString: string,
  nsfw: NsfwSearchResult,
  limitAmount: number = 5,
  loadMore: boolean = false,
  quickSerch: boolean = false,
  isHashtag: boolean = false,
  filter?: SearchFilter,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(searchActions.setSearchIsLoading(true));
      const hashtag = isHashtag || !!filter?.hashtag;
      const creator = !!filter?.creator;
      const isLastPage = getState().search.isLastPage;
      const isLastCollectionsPage = getState().search.isLastCollectionsPage;
      const isLastSubPage = getState().search.isLastSubPage;
      const searchResult = getState().search.searchResult;

      if (isLastPage && isLastSubPage && isLastCollectionsPage) return;
      if (!searchString) return;

      if (!loadMore) {
        lastVisible = "";
        lastVisibleCollection = "";
        lastVisibleSub = "";
        dispatch(searchActions.clearSearchResult());
      }

      dispatch(searchActions.setSearchIsLoading(true));
      const uid = getState().auth.user.uid;
      const onlyCollections =
        filter?.modelType.length === 1 &&
        filter?.modelType.includes("collection");
      const requests = createFirestoreSearchRequests({
        uid,
        searchString,
        nsfwMode: nsfw.nsfwValue,
        limitAmount,
        hashtag,
        creator,
        onlyCollections: !!onlyCollections,
        filter,
        lastVisible,
        lastVisibleCollection,
        lastVisibleSub,
      });

      let modelsDataName: ModelPreviewDoc[] = [];
      let collectionsDataNames: SearchResultCollection[] = [];
      let modelPage: SearchPage<ModelPreviewDoc> | null = null;
      let collectionPage: SearchPage<SearchResultCollection> | null = null;

      if (!isLastPage && !hashtag && !creator && !onlyCollections) {
        modelPage = await requests.fetchModelsByName();
        modelsDataName = modelPage.items;
      }

      const includeColections =
        !hashtag &&
        !creator &&
        !filter?.baseModel?.length &&
        (!filter?.modelType?.length ||
          filter?.modelType?.includes("collection"));
      if (!isLastCollectionsPage && includeColections) {
        collectionPage = await requests.fetchCollectionsByName();
        collectionsDataNames = collectionPage.items;
      }

      let modelsDataSub: ModelPreviewDoc[] = [];
      let secondaryPage: SearchPage<ModelPreviewDoc> | null = null;

      const isLast =
        !modelPage?.items.length || modelPage?.items.length < limitAmount;
      const isLastCollection =
        !collectionPage?.items.length ||
        (collectionPage?.items.length < limitAmount && includeColections);

      if (
        (isLast || hashtag || creator) &&
        !isLastSubPage &&
        !onlyCollections
      ) {
        secondaryPage = await requests.fetchModelsBySecondaryFields();
        modelsDataSub = secondaryPage.items;
      }

      const isLastSub =
        isLast &&
        (!secondaryPage?.items.length ||
          secondaryPage?.items.length < limitAmount);

      if (!isLast && modelPage) {
        lastVisible = modelPage.cursor;
      }
      if (!isLastCollection && includeColections && collectionPage) {
        lastVisibleCollection = collectionPage.cursor;
      }
      if (isLast && !isLastSub && secondaryPage) {
        lastVisibleSub = secondaryPage.cursor;
      }

      const newModelsSearchResults = [...modelsDataName, ...modelsDataSub];
      const newModelsIds = newModelsSearchResults.map(({ id }) => id);
      const ids = searchResult?.result?.map(({ id }) => id);
      const filteredNewResult = newModelsSearchResults.filter(
        ({ id }, index) => !newModelsIds.includes(id, index + 1),
      );
      const filteredResult = filteredNewResult.filter(
        ({ id }) => !ids?.includes(id),
      );

      let finalResult: SearchResult = [];

      if (loadMore) {
        finalResult = [...searchResult.result, ...filteredResult];
      } else {
        finalResult = filteredNewResult;
      }

      if (collectionsDataNames?.length) {
        finalResult = [...finalResult, ...collectionsDataNames];
      }

      if (quickSerch) {
        dispatch(
          searchActions.setQuickSearchResult({
            query: searchString,
            nsfw,
            result: finalResult,
            src: "aitools",
            isLastPage: finalResult.length <= limitAmount,
          }),
        );
      } else {
        dispatch(
          searchActions.setSearchResult({
            query: searchString,
            src: "aitools",
            nsfw,
            result: finalResult,
            hashtag,
            creator,
            filter: filter || {
              modelType: [],
              baseModel: [],
              hashtag: hashtag,
              creator: creator,
              src: null,
            },
          }),
        );
        dispatch(searchActions.setIsLastPage(isLast));
        dispatch(searchActions.setIsLastCollectionsPage(isLastCollection));
        dispatch(searchActions.setIsLastSubPage(isLastSub));
      }
    } catch (error) {
      const errorMessage = handleErrors(normalizeError(error));
      dispatch(searchActions.setErrorMessage(errorMessage));
    } finally {
      dispatch(searchActions.setSearchIsLoading(false));
    }
  };
};

/**
 * Searches for Civitai model previews.
 *
 * Side effects:
 * - Fetches model previews from Civitai
 * - Optionally merges with already loaded previews
 *
 * @param searchString - Search query.
 * @param nsfw - Whether to include NSFW models.
 * @param loadMore - Whether to append to existing previews instead of replacing them.
 * @param isHashtag - Whether to search only by hashtags.
 * @param filter - Optional filter data.
 * @returns Redux thunk.
 */
export const civitaiSearch = (
  searchString: string | null,
  nsfw: NsfwSearchResult,
  limitAmount: number,
  loadMore: boolean = false,
  quickSerch: boolean = false,
  isHashtag: boolean = false,
  filter?: SearchFilter,
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const nsfwLevel = getState().general.nsfwLevel;
      dispatch(searchActions.setSearchIsLoading(true));
      const hashtag = isHashtag || !!filter?.hashtag;
      const creator = !!filter?.creator;
      const isLastPage = getState().search.isLastPage;
      const searchResult = getState().search.searchResult;

      if (isLastPage) return;
      if (!searchString) return;
      if (!loadMore) {
        nextCursor = "";
        // currCursor = "";
        dispatch(searchActions.clearSearchResult());
      }

      const url = createCivitaiSearchUrl(
        searchString,
        nsfw.nsfwValue,
        limitAmount,
        filter,
      );

      const curUrl = `${url}${nextCursor ? `&cursor=${nextCursor}` : ""}`;

      const data = await fetchData<CivitaiFetchResult<CivitaiModelDoc>>(curUrl);

      if (!data?.items) {
        throw new AppError(ERROR_MESSAGE_CIV_CONNECTION);
      }

      let modelPreviews = data.items.flatMap(
        (model) =>
          createModelPreviewData(
            model,
            model.modelVersions[0],
            null,
            nsfwLevel,
          ) || [],
      );

      let finalResult: SearchResult = [];

      if (loadMore) {
        finalResult = [...searchResult.result, ...modelPreviews];
      } else {
        finalResult = modelPreviews;
      }

      // currCursor = nextCursor;

      if (data.metadata?.nextCursor) {
        nextCursor = data.metadata.nextCursor;
      } else {
        dispatch(searchActions.setIsLastPage(true));
      }

      if (quickSerch) {
        dispatch(
          searchActions.setQuickSearchResult({
            query: searchString,
            nsfw,
            result: finalResult,
            src: "civitai",
            isLastPage: !data.metadata?.nextCursor,
          }),
        );
      } else {
        dispatch(
          searchActions.setSearchResult({
            query: searchString,
            src: "civitai",
            nsfw,
            result: finalResult,
            hashtag,
            creator,
            filter: filter || {
              modelType: [],
              baseModel: [],
              hashtag: hashtag,
              creator: creator,
              src: "civitai",
            },
          }),
        );
      }
    } catch (error) {
      const errorMessage = handleErrors(normalizeError(error));

      if (errorMessage)
        dispatch(searchActions.setErrorMessage(ERROR_MESSAGE_CIV_CONNECTION));
    } finally {
      dispatch(searchActions.setSearchIsLoading(false));
    }
  };
};
