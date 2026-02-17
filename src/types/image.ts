export interface AdditionalResource {
  name: string;
  strength?: number;
  strengthClip?: number;
  type: string;
}

export interface CivitaiResource {
  modelVersionId: number;
  weight?: number;
  type?: string;
}

export interface ImageMeta {
  Model: string;
  additionalResources?: AdditionalResource[];
  cfgScale?: number;
  civitaiResources?: CivitaiResource[];
  clipSkip?: number;
  controlNets?: string;
  denoise?: number;
  modelIds?: number[];
  models?: string[];
  negativePrompt: string;
  prompt: string;
  sampler?: string;
  seed?: number;
  steps?: number;
  upscalers?: string[];
  vaes?: string[];
  versionIds?: number[];
}

export interface Image {
  browsingLevel: number;
  createdAt: string;
  hash: string;
  height: number;
  id: number;
  meta: ImageMeta;
  nsfw: boolean;
  nsfwLevel: string | number;
  postId: number;
  type: string;
  url: string;
  username: string;
  width: number;
}
