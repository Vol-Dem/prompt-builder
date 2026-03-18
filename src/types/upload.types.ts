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
  curCollectionSabcategories: CollectionSubcategory[];
}

export interface UploadingPostData {
  imagesId: number[];
  postId: number;
}

export interface SavePostData extends UploadingCollectionData {
  imageIds: number[];
  postId: number;
  postData?: UploadingPostData;
  images: Image[];
}

export interface UploadingItem {
  collectionData: UploadingCollectionData | null;
  existedAmount?: number | null;
  ids: number[];
  images: Image[];
  imgUrl: string;
  location: ResourceFirestoreCollection;
  modelId: number;
  modelName: string;
  nsfwMode: boolean;
  postData?: UploadingPostData;
  postId: number;
  versionId: number;
  delete: boolean;
}

export interface PostInfo {
  postId: number;
  modelId: number;
  versionId: number;
  location: ResourceFirestoreCollection;
  existedAmount?: number | null;
  ids: number[];
  images: Image[];
  imgUrl: string;
  modelName: string;
  nsfwMode: boolean;
  delete: boolean;
  collectionData: Record<string, any> | null;
  postData?: UploadingPostData;
}

export interface UploadState {
  queue: UploadingItem[];
  rejected: UploadingItem[];
  completed: UploadingItem[];
  completedAmount: number;
  curPostId: number | null;
  isUploading: boolean;
}
