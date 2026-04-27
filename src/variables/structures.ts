import type { SubcategoryInput } from "../types/forms.types";
import type { TagSetInputData } from "../types/prompt.types";

export const FORMS_DEF_SUBCATEGORY_INPUT: SubcategoryInput = {
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

export const FORMS_DEF_TAGS_INPUT: TagSetInputData = [
  {
    type: "text",
    id: "set-name-def",
    name: "set-name",
    placeholder: "Set name",
    value: "",
    isValid: true,
  },
  {
    type: "text",
    id: "set-value-def",
    name: "set-value",
    placeholder: "Triger words",
    value: "",
    isValid: true,
  },
];
