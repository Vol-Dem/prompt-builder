export const MODEL_TYPES = [
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

//SETTINGS
export const SETTINGS_STICKY_SWITCH_HEIGHT = 20;
export const SETTINGS_TIMEOUT_SEC = 10;
export const SETTINGS_RESULT_NUM = 10;
export const SETTINGS_REF_IMAGE_AMOUNT = 12;
export const SETTINGS_REF_IMAGE_ROW_LENGTH = 3;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_DEF = 450;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL = 250;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM = 350;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_BIG = 450;
export const SETTINGS_IMAGE_SAVED_POSTS_PER_PAGE = 16;
export const SETTINGS_IMAGE_GENERATED_PER_PAGE = 100;
export const SETTINGS_SEARCH_RESULT_PER_PAGE = 10;
export const SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE = 4;
export const SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT = 5;

//URLS
export const URL_CIV_MODELS = "https://civitai.com/api/v1/models/";
export const URL_CF_UPLOAD_MODEL =
  "https://uploadmodel-o43alvcema-uc.a.run.app";
export const URL_CF_UPDATE_MODEL =
  "https://updatemodel-o43alvcema-uc.a.run.app";

//REGEX
export const REGEX_SPLIT_TAGS = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

//VALIDATION
export const VALIDATION_CATEGORY_NAME_MAX_LENGTH = 70;
export const VALIDATION_USERNAME_MAX_LENGTH = 100;
export const VALIDATION_NAME_MAX_LENGTH = 300;
export const VALIDATION_TITLE_MAX_LENGTH = 500;
export const VALIDATION_DESCRIPTION_MAX_LENGTH = 100000;
export const VALIDATION_TRIGER_WORDS_MAX_LENGTH = 5000;
export const VALIDATION_ID_MAX_LENGTH = 20;
export const VALIDATION_NUMBER_MAX_LENGTH = 5;
export const VALIDATION_EMAIL_MAX_LENGTH = 50;
export const VALIDATION_PASSWORD_MAX_LENGTH = 100;

//MESSAGES
export const MESSAGE_AGREEMENT =
  "You have to accept our Terms of Service and Privacy Policy";

//SUCCESS MESSAGES
export const SUCCESS_MESSAGE_SAVED = "Saved successfully";
export const SUCCESS_MESSAGE_UPLOADED = "Upload complete";

//WARNING MESSAGES
export const WARNING_MESSAGE_LONG_LOADING =
  "Something went wrong. Loading time is unexpectedly long, try refreshing the page";

//ERROR MESSAGES
export const ERROR_MESSAGE_DEFAULT =
  "Oops! Something went wrong. Try refreshing!";
export const ERROR_MESSAGE_INPUT_DEF = "Invalid input data";
export const ERROR_MESSAGE_UNIQUE = "Name should be unique";
export const ERROR_MESSAGE_EXISTS = "This resource already exists";
export const ERROR_MESSAGE_AUTH = "You have to be logged in to view this page";
export const ERROR_MESSAGE_EMPTY =
  "No matching images found. Try to switch the NSFW filter or the related checkbox.";
export const ERROR_MESSAGE_OFFLINE =
  "Internet connection lost. Check your connection settings";
export const ERROR_MESSAGE_USER_DATA_LOAD =
  "Oops! Something went wrong. Try refreshing!";
export const ERROR_MESSAGE_INVALID_DATA = "Invalid data";

//GUIDE STEPS HOME PAGE
export const GUIDE_STEP_OPEN_CATEGORY = 1;
export const GUIDE_STEP_OPEN_MODEL = 2;

//GUIDE STEPS MODEL PAGE
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
export const GUIDE_STEP_PROMPT_EDIT_TAG = 13;
export const GUIDE_STEP_PROMPT_RESIZE = 14;
export const GUIDE_STEP_PROMPT_COPY = 15;
export const GUIDE_STEP_IMAGE_RESOURCES = 16;
export const GUIDE_STEP_CLOSE_IMAGE = 17;
export const GUIDE_STEP_MODEL_TAGS_EDIT = 18;
export const GUIDE_STEP_MODEL_TAGS_EDIT_FROM = null;
export const GUIDE_STEP_MODEL_TAGS_ADD_TAGSET = null;
export const GUIDE_STEP_MODEL_TAGS_CLOSE = null;
export const GUIDE_STEP_MODEL_ADD_TAGSET = 19;
export const GUIDE_STEP_MODEL_TAGSET = 20;
export const GUIDE_STEP_GENERATED_IMAGES = 21;
export const GUIDE_STEP_IMAGE_MENU = 22;
export const GUIDE_STEP_SAVE_IMAGE = 23;
export const GUIDE_STEP_SAVED_TAB = 24;
export const GUIDE_STEP_MODEL_EDIT = 25;

//GUIDE STEPS EDIT PAGE
export const GUIDE_STEP_EDIT_UPD_DEL = 1;
export const GUIDE_STEP_EDIT_VERSIONS_SWITCH = 2;
export const GUIDE_STEP_EDIT_DEFAULT = 3;
export const GUIDE_STEP_EDIT_MENU = 4;

//GUIDE
export const GUIDE_LAST_STEP_TYPE = "edit";
export const GUIDE_LAST_STEP = GUIDE_STEP_EDIT_MENU;

//ANIMATIONS FRAMER MOTION
export const ANIMATIONS_FM_SLIDEIN_INITIAL = { opacity: 0, y: 30 };
export const ANIMATIONS_FM_SLIDEIN = { opacity: 1, y: 0 };
export const ANIMATIONS_FM_SLIDEOUT_INITIAL = { opacity: 0, y: -30 };
export const ANIMATIONS_FM_SLIDEOUT = { opacity: 1, y: 0 };
export const ANIMATIONS_FM_FADEOUT_EXIT = { opacity: 0, scale: 0.8 };
export const ANIMATIONS_FM_ZOOM_IN_INITIAL = { opacity: 0, scale: 0.95 };
export const ANIMATIONS_FM_ZOOM_IN = { opacity: 1, scale: 1 };

export const DEFAULT_DATA_TAGSETS_INPUT = [
  [
    {
      type: "text",
      id: "set-name-def",
      name: "set-name",
      placeholder: "Set name",
      value: "",
      isValid: true,
    },
    {
      id: "set-value-def",
      name: "set-value",
      placeholder: "Triger words",
      value: "",
      isValid: true,
    },
  ],
];
