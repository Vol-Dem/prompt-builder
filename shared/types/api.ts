import type { CivitaiModelDoc } from "./firestore";

export interface UpdateModelRequest {
  id: string | number; // modelId coming from client
}

export interface UpdateModelSuccess {
  modelId: number;
  modelData?: CivitaiModelDoc;
  updated?: boolean;
  message: string;
}

export interface UpdateModelError {
  error: string;
}

export type UpdateModelResponse = UpdateModelSuccess | UpdateModelError;

export interface CivitaiFetchResultItem {
  id: number;
}

export interface CivitaiFetchResult<T = CivitaiFetchResultItem> {
  items: T[];
  metadata: { nextCursor: string; nextPage: string };
}
