import type {
  CollectionPreviewDoc,
  ModelPreviewDoc,
} from "../../shared/types/firestore";
import type { ModelCategory } from "../../shared/types/user";

export interface ModelCategorySearchData extends ModelCategory {
  type: string;
}

export interface CategorySearchItem {
  type: string;
  id: string;
  name: string;
  subId: string;
  subName: string;
}

export type SearchResult = (ModelPreviewDoc | CollectionPreviewDoc)[];

export interface SearchResultData {
  query: string;
  result: SearchResult;
  nsfw: boolean;
  hashtag: boolean;
  filter: SearchFilter | null;
}

export interface QuickSearchResult {
  query: string;
  result: SearchResult;
  nsfw: boolean;
}

export interface SearchFilter {
  modelType: string[];
  baseModel: string[];
  hashtag: boolean;
}

export interface SearchState {
  searchQuery: string;
  searchResult: SearchResultData;
  quickSearchResult: QuickSearchResult;
  searchFilter: SearchFilter;
  isLoading: boolean;
  errorMessage: string;
  isLastPage: boolean;
  isLastCollectionsPage: boolean;
  isLastSubPage: boolean;
}

export interface SearchResultCollection extends CollectionPreviewDoc {
  type: string;
}
