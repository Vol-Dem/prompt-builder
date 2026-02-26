import type { ModelCategory } from "../../shared/types/user";

export interface ModelCategorySearchData extends ModelCategory {
  type: string;
}

export interface CategorySearchItem {
  type: string;
  id: string;
  name: string;
  subId: string;
  subName: string;
}
