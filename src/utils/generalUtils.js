export const clearObjectKeys = (obj) => {
  const convertedMetaArr = Object.entries(obj).map((entry, i) => {
    let newKey;
    newKey = entry[0]
      ? entry[0].replace(/[^\w\s]/gi, "X").replace(/[^\\x00-\\xFF]*/giu, "")
      : `key${i}`;
    newKey = newKey.replaceAll("__", "");
    if (newKey === "" || newKey === undefined) {
      newKey = `key${i}`;
    }
    let newValue = entry[1];
    if (!newValue) {
      newValue = null;
    }
    return [newKey, newValue];
  });
  return Object.fromEntries(convertedMetaArr);
};

export const clearFileExtension = (name) => {
  const clearedName = name
    ?.replace(".safetensors", "")
    .replace(".pt", "")
    .replace(".pth", "")
    .replace(".ckpt", "");
  return clearedName;
};

export const addDelayPromise = (delay) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("foo");
    }, delay);
  });
};

export const splitTags = (arr) => {
  const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
  return arr.split(splitRegEx).flatMap((tag) => tag.trim() || []);
};

/**
 * Validate input data
 * @param {string} rules - Type of validation (email, password, required, minLength, maxLength, number, string)
 * @param {Object} value - value
 * @returns {Array} - Returns state object {inputValue, isValid, errorMessage}
 */
export const validateInput = (rules, value) => {
  const validTypes = rules;
  if (!validTypes) {
    return;
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
      const isValid = value.split("").includes("@");
      const errorMessage = isValid ? "" : "Email must includes @";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "password") {
      const isValid = value.length >= 6;
      const errorMessage = isValid ? "" : "Password needs to be 6+ characters";
      console.log(isValid);
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "required") {
      const isValid = !!value;
      console.log(value);
      const errorMessage = isValid ? "" : "This field is required";
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "number") {
      const isValid = Number.isFinite(+value);
      const errorMessage = isValid ? "" : `Value has to be a number`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "maxLength") {
      // let isValid;

      // if (
      //   validTypes.hasOwnProperty("number") &&
      //   validTypes["number"] === true &&
      //   Number.isFinite(+value)
      // ) {
      //   isValid = !(+value > 9999);
      // } else {
      //   isValid = !(value.length > validTypes[type]);
      // }
      const isValid = !(value.length > validTypes[type]);
      const errorMessage = isValid
        ? ""
        : `Value cannot be more than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
    if (!!validTypes[type] && type === "minLength") {
      const isValid = value.length >= validTypes[type];
      const errorMessage = isValid
        ? ""
        : `Value cannot be less than ${validTypes[type]} characters`;
      if (!!errorMessage) {
        errorMessages.push(errorMessage);
      }
      // return { inputValue: value, isValid, errorMessage };
    }
  });
  const isValid = !errorMessages.length;
  const errorMessage = !isValid ? errorMessages[0] : "";
  // console.log("VAL", value);
  // console.log("WTF", isValid);
  // console.log("WTFM", errorMessages);
  return { inputValue: value, isValid, errorMessage };
};
