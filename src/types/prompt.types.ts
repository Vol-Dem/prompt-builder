import type { Preset } from "../../shared/types/user";

export interface PromptItem {
  id: number;
  position: number;
  tag: string;
  weight: number;
}

export interface PromptState {
  curPrompt: string;
  curPromptArr: PromptItem[];
  curNegPrompt: string;
  curNegPromptArr: PromptItem[];
  presets: { positive: Preset[]; negative: Preset[] };
  promptIsOpen: boolean;
  isTextMode: boolean;
  headerHeight: number | null;
  promptBtnHeight: number | null;
  promptHeight: number | null;
  positivePromptHeight: number | null;
  negativePromptHeight: number | null;
}

export interface PromptOpenState {
  promptIsOpen: boolean;
}
export interface TextModeState {
  isTextMode: boolean;
}

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
  imgUrl?: string;
}

export interface TagSetInputName {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  isValid: boolean | null;
  errorMessage: string;
}
export interface TagSetInputValue {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  isValid: boolean | null;
  errorMessage: string;
}
export type TagSetInputData = [TagSetInputName, TagSetInputValue];
