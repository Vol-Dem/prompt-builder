import { useEffect } from "react";
import { useReducer } from "react";

// const defaultState = {
//   inputValue: "",
//   isValid: false,
//   errorMessage: "",
// };

const validationReducer = (state, action) => {
  const validTypes = action.type;
  if (!validTypes) {
    return state;
  }
  // const validTypes = {
  //   required: "",
  //   maxLength: "",
  //   minLength: "",
  //   email: "",
  //   password: true,
  //   number: "",
  //   string: "",
  // };
  const errorMessages = [];
  Object.keys(validTypes).forEach((type) => {
    if (!!validTypes[type] && type === "email") {
      const isValid = action.value.split("").includes("@");
      const errorMessage = isValid ? "" : "Incorrect email";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: action.value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "password") {
      const isValid = action.value.length >= 6;
      const errorMessage = isValid
        ? ""
        : "Passwords must contain more than 5 characters";

      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: action.value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "required") {
      const isValid = !!action.value;

      const errorMessage = isValid ? "" : "This field is required";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: action.value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "maxLength") {
      const isValid = !(action.value.length > validTypes[type]);
      const errorMessage = isValid
        ? ""
        : `Value cannot be more than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: action.value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "minLength") {
      const isValid = action.value.length >= validTypes[type];
      const errorMessage = isValid
        ? ""
        : `Value cannot be less than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: action.value, isValid, errorMessage };
    }
  });
  const isValid = !errorMessages.length;
  const errorMessage = !isValid ? errorMessages[0] : "";
  return { inputValue: action.value, isValid, errorMessage };
};

/**
 * Validate input data
 * @param {string} type - Type of validation (email, password, required, minLength, maxLength, number, string)
 * @param {Object} initialValue - initialValue
 * @returns {Array} - Returns array with a state object {inputValue,isValid,errorMessage}, and a function to pass value.
 */

// export const useValidation = (type, initialValue) => {
//   const [state, dispatch] = useReducer(validationReducer, defaultState);

//   const validate = useCallback(
//     (value) => {
//       dispatch({ type: type, value: value });
//     },
//     [dispatch, type]
//   );

//   return [state, validate];
// };
export const useValidation = (type, initialValue) => {
  const [state, dispatch] = useReducer(validationReducer, {
    inputValue: initialValue,
    isValid: false,
    errorMessage: "",
  });

  useEffect(() => {
    dispatch({ type: type, value: initialValue });
  }, [dispatch, type, initialValue]);

  return state;
};
