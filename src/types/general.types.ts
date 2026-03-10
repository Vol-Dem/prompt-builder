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
