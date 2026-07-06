import type { ChangeEvent } from "react";
import type { SuggestedCollectionsSortType } from "./collections.types";
import type { SrcType } from "./models.types";

export interface GeneralState {
  isMobile: boolean;
  headerIsFixed: boolean;
  nsfwMode: boolean;
  nsfwLevel: string;
  sfwValue: string;
  nsfwValue: string;
  activeAboutSectionId: string;
  suggestedCollectionsSortBy: SuggestedCollectionsSortType;
  civitaiEnums: CivitaiEnums | null;
  promptPanelHeight: number | null;
}

export interface SidebarPreviewData {
  id: number;
  versionId?: number | null;
  activeVersionId?: number | null;
  type: string;
  title?: string;
  versionName?: string | null;
  imgUrl?: string;
  imgType?: SrcType;
  imgUrlNsfw?: string;
  imgUrlNsfwType?: SrcType;
  mainTag?: string;
  baseModel?: string;
  weight?: number | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  tags?: string[] | null;
}
// export interface SidebarPreviewData extends ModelPreview {
//   activeVersionId: number | null;
//   type: string;
// }

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
  isValid: boolean,
  errorMessage?: string,
) => void;

// export type SelectOption<T = number | string> = {
//   id: T | null;
//   name: string;
// };
export type SelectOption<T extends number | string> = {
  id: T | null;
  name: string;
};

export type AboutNavigationItem = { id: string; name: string };

export type AutoScrollTo = "start" | "center" | "end" | "nearest";

export type CSSVariables = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

export interface CivitaiEnums {
  ModelType: string[];
  ModelFileType: string[];
  BaseModel: string[];
  ActiveBaseModel: string[];
  BaseModelType: string[];
}
