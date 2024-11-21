export const UPLOAD_MODEL_URL = "https://uploadmodel-o43alvcema-uc.a.run.app";
export const UPDATE_MODEL_URL = "https://updatemodel-o43alvcema-uc.a.run.app";
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
export const MAX_REF_IMAGE_AMOUNT = 12;
export const IMAGE_REF_ROW_LENGTH = 3;
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
export const DEF_ERROR_MESSAGE = "Oops! Something went wrong. Try refreshing!";
export const SAVED_SUCCESS_MESSAGE = "Upload complete";
export const DEF_INPUT_ERROR_MESSAGE = "Invalid input data";
export const AGREEMENT_MESSAGE =
  "You have to accept our Terms of Service and Privacy Policy";
export const UNIQUE_ERROR_MESSAGE = "This name already exists";
export const EXISTS_ERROR_MESSAGE = "This resource already exists";
export const LONG_LOADING_WARNING_MESSAGE =
  "Something went wrong. Loading time is unexpectedly long, try refreshing the page";
export const AUTH_ERROR_MESSAGE = "You have to be logged in to view this page";
export const EMPTY_ERROR_MESSAGE =
  "No matching images found. Try to switch the NSFW filter or the related checkbox.";
export const OFFLINE_ERROR_MESSAGE =
  "Internet connection lost. Check your connection settings";
export const INITIAL_IMG_LOADING_MESSAGE =
  "We are loading images for this model from Civitai so that you can then access images and prompts. This may take some time only the first time. Try refreshing the page in a few moments.";
export const USER_DATA_LOAD_ERROR_MESSAGE =
  "Oops! Something went wrong. Try refreshing!";

export const GUIDE_STEP_ADD_MODEL_TO_SIDEPANEL = 1;
export const GUIDE_STEP_ADD_IMAGE_TO_SIDEPANEL = 2;
export const GUIDE_STEP_SIDEPANEL = 3;
export const GUIDE_STEP_SIDEPANEL_VIEW_SWITCH = 4;
export const GUIDE_STEP_OPEN_IMAGE = 5;
export const GUIDE_STEP_ADD_TO_PROMPT = 6;
export const GUIDE_STEP_ADD_ALL_TO_PROMPT = 7;
export const GUIDE_STEP_SWITCH_IMAGE = 8;
export const GUIDE_STEP_HIGHLIGHTING_WORDS = 9;
export const GUIDE_STEP_PROMPT_VIEW = 10;
export const GUIDE_STEP_PROMPT_PRESETS = 11;
export const GUIDE_STEP_PROMPT_DRAG_AND_DROP = 12;
export const GUIDE_STEP_PROMPT_COPY = 13;
export const GUIDE_STEP_IMAGE_RESOURCES = 14;
export const GUIDE_STEP_CLOSE_IMAGE = 15;
export const GUIDE_STEP_MODEL_TAGS_EDIT = 16;
export const GUIDE_STEP_MODEL_TAGS_EDIT_FROM = 17;
export const GUIDE_STEP_MODEL_TAGS_ADD_TAGSET = 18;
export const GUIDE_STEP_MODEL_TAGS_CLOSE = 19;
export const GUIDE_STEP_MODEL_TAGSET = 20;
export const GUIDE_STEP_GENERATED_IMAGES = 21;
export const GUIDE_STEP_IMAGE_MENU = 22;
export const GUIDE_STEP_SAVE_IMAGE = 23;
export const GUIDE_STEP_SAVED_TAB = 24;
export const GUIDE_STEP_MODEL_EDIT = 25;

// export const GUIDE_STEP_EDIT_PAGE = 1;
export const GUIDE_STEP_EDIT_UPD_DEL = 1;
export const GUIDE_STEP_EDIT_VERSIONS_SWITCH = 2;
export const GUIDE_STEP_EDIT_DEFAULT = 3;
export const GUIDE_STEP_EDIT_MENU = 4;

export const GUIDE_STEP_OPEN_CATEGORY = 1;
export const GUIDE_STEP_OPEN_MODEL = 2;

export const GUIDE_LAST_STEP_TYPE = "edit";
export const GUIDE_LAST_STEP = GUIDE_STEP_EDIT_MENU;
