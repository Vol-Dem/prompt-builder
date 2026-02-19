import { Timestamp } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { fetchModel } from "../integrations/civitai";
import { saveVersionImages } from "./model.images";
import {
  ERROR_MESSAGE_AUTH,
  ERROR_MESSAGE_INVALID_DATA,
  ERROR_MESSAGE_INVALID_ID,
} from "../variables/constants";
import { CivitaiModelDoc } from "../shared/types/firestore";
import type {
  UpdateModelRequest,
  UpdateModelResponse,
} from "../shared/types/api";

/**
 * Core handler for fetching and updating Civitai models.
 *
 * Responsibilities:
 * - Validates authentication and input
 * - Fetches model data from Civitai
 * - Creates new model documents if missing
 * - Detects new versions
 * - Updates Firestore accordingly
 * - Fetches and stores version images
 *
 * Update rules:
 * - Models are only refreshed every 5 minutes
 * - Only new versions trigger image downloads
 */
export const updateModelHandler = async (
  request: CallableRequest<UpdateModelRequest>,
): Promise<UpdateModelResponse> => {
  try {
    const modelId = request.data?.id;
    const uid = request.auth?.uid;

    if (!uid) {
      throw new HttpsError("unauthenticated", ERROR_MESSAGE_AUTH);
    }

    if (!modelId || !Number.isFinite(+modelId)) {
      throw new HttpsError("invalid-argument", ERROR_MESSAGE_INVALID_ID);
    }

    const modelDataRef = getFirestore()
      .collection("models")
      .doc(modelId + "");
    const modelDataDoc = await modelDataRef.get();
    const updateDelayMs = 5 * 60 * 1000;

    if (!modelDataDoc.exists) {
      const modelDataCiv = await fetchModel(modelId);

      if (!modelDataCiv?.id) {
        throw new HttpsError("unavailable", ERROR_MESSAGE_INVALID_DATA);
      }

      await modelDataRef.set({
        ...modelDataCiv,
        updatedAt: Timestamp.now().toMillis(),
      });

      await saveVersionImages(
        modelId,
        modelDataCiv.creator?.username,
        modelDataCiv.modelVersions,
      );

      return {
        modelId: modelDataCiv.id,
        modelData: modelDataCiv,
        message: "Upload complete",
      };
    }

    const curModelData = modelDataDoc.data()! as CivitaiModelDoc;
    const timeNow = Timestamp.now().toMillis();

    if (timeNow - curModelData.updatedAt < updateDelayMs) {
      return {
        modelId: Number(modelId),
        modelData: curModelData,
        updated: false,
        message: "Already up to date",
      };
    }

    const modelDataCiv = await fetchModel(modelId);

    if (!modelDataCiv?.id) {
      throw new HttpsError("unavailable", ERROR_MESSAGE_INVALID_DATA);
    }

    const newVersions = modelDataCiv.modelVersions.filter(
      (version) =>
        !curModelData.modelVersions?.some((old) => version.id === old.id),
    );

    if (!newVersions.length) {
      await modelDataRef.update({ updatedAt: timeNow });

      return {
        modelId: modelDataCiv.id,
        modelData: curModelData,
        updated: true,
        message: "No new versions found",
      };
    }

    const newVersionsWithIndex = [
      ...newVersions,
      ...curModelData.modelVersions,
    ].map((version) => {
      const index =
        modelDataCiv.modelVersions.find((v) => v.id === version.id)?.index ?? 0;

      return { ...version, index };
    });

    await modelDataRef.update({
      modelVersions: newVersionsWithIndex,
      description: modelDataCiv.description,
      updatedAt: timeNow,
    });

    await saveVersionImages(
      modelId,
      modelDataCiv.creator?.username,
      newVersions,
    );

    return {
      modelId: modelDataCiv.id,
      modelData: { ...modelDataCiv, modelVersions: newVersionsWithIndex },
      updated: true,
      message: "Update complete",
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

// export const updateModel = onRequest(
//   {
//     timeoutSeconds: 60,
//     cors: true,
//   },
//   async (request, response) => {
//     try {
//       const modelId = request.query?.modelId || request.params[0];

//       if (!Number.isFinite(+modelId) || modelId.length === 0) {
//         throw new HttpsError("invalid-argument", "Invalid ID");
//       }
//       // Checking that the user is authenticated.
//       //   if (!request.auth) {
//       //     // Throwing an HttpsError so that the client gets the error details.
//       //     throw new HttpsError(
//       //       "failed-precondition",
//       //       "The function must be " + "called while authenticated."
//       //     );
//       //   }

//       const modelDataRef = getFirestore()
//         .collection("models")
//         .doc(`${modelId}`);

//       const modelDataDoc = await modelDataRef.get();
//       const updateDelayMs = 5 * 60 * 1000;

//       if (!modelDataDoc.exists) {
//         const responseCiv = await fetch(
//           `https://civitai.com/api/v1/models/${modelId}`,
//         );

//         const responseData = await responseCiv.json();

//         if (!responseCiv.ok) {
//           throw new HttpsError(`Error status (${responseData})`);
//         }

//         if (responseData?.id) {
//           await getFirestore()
//             .collection("models")
//             .doc(`${responseData?.id}`)
//             .set({ ...responseData, updatedAt: Timestamp.now().toMillis() });

//           response.send({
//             modelId: responseData?.id,
//             message: "Upload complete",
//           });

//           saveVersionImages(
//             modelId,
//             responseData?.creator?.username,
//             responseData.modelVersions,
//           );
//           return;
//         } else {
//           throw new HttpsError(`Missing ID`);
//         }
//       } else {
//         const curModelData = modelDataDoc.data();
//         const timeNow = Timestamp.now().toMillis();

//         if (timeNow - curModelData.updatedAt < updateDelayMs) {
//           response.send({
//             modelId: modelId,
//             updated: false,
//             message: "Already up to date",
//           });
//           return;
//         }

//         const responseCiv = await fetch(
//           `https://civitai.com/api/v1/models/${modelId}`,
//         );

//         const responseData = await responseCiv.json();

//         if (!responseCiv.ok) {
//           throw new HttpsError(`Error status (${responseData})`);
//         }

//         if (responseData?.id) {
//           const newVersions = responseData.modelVersions.filter(
//             (version) =>
//               !curModelData.modelVersions?.some(
//                 (oldVersions) => version?.id === oldVersions?.id,
//               ),
//           );

//           if (!newVersions?.length) {
//             await modelDataRef.update({
//               updatedAt: timeNow,
//             });

//             response.send({
//               modelId: responseData?.id,
//               updated: true,
//               message: "No new versions found",
//             });
//             return;
//           }

//           const newVersionsWithIndex = [
//             ...newVersions,
//             ...curModelData.modelVersions,
//           ].map((version) => {
//             const index = responseData?.modelVersions?.find(
//               (newVersion) => newVersion?.id === version?.id,
//             )?.index;
//             return {
//               ...version,
//               index,
//             };
//           });

//           await modelDataRef.update({
//             modelVersions: newVersionsWithIndex,
//             description: responseData.description,
//             updatedAt: timeNow,
//           });

//           response.send({
//             modelId: responseData?.id,
//             updated: true,
//             message: "Update complete",
//           });

//           saveVersionImages(
//             modelId,
//             responseData?.creator?.username,
//             newVersions,
//           );
//           return;
//         } else {
//           throw new HttpsError(`Missing ID`);
//         }

//       }
//     } catch (err) {
//       return {
//         error: err.message,
//       };
//     }
//   },
// );
