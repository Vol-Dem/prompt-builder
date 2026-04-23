import type {
  CollectionDoc,
  CollectionPreviewDoc,
} from "../../shared/types/firestore";
import type { Image } from "../../shared/types/image";
import type {
  CollectionCategory,
  CollectionName,
  CollectionSubcategory,
} from "../../shared/types/user";

export interface CollectionImages {
  collectionId?: number;
  images: Image[][];
  isLastPage: boolean;
  lastVisibleId?: number;
}

export interface CollectionPreviewsData {
  category: string;
  data: CollectionPreviewDoc[];
  nsfw: boolean;
  subcategory: string;
}

export interface CollectionsState {
  categories: CollectionCategory[];
  activeCategory: string;
  activeSubcategory: string;
  collectionPreviews: CollectionPreviewsData | null;
  isLastPage: boolean;
  isLastPreviewsPage: boolean;
  imagesIsLoading: boolean;
  previewsIsLoading: boolean;
  collectionDataIsSaving: boolean;
  errorMessage: string;
  previewsErrorMessage: string;
  collectionImages: CollectionImages;
  collectionData: CollectionDoc | null;
}

export interface PostSavedData {
  createdAt?: number;
  imageIds?: number[];
  imagesId?: number[];
  postId: number;
}

export interface CollectionData {
  collectionData: CollectionName;
  categoryData: { id?: string | null; name?: string | null };
  subcategoriesData: CollectionSubcategory[];
}

export interface EditCollectionData extends CollectionData {
  description: string;
  nsfw: boolean;
}

export type SuggestedCollectionsSortType = "category" | "name";

export type SuggestedCollection = {
  categoryId: string;
  categoryName: string;
  collectionId: number;
  collectionName: string;
};
