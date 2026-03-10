export interface ModelSubcategory {
  id: string;
  name: string;
}

export interface CollectionSubcategory {
  id: string;
  name: string;
}

export interface CollectionName {
  id: number;
  name: string;
  subcategories: string[];
}

export interface ModelCategory {
  id: string;
  name: string;
  subcategories?: ModelSubcategory[];
}

export interface ModelCategoryInput {
  id: string | null;
  name: string;
  subcategories?: ModelSubcategory[];
}

export interface CollectionCategory {
  collectionNames?: CollectionName[];
  id: string;
  name: string;
  subcategories?: CollectionSubcategory[];
}

export interface ModelCategories {
  [type: string]: ModelCategory[];
}

export interface PageGuideState {
  active: boolean;
  step: number;
}

export interface UserGuideState {
  active: boolean;
  introDisabled: boolean;
  outroIsActive: boolean;
  home: PageGuideState;
  model: PageGuideState;
  edit: PageGuideState;
}

export interface Preset {
  id: string;
  name: string;
  words: string;
}

export interface Presets {
  negative: Preset[];
  positive: Preset[];
}

export interface UserUiState {
  previewFullView?: boolean;
  sidePanelCardfullView?: boolean;
}
