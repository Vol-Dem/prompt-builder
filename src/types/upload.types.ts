import type { Image } from "../../shared/types/image";
import type {
  CollectionName,
  CollectionSubcategory,
  ModelCategory,
} from "../../shared/types/user";
import type { ResourceFirestoreCollection } from "./models.types";

export interface UploadingCollectionData {
  collectionData: CollectionName;
  categoryData: ModelCategory;
  subcategoriesData: CollectionSubcategory[];
  curCollectionSabcategories: string[];
}

export interface UploadingPostData {
  imagesId?: number[];
  postId: number;
}

export interface SavePostData extends UploadingCollectionData {
  imageIds: number[];
  postId: number;
  postData?: UploadingPostData | null;
  images: Image[];
}

export interface UploadingItem {
  collectionData: UploadingCollectionData | null;
  existedAmount?: number | null;
  ids: number[];
  images?: Image[];
  imgUrl: string;
  location: ResourceFirestoreCollection;
  modelId: number | null;
  modelName?: string;
  nsfwMode: boolean;
  postData?: UploadingPostData | null;
  postId: number;
  versionId: number | null;
  delete?: boolean;
}

export interface PostInfo {
  postId: number;
  modelId: number | null;
  versionId: number | null;
  location: ResourceFirestoreCollection;
  existedAmount?: number | null;
  ids: number[];
  images?: Image[];
  imgUrl: string;
  modelName?: string;
  nsfwMode: boolean;
  delete?: boolean;
  collectionData: Record<string, any> | null;
  postData?: UploadingPostData | null;
}

export interface UploadState {
  queue: UploadingItem[];
  rejected: UploadingItem[];
  completed: UploadingItem[];
  completedAmount: number;
  curPostId: number | null;
  isUploading: boolean;
}
