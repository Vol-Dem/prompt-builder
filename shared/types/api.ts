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
