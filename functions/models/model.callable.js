import { onCall } from "firebase-functions/v2/https";

import { updateModelHandler } from "./model.handler.js";

/**
 * Fetches or updates a Civitai model and stores it in Firestore.
 *
 * Callable: `updateModelCall`
 * Security:
 * - Requires Firebase Authentication
 * - Requires App Check
 *
 * Request:
 * @param {Object} data
 * @param {string|number} data.id - Civitai model ID
 *
 * Success response:
 * @returns {{ modelId: number, updated?: boolean, modelData?: Object, message: string }}
 *
 * Error response:
 * @returns {{ error: string }}
 *
 * Side effects:
 * - Fetches model data from Civitai API
 * - Creates or updates `models/{modelId}`
 * - Fetches and stores default images
 * - Enforces update cooldown (5 minutes)
 *
 * Errors:
 * - unauthenticated → User not logged in
 * - invalid-argument → Invalid model ID
 * - internal → Civitai API failure
 */
export const updateModelCall = onCall(
  {
    enforceAppCheck: true, // Reject requests with missing or invalid App Check tokens.
  },
  updateModelHandler,
);

/**
 * Development version of updateModelCall.
 *
 * Differences:
 * - Does NOT enforce App Check
 * - Used for local development and testing
 */
export const updateModelCallDev = onCall(updateModelHandler);
