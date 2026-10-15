import type { ValidationTypes } from "../../types/general.types";
import {
  VALIDATION_CATEGORY_NAME_MAX_LENGTH,
  VALIDATION_DESCRIPTION_MAX_LENGTH,
} from "./validation.js";

export const COLLECTION_VALIDATION = {
  name: { required: true, maxLength: VALIDATION_CATEGORY_NAME_MAX_LENGTH },
  description: { maxLength: VALIDATION_DESCRIPTION_MAX_LENGTH },
} satisfies Record<string, ValidationTypes>;
