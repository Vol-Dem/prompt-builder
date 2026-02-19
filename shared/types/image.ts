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
  Model?: string;
  additionalResources?: AdditionalResource[];
  cfgScale?: number;
  civitaiResources?: CivitaiResource[];
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
  resources?: string;
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
  nsfw: boolean;
  nsfwLevel?: string | number;
  postId?: number;
  type?: string;
  url: string;
  username?: string;
  height: number;
  width: number;
}
