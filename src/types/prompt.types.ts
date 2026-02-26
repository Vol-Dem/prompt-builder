export interface Tag {
  id: number;
  tag: string;
  position: number;
  weight: number;
  duplicateId?: number | null;
}

export interface TagSet {
  name: string;
  value: string;
}

export interface TagSetInputName {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  isValid: boolean;
  errorMessage: string;
}
export interface TagSetInputValue {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  isValid: boolean;
  errorMessage: string;
}
export type TagSetInputData = [TagSetInputName, TagSetInputValue];

export interface PromptItem {
  id: number;
  position: number;
  tag: string;
  weight: number;
}
