import {
  ERROR_MESSAGE_INVALID_MODEL_ID,
  VALIDATION_PASSWORD_MIN_LENGTH,
  VALIDATION_PASSWORD_SPECIAL_CHARACTERS,
  VALIDATION_VALIDATE_PASSWORD_LETTER_COMBINATION,
  VALIDATION_VALIDATE_PASSWORD_NUMBER_INCLUSION,
  VALIDATION_VALIDATE_PASSWORD_SPECIAL_CHARACTERS,
} from "../variables/constants";
import { parseModelIds } from "./modelUtils";

/**
 * Validates input data
 * @param {({email: boolean, password: boolean, required: boolean, number: boolean, maxLength: number, minLength: number, modelId: boolean})} validTypes - An object with validation types as keys (email, password, required, number, minLength, maxLength, modelId) and their configurations as values.
 * @param {string} value - The value to validate
 * @returns {({inputValue: string, isValid: boolean, errorMessage: string})} The state object containing the provided value, validation state, and error message.
 * Structure: {inputValue: string, isValid: boolean, errorMessage: string}
 */
export const validateInput = (validTypes, value) => {
  if (!validTypes) {
    return;
  }

  const errorMessages = [];

  Object.keys(validTypes).forEach((type) => {
    if (!validTypes[type]) return;

    switch (type) {
      case "email":
        if (!isEmail(value)) {
          errorMessages.push("Please enter a valid email address");
        }
        break;

      case "password": {
        const hasNotMinLength = !hasMinLength(
          value,
          VALIDATION_PASSWORD_MIN_LENGTH
        );
        const hasNotLettersCombination =
          VALIDATION_VALIDATE_PASSWORD_LETTER_COMBINATION &&
          !hasLettersCombination(value);
        const hasNotSpecialCharacters =
          VALIDATION_VALIDATE_PASSWORD_SPECIAL_CHARACTERS &&
          !hasSpecialCharacters(value);
        const hasNotNumbers =
          VALIDATION_VALIDATE_PASSWORD_NUMBER_INCLUSION && !hasNumbers(value);

        if (
          hasNotMinLength ||
          hasNotLettersCombination ||
          hasNotSpecialCharacters ||
          hasNotNumbers
        ) {
          errorMessages.push(
            `Password must be at leas ${VALIDATION_PASSWORD_MIN_LENGTH} characters long${
              VALIDATION_VALIDATE_PASSWORD_LETTER_COMBINATION
                ? ", contain a mix of upper and lower case letters"
                : ""
            }${
              VALIDATION_VALIDATE_PASSWORD_SPECIAL_CHARACTERS
                ? ", include special characters"
                : ""
            }${
              VALIDATION_VALIDATE_PASSWORD_NUMBER_INCLUSION
                ? ", and contain numbers"
                : ""
            }`
          );
        }
        break;
      }
      case "required":
        if (!isNotEmpty(value)) {
          errorMessages.push("This field is required");
        }
        break;

      case "number":
        if (!isNumber(value)) {
          errorMessages.push("Value must be a number");
        }
        break;

      case "maxLength":
        if (!lessThenMaxLength(value, validTypes[type])) {
          errorMessages.push(
            `Value cannot be more than ${validTypes[type]} characters`
          );
        }
        break;

      case "minLength":
        if (!hasMinLength(value, validTypes[type])) {
          errorMessages.push(
            `Value cannot be longer than ${validTypes[type]} characters`
          );
        }
        break;

      case "modelId":
        if (!isModelId(value)) {
          errorMessages.push(ERROR_MESSAGE_INVALID_MODEL_ID);
        }
        break;
      default:
    }
  });

  const isValid = !errorMessages.length;
  const errorMessage = !isValid ? errorMessages[0] : "";
  return { inputValue: value, isValid, errorMessage };
};

/**
 * Checks if the provided value is an email
 * @param {string} value - Provided value
 * @returns {boolean} True if the value is a valid email, otherwise false
 */
const isEmail = (value) => {
  return value.includes("@");
};

/**
 * Checks if the provided value has both uppercase and lowercase characters
 * @param {string} value - Provided value
 * @returns {boolean} True if the value contains both uppercase and lowercase characters, otherwise false
 */
const hasLettersCombination = (value) => {
  const upper = /[A-Z]/.test(value);
  const lower = /[a-z]/.test(value);

  return upper && lower;
};

/**
 * Checks if the provided value contains numbers
 * @param {string} value - Provided value
 * @returns {boolean} True if the value contains numbers, otherwise false
 */
const hasNumbers = (value) => {
  const numbers = /[0-9]/.test(value);
  return numbers;
};

/**
 * Checks if the provided value contains special characters
 * @param {string} value - Provided value
 * @returns {boolean} True if the value contains special characters, otherwise false
 */
const hasSpecialCharacters = (value) => {
  return VALIDATION_PASSWORD_SPECIAL_CHARACTERS.test(value);
};

/**
 * Checks if the provided value is not empty
 * @param {string} value - Provided value
 * @returns {boolean} True if the value is not empty, otherwise false
 */
const isNotEmpty = (value) => {
  return value.trim() !== "";
};

/**
 * Checks if the provided value is a number
 * @param {string} value - Provided value
 * @returns {boolean} True if the value is a number, otherwise false
 */
export const isNumber = (value) => {
  return Number.isFinite(+value);
};

/**
 * Checks if the provided value is not shorter than the provided minimum length
 * @param {string} value - Provided value
 * @param {string} minLength - Provided minimum length
 * @returns {boolean} True if the value meets the minimum length, otherwise false
 */
const hasMinLength = (value, minLength) => {
  return value.length >= minLength;
};

/**
 * Checks if the provided value is not longer than the provided maximum length.
 * @param {string} value - Provided value
 * @param {string} maxLength - Provided maximum length
 * @returns {boolean} True if the value is within the maximum length, otherwise false
 */
const lessThenMaxLength = (value, maxLength) => {
  return value.length <= maxLength;
};

// /**
//  * Checks if the provided values are equal
//  * @param {String} value - The first value
//  * @param {String} otherValue - The second value
//  * @returns {Boolean} True if both values are equal, otherwise false
//  */
// const isEqualsToOtherValue = (value, otherValue) => {
//   return value === otherValue;
// };

/**
 * Checks if the provided value is a model ID
 * @param {string} value - Provided value
 * @returns {boolean} True if the value is a valid model ID, otherwise false
 */
const isModelId = (value) => {
  const [modelId] = parseModelIds(value);
  return !!modelId;
};
