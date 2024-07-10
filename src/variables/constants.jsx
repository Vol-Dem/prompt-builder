export const TIMEOUT_SEC = 10;
export const RESULT_NUM = 10;
export const SPLIT_TAG_REGEX = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
export const modelTypes = [
  { name: "LoRa/LoCon", value: "lora", position: 1 },
  { name: "Checkpoint", value: "checkpoint", position: 2 },
  { name: "Embedding", value: "embedding", position: 3 },
  { name: "Hypernetwork", value: "hypernetwork", position: 4 },
  { name: "Wildcard", value: "wildcard", position: 5 },
  { name: "Motion", value: "motionmodule", position: 6 },
  { name: "Controlnet", value: "controlnet", position: 7 },
  { name: "VAE", value: "vae", position: 8 },
  { name: "Wildcards", value: "wildcards", position: 9 },
  { name: "Other", value: "other", position: 10 },
];
export const CATEGORY_NAME_MAX_LENGTH = 70;
export const USERNAME_MAX_LENGTH = 100;
export const NAME_MAX_LENGTH = 300;
export const TITLE_MAX_LENGTH = 500;
export const DESCRIPTION_MAX_LENGTH = 100000;
export const TRIGER_WORDS_MAX_LENGTH = 5000;
export const ID_MAX_LENGTH = 20;
export const NUMBER_MAX_LENGTH = 5;
export const EMAIL_MAX_LENGTH = 50;
export const PASSWORD_MAX_LENGTH = 100;
export const DEF_SUCCESS_MESSAGE = "Saved successfully";
export const SAVED_SUCCESS_MESSAGE = "Upload complete";
export const DEF_INPUT_ERROR_MESSAGE = "Invalid input data";
export const UNIQUE_ERROR_MESSAGE = "This name already exists";
export const EXISTS_ERROR_MESSAGE = "This resource already exists";
export const AUTH_ERROR_MESSAGE = "You have to be logged in to view this page";
export const EMPTY_ERROR_MESSAGE =
  "No matching images found. Try to switch the NSFW filter or the related checkbox.";
export const OFFLINE_ERROR_MESSAGE =
  "Internet connection lost. Check your connection settings";
