export interface Creator {
  image: string;
  username: string;
}

export interface VersionFileMetadata {
  format: string;
}

export interface VersionHashes {
  AutoV1: string;
  AutoV2: string;
  AutoV3: string;
  BLAKE3: string;
  CRC32: string;
  SHA256: string;
}

export interface VersionFile {
  downloadUrl: string;
  hashes: VersionHashes;
  id: number;
  metadata: VersionFileMetadata;
  name: string;
  pickleScanMessage: string;
  pickleScanResult: string;
  primary: boolean;
  scannedAt: string;
  sizeKB: number;
  type: string;
  virusScanMessage: string | null;
  virusScanResult: string;
}

export interface VersionImage {
  hasMeta: boolean;
  hasPositivePrompt: boolean;
  hash: string;
  height: number;
  minor: false;
  nsfwLevel: number;
  onSite: boolean;
  poi: boolean;
  remixOfId: number | null;
  type: string;
  url: string;
  width: number;
}

export interface VersionStats {
  downloadCount: number;
  rating: number;
  ratingCount: number;
  thumbsDownCount: number;
  thumbsUpCount: number;
}

export interface ModelStats extends VersionStats {
  commentCount: number;
  favoriteCount: number;
  tippedAmountCount: number;
}

export interface ModelVersion {
  availability: string;
  baseModel: string;
  covered: boolean;
  createdAt: string;
  description: string;
  downloadUrl: string;
  files: VersionFile[];
  id: number;
  images?: VersionImage[];
  index: number;
  name: string;
  nsfwLevel: number;
  publishedAt: string;
  stats: VersionStats;
  status: string;
  trainedWords: string[];
}

export interface CivitaiModel {
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

export interface UserModelDefaultCustomData {
  description: string;
}

export interface ModelVersionCustomData {
  baseModel: string;
  defActTag: string;
  defFileName: string;
  downloadStatus: boolean;
  index: number;
  name: string;
  trainedWords: string[];
  versionId: number;
  versionImageUrl: string;
  versionName: string;
}

export interface ModelVersionsCustomData {
  [versionId: string]: ModelVersionCustomData;
}

export interface ModelSavedPostInfo {
  postId: number;
  imagesId: number[];
}

export interface ModelSavedImages {
  [versionId: string]: ModelSavedPostInfo[];
}

export interface UserModel {
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

export interface ModelData extends UserModel {
  data: CivitaiModel;
}

export interface ModelPreview {
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
