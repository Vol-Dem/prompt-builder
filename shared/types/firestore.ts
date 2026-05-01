import type { CollectionSavedPost } from "./collection";
import type { Image } from "./image";
import type {
  Creator,
  ModelVersionCivitai,
  ModelStats,
  UserModelDefaultCustomData,
  ModelVersionsCustomData,
  ModelSavedImages,
  ModelVersion,
  VersionFileCivitai,
} from "./model";
import type {
  ModelCategory,
  UserGuideState,
  CollectionCategory,
  Presets,
  UserUiState,
} from "./user";

export interface UserDoc {
  baseModels: string[];
  categoriesById: Record<string, ModelCategory[]>;
  guide: UserGuideState;
  imageCategories: CollectionCategory[];
  nsfwMode: boolean;
  presets: Presets;
  uiState: UserUiState;
}

export interface CivitaiBaseModelData {
  name: string;
  type: string;
  nsfw: boolean;
  poi: boolean;
}

export interface CivitaiModelDoc {
  allowCommercialUse: string[];
  allowDerivatives: boolean;
  allowDifferentLicense: boolean;
  allowNoCredit: boolean;
  availability: string;
  cosmetic: string | null;
  creator: Creator;
  description: string | null;
  id: number;
  minor: boolean;
  modelVersions: ModelVersionCivitai[];
  name: string;
  nsfw: boolean;
  nsfwLevel: number;
  poi: boolean;
  sfwOnly: boolean;
  stats: ModelStats;
  supportsGeneration: boolean;
  tags: string[];
  type: string;
  updatedAt: number;
  air: string;
  baseModel: string;
  baseModelType: string;
  createdAt: string;
  downloadUrl: string;
  earlyAccessConfig: string | null;
  earlyAccessEndsAt: string | null;
  files: VersionFileCivitai[];
  images: string;
  model: CivitaiBaseModelData;
  modelId: number;
  publishedAt: string;
  status: string;
  trainedWords: string[];
  trainingDetails: null;
  trainingStatus: null;
  uploadType: string;
  usageControl: string;
}

export interface ModelDoc {
  allowCommercialUse: string[];
  allowDerivatives: boolean;
  allowDifferentLicense: boolean;
  allowNoCredit: boolean;
  availability: string;
  cosmetic: string | null;
  creator: Creator;
  description: string | null;
  id: number;
  minor: boolean;
  modelVersions: ModelVersion[];
  name: string;
  nsfw: boolean;
  nsfwLevel: number;
  poi: boolean;
  sfwOnly: boolean;
  stats: string;
  supportsGeneration: boolean;
  tags: string[];
  type: string;
  updatedAt: number;
}

export interface UserModelDoc {
  createdAt: number | string;
  defaultCustomData: UserModelDefaultCustomData;
  hashtags: string[];
  id: number;
  main: string;
  mainTag: string;
  modelType: string;
  modelVersionsCustomData: ModelVersionsCustomData;
  name: string;
  nsfw: boolean;
  savedImages: ModelSavedImages;
  src: string;
  sub: string[];
  updatedAt: string;
  versionIds: string[];
  downloadedAt?: string;
}

export interface ModelPreview {
  baseModel: string;
  id: number;
  main: string;
  sub: string[];
  versionId?: number | null;
  imgUrl: string;
  customPreviewImgUrl?: string;
  nsfwPreviewImgUrl?: string;
  size: number | null;
  src: string;
  modelType: string;
  tags?: string[] | null;
  mainTag?: string;
  title?: string;
  name?: string;
  versionName?: string | null;
  weight?: number | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  helperTags?: string[];
  updatedAt: string;
}

export interface ModelPreviewDoc {
  authorTags: string[];
  baseModel: string;
  baseModels: string[];
  createdAt: number;
  creator: Creator;
  customFileNames?: string[];
  fileName: string;
  fileNames: string[];
  hashes: string[];
  id: number;
  versionId?: number;
  imgType: string;
  imgUrl: string;
  nsfwPreviewImgUrl?: string;
  latestFileName: string;
  main: string;
  mainTag?: string;
  modelType: string;
  modelVersionsCustomData: ModelVersionsCustomData;
  name: string;
  nameArr: string[];
  nsfw: boolean;
  nsfwLevel: string | number;
  size: number | null;
  src: string;
  sub: string[];
  tags?: string[] | null;
  type: string;
  updatedAt: string;
  versionIds: number[];
  title?: string;
  versionName?: string;
  customPreviewImgUrl?: string;
  weight?: number | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  helperTags?: string[];
  customPreviewImgType?: string;
  nsfwPreviewImgType?: string;
}

export interface CollectionDoc {
  category: string;
  createdAt: number;
  description: string;
  id: number;
  name: string;
  nameArr: string[];
  nsfw: boolean;
  posts: CollectionSavedPost[];
  subcategories: string[];
}

export interface CollectionPreviewDoc {
  category: string;
  createdAt: number;
  id: number;
  name: string;
  nameArr: string[];
  nsfw: boolean;
  customPreviewImgUrl?: string;
  nsfwPreviewImgUrl?: string;
  customPreviewImgType?: string;
  nsfwPreviewImgType?: string;
  imgType?: string;
  type?: string;
  subcategories: string[];
}

export interface SavedImagePostDoc {
  createdAt: string;
  hasSfw: boolean;
  id: number;
  items: Image[];
  versionsId: number[];
}

export interface VersionDefaultImageDoc {
  createdAt: string;
  default: boolean;
  items: Image[];
  nsfw: boolean;
  nsfwLevel: string | number;
  nsfwTypes: boolean[];
  savedAt: number;
  versionId: number;
}
