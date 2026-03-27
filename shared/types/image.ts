import type { SrcType } from "../../src/types/models.types";

export interface AdditionalResource {
  name: string;
  strength?: number;
  strengthClip?: number;
  type: string;
  hash?: string;
  modelVersionId?: number | null;
}

export interface CivitaiResource {
  modelVersionId: number;
  weight?: number;
  type?: string;
  hash?: string;
  modelId?: number;
  versionId?: number;
  name?: string;
}

export interface ModelResource {
  modelVersionId?: number;
  weight?: number;
  type?: string;
  hash?: string;
}

export interface ComfyResource {
  name: string;
  type: string;
  weight: number;
  modelVersionId?: number;
  hash?: string;
}

// export interface AllImageResources extends ModelResource,CivitaiResource,AdditionalResource {}
export type AllImageResources = ModelResource &
  CivitaiResource &
  AdditionalResource &
  ComfyResource;

export interface ImageMeta {
  Model?: string;
  additionalResources?: AdditionalResource[];
  cfgScale?: number;
  civitaiResources?: CivitaiResource[];
  comfyResources?: ComfyResource[];
  clipSkip?: number;
  controlNets?: string;
  denoise?: number;
  modelIds?: number[];
  models?: string[];
  negativePrompt?: string;
  prompt?: string;
  sampler?: string;
  seed?: number;
  steps?: number;
  upscalers?: string[];
  vaes?: string[];
  versionIds?: number[];
  ADetailerconfidence?: number;
  ADetailerdenoisingstrength?: number;
  ADetailerdilateerode?: number;
  ADetailerinpaintonlymasked?: number;
  ADetailerinpaintpadding?: number;
  ADetailermaskblur?: number;
  ADetailermaskmaxratio?: number;
  ADetailermaskminratio?: number;
  ADetailermodel?: string;
  ADetailerversion?: number;
  Hiresupscaler?: string;
  Denoisingstrength?: number;
  Modelhash?: string;
  Version?: number;
  hashes?: Record<string, string>;
  TIhashes?: string;
  Hiresupscale?: string;
  VAE?: string;
  Scheduletype?: string;
  Size?: number;
  resources?: ModelResource[];
  scheduler?: string;
  comfy?: string;
  "Model hash"?: string;
}

export interface Image {
  browsingLevel?: number;
  createdAt: string;
  hash?: string;
  id: number;
  meta: ImageMeta;
  nsfw: boolean | string;
  nsfwLevel: string | number;
  postId?: number;
  type?: SrcType;
  url: string;
  username?: string;
  height: number;
  width: number;
  modelVersionIds?: number[];
}

export interface SavedPostDoc {
  createdAt: string;
  hasSfw: boolean;
  id: number;
  items: Image[];
  versionsId: number[];
}
