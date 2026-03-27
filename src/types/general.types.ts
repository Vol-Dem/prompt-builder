import type { ChangeEvent } from "react";
import type { ModelPreviewDoc } from "../../shared/types/firestore";

export interface GeneralState {
  isMobile: boolean;
  headerIsFixed: boolean;
  nsfwMode: boolean;
  nsfwLevel: string;
  sfwValue: string;
  nsfwValue: string;
  activeAboutSectionId: string;
}

export interface SidebarPreviewData extends ModelPreviewDoc {
  activeVersionId: number | null;
}

export type ValidationTypes = {
  email?: boolean;
  password?: boolean;
  required?: boolean;
  number?: boolean;
  maxLength?: number;
  minLength?: number;
  modelId?: boolean;
  disableErrorOnBlur?: boolean;
};

export type Validated = {
  inputValue: string;
  isValid: boolean;
  errorMessage: string;
};

export type ExtendedOnChange<T = HTMLInputElement> = (
  e: ChangeEvent<T>,
  isValid: boolean | null,
  errorMessage?: string,
) => void;
