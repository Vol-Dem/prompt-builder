import type { CollectionSavedPost } from "./collection";
import type { Image } from "./image";
import type {
  Creator,
  ModelVersion,
  ModelStats,
  UserModelDefaultCustomData,
  ModelVersionsCustomData,
  ModelSavedImages,
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

export interface CivitaiModelDoc {
  allowCommercialUse: string[];
  allowDerivatives: boolean;
  allowDifferentLicense: boolean;
  allowNoCredit: boolean;
  availability: string;
  cosmetic: string | null;
  creator: Creator;
  description: string;
  id: number;
  minor: boolean;
  modelVersions: ModelVersion[];
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
}

export interface UserModelDoc {
  createdAt: number;
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
}

export interface ModelPreviewDoc {
  authorTags: string[];
  baseModel: string;
  baseModels: string[];
  createdAt: number;
  creator: Creator;
  customFileNames: string[];
  fileName: string;
  fileNames: string[];
  hashes: string[];
  id: number;
  imgType: string;
  imgUrl: string;
  latestFileName: string;
  main: string;
  mainTag: string;
  modelType: string;
  modelVersionsCustomData: ModelVersionsCustomData;
  name: string;
  nameArr: string[];
  nsfw: boolean;
  nsfwLevel: number;
  size: string;
  src: string;
  sub: string[];
  tags: string[];
  type: string;
  updatedAt: string;
  versionIds: number[];
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
