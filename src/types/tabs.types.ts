import type { ModelPreviewDoc } from "../../shared/types/firestore";
import type { ModelCategories } from "../../shared/types/user";

export interface TabsModelsData {
  tab: string;
  category: string | null;
  subcategory: string | null;
  nsfw: boolean;
  previews: ModelPreviewDoc[];
}

export interface TabsState {
  currTab: string;
  currCategory: string;
  currSubcategory: string;
  categoriesData: ModelCategories;
  errorMessage: string;
  modelsData: TabsModelsData;
  previewFullView: boolean;
  baseModels: string[];
  sortBy: string;
  baseModel: string;
  isLoading: boolean;
  isLastPage: boolean;
}
