import type {
  CivitaiModelDoc,
  ModelPreviewDoc,
  UserModelDoc,
} from "../../shared/types/firestore";
import type { Image } from "../../shared/types/image";
import type {
  ModelSavedImages,
  ModelSavedPostInfo,
  ModelVersion,
} from "../../shared/types/model";
import type { PostInfo } from "./upload.types";

export interface ModelData extends UserModelDoc {
  data?: CivitaiModelDoc;
}

export type ResourceFirestoreCollection = "models" | "collections";
export type SrcType = "image" | "video";

export interface ModelSavedImagesData {
  modelId: number | null;
  data: ModelSavedImages;
}

export interface ActiveCarousel {
  currImgNum?: number | null;
  existedImgsAmount?: number | null;
  images: Image[];
  location?: ResourceFirestoreCollection;
  locationId?: number | null;
  modelId?: number | null;
  postId: number;
  saved: boolean;
  versionId?: number | null;
  visibleImgAmount?: number | null;
  side?: boolean;
}

export interface ModelsState {
  model: ModelData | null;
  savedImages: ModelSavedImagesData | null;
  modelPreview: ModelPreviewDoc[] | null;
  isLoading: boolean;
  errorMessage: string;
  curVersion: ModelVersion | null;
  activeCarouselData: ActiveCarousel | null;
}

export interface UpdateSavedImagesData {
  postInfo: PostInfo;
  data: ModelSavedPostInfo;
}
