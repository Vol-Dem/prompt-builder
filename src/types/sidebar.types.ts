import type { Image } from "../../shared/types/image";
import type { SidebarPreviewData } from "./general.types";

export interface RightSidebarState {
  models: SidebarPreviewData[];
  images: Image[];
  panelIsOpen: boolean;
  formIsOpen: boolean;
  fullCardView: boolean;
  sidePanelWidth: number | null;
}

export interface RightSidebarOpenState {
  panelIsOpen: boolean;
}
