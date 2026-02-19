"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGE_INVALID_DATA = exports.ERROR_MESSAGE_INVALID_ID = exports.ERROR_MESSAGE_AUTH = exports.MIN_COST_DIF_FOR_ALERT = exports.PROJECT_NAME = exports.PROJECT_ID = void 0;
exports.PROJECT_ID = process.env.GCLOUD_PROJECT;
exports.PROJECT_NAME = "projects/".concat(exports.PROJECT_ID);
exports.MIN_COST_DIF_FOR_ALERT = 1;
// ERROR MESSAGES
exports.ERROR_MESSAGE_AUTH = "You must be authorized to perform this action";
exports.ERROR_MESSAGE_INVALID_ID = "Invalid ID";
exports.ERROR_MESSAGE_INVALID_DATA = "Invalid data";
