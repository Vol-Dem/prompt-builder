import type { UserModelDoc, CivitaiModelDoc } from "./firestore";

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

export interface ModelData extends UserModelDoc {
  data?: CivitaiModelDoc;
}
