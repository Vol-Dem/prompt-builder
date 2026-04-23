export const DEV_GUIDE_TEST = false;
export const MODEL_TYPES = [
  {
    name: "LoRa/LoCon/DoRa",
    value: "lora",
    position: 1,
    aliases: ["lora", "locon", "dora"],
  },
  {
    name: "Checkpoint",
    value: "checkpoint",
    position: 2,
    aliases: ["checkpoint"],
  },
  {
    name: "Embedding",
    value: "embedding",
    position: 3,
    aliases: ["embedding", "textualinversion"],
  },
  {
    name: "Hypernetwork",
    value: "hypernetwork",
    position: 4,
    aliases: ["hypernetwork"],
  },
  { name: "Wildcard", value: "wildcard", position: 5, aliases: ["wildcard"] },
  {
    name: "Motion",
    value: "motionmodule",
    position: 6,
    aliases: ["motionmodule"],
  },
  {
    name: "Controlnet",
    value: "controlnet",
    position: 7,
    aliases: ["controlnet"],
  },
  { name: "VAE", value: "vae", position: 8, aliases: ["vae"] },
  {
    name: "Wildcards",
    value: "wildcards",
    position: 9,
    aliases: ["wildcards"],
  },
  { name: "Upscaler", value: "upscaler", position: 10, aliases: ["upscaler"] },
  { name: "Other", value: "other", position: 10, aliases: ["other"] },
];

export const DEFAULT_PAGE_TITLE = "AIDE-TOOLS — prompt building platform";

//Example model filer
export const EXAMPLE_MODEL_ID = 727427;
export const EXAMPLE_MODEL_FILTER_CIV = true;
export const EXAMPLE_MODEL_FILTER_LVL = "Mature";

//Temp Civitai duplicates filter (Civ bug)
export const FILTER_CIV_DUPLICATES = true;

//SETTINGS
export const SETTINGS_MODEL_PREVIEW_PER_PAGE = 16;
export const SETTINGS_COLLECTION_PREVIEW_PER_PAGE = 16;
export const SETTINGS_STICKY_SWITCH_HEIGHT = 20;
export const SETTINGS_TIMEOUT_SEC = 10;
export const SETTINGS_RESULT_NUM = 10;
export const SETTINGS_REF_IMAGE_AMOUNT = 12;
export const SETTINGS_REF_IMAGE_ROW_LENGTH = 3;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_DEF = 450;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_SMALL = 450;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM = 450;
export const SETTINGS_IMAGE_PREVIEW_WIDTH_BIG = 450;
export const SETTINGS_IMAGES_SAVED_POSTS_PER_PAGE = 16;
export const SETTINGS_IMAGES_NUMBER_PER_REQUEST = 100;
export const SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE = 12;
export const SETTINGS_SEARCH_RESULT_PER_PAGE = 10;
export const SETTINGS_SEARCH_MIN_QUERY_LENGTH = 3;
export const SETTINGS_SEARCH_QUICK_RESULT_PER_PAGE = 4;
export const SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT = 5;
export const SETTINGS_MODEL_TYPE_DEF = "lora";
export const SETTINGS_MODEL_TYPE_UNKNOWN = "other";
export const SETTINGS_CAROUSEL_IMAGE_HEIGHT = 390;
export const SETTINGS_CAROUSEL_IMAGE_WIDTH = 266;
export const SETTINGS_CAROUSEL_TRANSITION_DURATION = 300;
export const SETTINGS_CAROUSEL_INTERSECTION_MARGIN = 1000;
export const SETTINGS_LOAD_MORE_MARGIN = 600;
export const SETTINGS_LOAD_MORE_MARGIN_MEDIUM = 400;
export const SETTINGS_LOAD_MORE_MARGIN_SMALL = 200;
export const SETTINGS_SCROLL_TOP = 600;
export const SETTINGS_UPLOADING_COMPLETED_AMOUNT = 10;
export const SETTINGS_FORMS_SUBCATEGORIES_MAX_AMOUNT = 8;
export const SETTINGS_NSFW_VALUES_DATA = [
  { name: "PG", value: "None", nsfwLevelIndex: 0 },
  { name: "PG-13", value: "Soft", nsfwLevelIndex: 1 },
  { name: "R", value: "Mature", nsfwLevelIndex: 2 },
  { name: "XXX", value: "X", nsfwLevelIndex: 3 },
];
export const SETTINGS_SFW_RANGE = ["None", "Soft"];
export const SETTINGS_NSFW_RANGE = ["Soft", "Mature", "X"];
export const SETTINGS_PROMPT_DUPLICATE_EXCEPTIONS = ["BREAK", "<BREAK>"];
export const SETTINGS_PROMPT_BREAK_ALIASES = ["BREAK", "<BREAK>"];
export const SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV = false;
export const SETTINGS_SHOW_ALL_DEF_IMAGES = true;
export const SETTINGS_FORCE_UPDATE_POST_DATA = true; // force overwriting of post data
export const SETTINGS_FORCE_HIDDEN_PROMPT_FETCH = true; // force overwriting of post data
// export const SETTINGS_SUPPORTED_FILE_EXTENSIONS = [
//   "safetensors",
//   "pt",
//   "pth",
//   "ckpt",
//   "mp4",
//   "mov",
//   "webm",
// ];

//URLS
export const URL_CIV_MODELS = "https://civitai.com/api/v1/models/";
export const URL_CIV_IMAGES = "https://civitai.com/api/v1/images";
export const URL_CF_UPLOAD_MODEL =
  "https://uploadmodel-o43alvcema-uc.a.run.app";
export const URL_CF_UPDATE_MODEL =
  "https://updatemodel-o43alvcema-uc.a.run.app";

//REGEX
export const REGEX_SPLIT_TAGS = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
export const REGEX_ACTIVATION_TAG = /<[^>]*>/i;
export const REGEX_MOBAL = /iPhone|iPad|iPod|Android/i;

//VALIDATION
export const VALIDATION_CATEGORY_NAME_MAX_LENGTH = 70;
export const VALIDATION_USERNAME_MAX_LENGTH = 100;
export const VALIDATION_NAME_MAX_LENGTH = 300;
export const VALIDATION_TITLE_MAX_LENGTH = 500;
export const VALIDATION_DESCRIPTION_MAX_LENGTH = 100000;
export const VALIDATION_TRIGER_WORDS_MAX_LENGTH = 5000;
export const VALIDATION_ID_MAX_LENGTH = 20;
export const VALIDATION_POST_URL_MAX_LENGTH = 45;
export const VALIDATION_NUMBER_MAX_LENGTH = 5;
export const VALIDATION_EMAIL_MAX_LENGTH = 50;
export const VALIDATION_PASSWORD_MAX_LENGTH = 100;
export const VALIDATION_PASSWORD_MIN_LENGTH = 6;
export const VALIDATION_PASSWORD_SPECIAL_CHARACTERS = /!|@|#|\$|%/;
export const VALIDATION_VALIDATE_PASSWORD_SPECIAL_CHARACTERS = false;
export const VALIDATION_VALIDATE_PASSWORD_LETTER_COMBINATION = true;
export const VALIDATION_VALIDATE_PASSWORD_NUMBER_INCLUSION = false;

//MESSAGES
export const MESSAGE_AGREEMENT =
  "You have to accept our Terms of Service and Privacy Policy";
export const MESSAGE_DELETE_MODEL =
  "Are you sure you want to delete this resource? This action can't be undone";
export const MESSAGE_DELETE_COLLECTION =
  "Are you sure you want to delete this collection? This action can't be undone";

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
export const ERROR_MESSAGE_INVALID_MODEL_ID =
  "Invalid model data. Use only model ID or URL from Civitai";
export const ERROR_MESSAGE_INVALID_POST_ID = "Invalid post ID";
export const ERROR_MESSAGE_NO_IMAGE_SELECTED = "Select at least one image";
export const ERROR_MESSAGE_DB_CONNECTION = "Connection error";
export const ERROR_MESSAGE_UPLOAD_MODEL = "Failed to load model data";
export const ERROR_MESSAGE_CIV_CONNECTION =
  "Failed to conect to Civitai API. There may be heavy load or maintenance at the moment. Try again later.";
export const ERROR_MESSAGE_MODEL_LOAD = "Failed to load model";
export const ERROR_MESSAGE_MODEL_UPDATE = "Failed to load update";

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
export const GUIDE_STEP_PROMPT_BREAK = 12;
export const GUIDE_STEP_PROMPT_DRAG_AND_DROP = 13;
export const GUIDE_STEP_PROMPT_EDIT_TAG = 14;
export const GUIDE_STEP_PROMPT_RESIZE = 15;
export const GUIDE_STEP_PROMPT_COPY = 16;
export const GUIDE_STEP_IMAGE_RESOURCES = 17;
export const GUIDE_STEP_CLOSE_IMAGE = 18;
export const GUIDE_STEP_MODEL_TAGS_EDIT = 19;
export const GUIDE_STEP_MODEL_TAGS_EDIT_FROM = null;
export const GUIDE_STEP_MODEL_TAGS_ADD_TAGSET = null;
export const GUIDE_STEP_MODEL_TAGS_CLOSE = null;
export const GUIDE_STEP_MODEL_ADD_TAGSET = 20;
export const GUIDE_STEP_MODEL_TAGSET = 21;
export const GUIDE_STEP_GENERATED_IMAGES = 22;
export const GUIDE_STEP_IMAGE_MENU = 23;
export const GUIDE_STEP_SAVE_IMAGE = 24;
export const GUIDE_STEP_SAVED_TAB = 25;
export const GUIDE_STEP_MODEL_EDIT = 26;

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
export const ANIMATIONS_FM_FADEIN = { opacity: 1 };
export const ANIMATIONS_FM_FADEIN_INITIAL = { opacity: 0 };
export const ANIMATIONS_FM_ZOOM_IN_INITIAL = { opacity: 0, scale: 0.95 };
export const ANIMATIONS_FM_ZOOM_IN = { opacity: 1, scale: 1 };
export const ANIMATIONS_FM_HOVER_SCALE = { scale: 1.02 };
export const ANIMATIONS_FM_TAP_SCALE = { scale: 0.98 };

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

export const ABOUT_NAV_DATA = [
  {
    id: "about",
    name: "About",
    url: "",
    subNav: [],
  },
  {
    id: "start",
    name: "Start: Adding Models",
    url: "start-adding-models",
    subNav: [],
  },
  {
    id: "category",
    name: "Category edit",
    url: "category-edit",
    subNav: [],
  },
  {
    id: "prompt",
    name: "Working with Prompts",
    url: "working-with-prompts",
    subNav: [
      { name: "Duplicates", id: "dup" },
      { name: "Quick edit", id: "qedit" },
      { name: "Drag & Drop", id: "dnd" },
      { name: "Adding Presets", id: "preset" },
    ],
  },
  {
    id: "model",
    name: "Model Page",
    url: "model-page",
    subNav: [
      { name: "Tag Sets", id: "sets" },
      { name: "Tag Sets Preview", id: "sets-prev" },
      { name: "Generated Images", id: "images" },
    ],
  },
  {
    id: "settings",
    name: "Model Settings",
    url: "model-settings",
    subNav: [
      { name: "General Settings", id: "gsettings" },
      { name: "Version Settings", id: "vsettings" },
    ],
  },
  {
    id: "collection",
    name: "Image collections",
    url: "image-collections",
    subNav: [
      { name: "From a model page", id: "coll-model" },
      { name: "Through the sidebar", id: "coll-sidebar" },
      { name: "Add image by post ID", id: "coll-post" },
      { name: "Collection preview", id: "coll-preview" },
    ],
  },
  {
    id: "top",
    name: "Top Panel",
    url: "top-panel",
    subNav: [
      { name: "Search", id: "search" },
      { name: "Download Queue", id: "queue" },
      { name: "SFW and NSFW Modes", id: "mode" },
    ],
  },
  {
    id: "sidebar",
    name: "Sidebar",
    url: "sidebar",
    subNav: [
      { name: "Adding References", id: "references" },
      { name: "Adding Models", id: "addmodels" },
      { name: "Expanded and Compact View", id: "expanded" },
    ],
  },
];
