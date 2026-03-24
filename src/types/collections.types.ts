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

export interface CollectionPostSavedData {
  createdAt: number;
  imageIds: number[];
  postId: number;
}

export interface EditCollectionData {
  collectionData: CollectionName;
  categoryData: CollectionCategory;
  subcategoriesData: CollectionSubcategory[];
  description: string;
  nsfw: boolean;
}

export interface AddCollectionData {
  collectionData: CollectionName;
  categoryData: CollectionCategory;
  subcategoriesData: CollectionSubcategory[];
  curCollectionSabcategories: string[];
}
