import type { ModelPreviewDoc } from "../../shared/types/firestore";
import type { ImageMeta } from "../../shared/types/image";

export interface ImageSrcs {
  previewSrc: string;
  previewVideoWebmSrc?: string;
  previewVideoMp4Src?: string;
  originalVideoMp4Src?: string;
  originalVideoWebmSrc?: string;
}

export interface ImageResourceData {
  fileName?: string;
  modelId?: number;
  modelVersionId?: number | null;
  name?: string;
  type?: string;
  versionId?: number;
  versionName?: string;
  preview?: ModelPreviewDoc;
}

export interface PostForDeletion {
  uid: string;
  modelId: number;
  type: string;
  postId: number;
}

export interface ImageMetaWithUpdatedModelData extends ImageMeta {
  modelName?: string;
  modelId?: number;
  versionName?: string;
  versionId?: number;
}
