import type { SubcategoryDefInputData } from "../types/forms.types";

export const FORMS_SUBCATEGORY_INPUT_DEF: SubcategoryDefInputData = {
  type: "text",
  id: "subcat-def",
  name: "sub",
  placeholder: "Subcategory",
  value: "",
  query: "",
  selected: { id: null, name: "" },
  isValid: true,
  errorMessage: "",
};
