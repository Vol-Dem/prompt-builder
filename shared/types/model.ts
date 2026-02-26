import type { UserModelDoc, CivitaiModelDoc } from "./firestore";
import type { Image } from "./image";

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

export interface VersionFileCivitai {
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

export interface VersionFile {
  downloadUrl: string;
  hashes: VersionHashes;
  id: number;
  metadata: VersionFileMetadata;
  name: string;
  primary: boolean;
  sizeKB: number;
  type: string;
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
  thumbsUpCount: number;
  rating?: number;
  ratingCount?: number;
  thumbsDownCount?: number;
}

export interface ModelStats extends VersionStats {
  commentCount?: number;
  favoriteCount?: number;
  tippedAmountCount?: number;
}

export interface ModelVersionCivitai {
  availability: string;
  baseModel: string;
  covered: boolean;
  createdAt: string;
  description: string;
  downloadUrl: string;
  files: VersionFileCivitai[];
  id: number;
  modelId?: number;
  images?: Image[];
  index: number;
  name: string;
  nsfwLevel: number;
  publishedAt: string;
  stats: VersionStats;
  status: string;
  trainedWords: string[];
}

export interface ModelVersion {
  baseModel: string;
  createdAt: string;
  description: string;
  downloadUrl: string;
  files: VersionFile[];
  id: number;
  images?: Image[];
  index: number | null;
  name: string;
  nsfwLevel: number | null;
  trainedWords: string[];
}

export interface UserModelDefaultCustomData {
  description: string;
  weight?: number;
  minWeight?: number;
  maxWeight?: number;
  size?: number;
  helperTags?: string[];
}

export interface ModelVersionCustomData {
  baseModel: string;
  defActTag?: string;
  defFileName: string;
  downloadStatus: boolean;
  index: number;
  name: string;
  trainedWords?: string[];
  versionId: number;
  versionImageUrl: string;
  versionName: string;
  mainTag?: string;
  size?: number | null;
  weight?: number | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  helperTags?: string[];
  fileName?: string;
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

export interface ModelData extends UserModelDoc {
  data?: CivitaiModelDoc;
}
