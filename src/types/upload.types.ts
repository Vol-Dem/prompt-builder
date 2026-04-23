import type { OverrideFields } from "../../shared/types/general";
import type { Image } from "../../shared/types/image";
import type { CollectionData } from "./collections.types";
import type { ResourceFirestoreCollection } from "./models.types";

// export interface  UploadingCollectionData extends CollectionData {
//   curCollectionSabcategories?: string[];
// }

export type UploadingCollectionData = OverrideFields<
  CollectionData,
  {
    collectionData: {
      id: number | null;
      name: string;
      subcategories?: string[];
    };
    subcategoriesData: { id: string | null; name: string }[];
    curCollectionSabcategories?: string[];
  }
>;

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
  modelName?: string | null;
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
  modelName?: string | null;
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
