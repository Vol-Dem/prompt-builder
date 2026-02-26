import type { ModelPreviewDoc } from "../../shared/types/firestore";

export interface SidebarPreviewData extends ModelPreviewDoc {
  activeVersionId: number | null;
}
