import type {
  CollectionPreviewDoc,
  ModelPreview,
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

export type SearchResult = (
  | ModelPreviewDoc
  | CollectionPreviewDoc
  | ModelPreview
)[];

export interface SearchResultData {
  query: string;
  src: SearchSrcType | null;
  result: SearchResult;
  nsfw: boolean;
  hashtag: boolean;
  filter: SearchFilter | null;
}

export interface QuickSearchResult {
  query: string;
  src: SearchSrcType | null;
  result: SearchResult;
  nsfw: boolean;
  isLastPage: boolean;
}

export interface SearchFilter {
  src: SearchSrcType | null;
  modelType: string[];
  baseModel: string[];
  hashtag: boolean;
  sort?: string | null;
}

export interface SearchState {
  searchQuery: string;
  src: SearchSrcType;
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

export type SearchSrcType = "aitools" | "civitai";
