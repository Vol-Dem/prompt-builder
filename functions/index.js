/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { Timestamp } = require("firebase-admin/firestore");

initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const clearObjectKeys = (obj) => {
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

const transformImageData = (imageData) => {
  const newImageData = {
    ...(imageData?.id && { id: imageData?.id }),
    ...(imageData?.postId && { postId: imageData?.postId }),
    url: imageData?.url || "",
    ...(imageData?.createdAt && { createdAt: imageData?.createdAt }),
    nsfw: imageData?.nsfw || false,
    ...(imageData?.hash && { hash: imageData?.hash }),
    ...(imageData?.browsingLevel && {
      browsingLevel: imageData?.browsingLevel,
    }),
    ...(imageData?.nsfwLevel && { nsfwLevel: imageData?.nsfwLevel }),
    ...(imageData?.meta && {
      meta: {
        ...(imageData?.meta?.ADetailerconfidence && {
          ADetailerconfidence: imageData?.meta?.ADetailerconfidence,
        }),
        ...(imageData?.meta?.ADetailerdenoisingstrength && {
          ADetailerdenoisingstrength:
            imageData?.meta?.ADetailerdenoisingstrength,
        }),
        ...(imageData?.meta?.ADetailerdilateerode && {
          ADetailerdilateerode: imageData?.meta?.ADetailerdilateerode,
        }),
        ...(imageData?.meta?.ADetailerinpaintonlymasked && {
          ADetailerinpaintonlymasked:
            imageData?.meta?.ADetailerinpaintonlymasked,
        }),
        ...(imageData?.meta?.ADetailerinpaintpadding && {
          ADetailerinpaintpadding: imageData?.meta?.ADetailerinpaintpadding,
        }),
        ...(imageData?.meta?.ADetailermaskblur && {
          ADetailermaskblur: imageData?.meta?.ADetailermaskblur,
        }),
        ...(imageData?.meta?.ADetailermaskmaxratio && {
          ADetailermaskmaxratio: imageData?.meta?.ADetailermaskmaxratio,
        }),
        ...(imageData?.meta?.ADetailermaskminratio && {
          ADetailermaskminratio: imageData?.meta?.ADetailermaskminratio,
        }),
        ...(imageData?.meta?.ADetailermodel && {
          ADetailermodel: imageData?.meta?.ADetailermodel,
        }),
        ...(imageData?.meta?.ADetailerversion && {
          ADetailerversion: imageData?.meta?.ADetailerversion,
        }),
        ...(imageData?.meta?.cfgScale && {
          cfgScale: imageData?.meta?.cfgScale,
        }),
        ...(imageData?.meta?.Hiresupscaler && {
          Hiresupscaler: imageData?.meta?.Hiresupscaler,
        }),
        ...(imageData?.meta?.clipSkip && {
          clipSkip: imageData?.meta?.clipSkip,
        }),
        ...(imageData?.meta?.Modelhash && {
          Modelhash: imageData?.meta?.Modelhash,
        }),
        ...(imageData?.meta?.hasOwnProperty("Model hash") && {
          "Model hash": imageData?.meta["Model hash"],
        }),
        ...(imageData?.meta?.Version && { Version: imageData?.meta?.Version }),
        ...(imageData?.meta?.Model && { Model: imageData?.meta?.Model }),
        ...(imageData?.meta?.Denoisingstrength && {
          Denoisingstrength: imageData?.meta?.Denoisingstrength,
        }),
        ...(imageData?.meta?.prompt && { prompt: imageData?.meta?.prompt }),
        ...(imageData?.meta?.hashes && {
          hashes: clearObjectKeys(imageData?.meta?.hashes),
        }),
        ...(imageData?.meta?.steps && { steps: imageData?.meta?.steps }),
        ...(imageData?.meta?.seed && { seed: imageData?.meta?.seed }),
        ...(imageData?.meta?.TIhashes && {
          TIhashes: imageData?.meta?.TIhashes,
        }),
        ...(imageData?.meta?.sampler && { sampler: imageData?.meta?.sampler }),
        ...(imageData?.meta?.Hiresupscale && {
          Hiresupscale: imageData?.meta?.Hiresupscale,
        }),
        ...(imageData?.meta?.VAE && { VAE: imageData?.meta?.VAE }),
        ...(imageData?.meta?.negativePrompt && {
          negativePrompt: imageData?.meta?.negativePrompt,
        }),
        ...(imageData?.meta?.Scheduletype && {
          Scheduletype: imageData?.meta?.Scheduletype,
        }),
        ...(imageData?.meta?.Size && { Size: imageData?.meta?.Size }),
        ...(imageData?.meta?.resources && {
          resources: imageData?.meta?.resources,
        }),
        ...(imageData?.meta?.civitaiResources && {
          civitaiResources: imageData?.meta?.civitaiResources,
        }),
        ...(imageData?.meta?.additionalResources && {
          additionalResources: imageData?.meta?.additionalResources,
        }),
      },
    }),
    height: imageData?.height || "",
    width: imageData?.width || "",
  };

  return newImageData;
};

const saveVersionImages = async (modelId, username, versionsData) => {
  console.log(versionsData);
  const updatedModelversions = await Promise.all(
    versionsData?.map(async (version) => {
      const versionImagesRequest = await fetch(
        `https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId=${version.id}&username=${username}&nsfw=X`
      );
      const versionImages = await versionImagesRequest.json();

      const updatedImages = version?.images?.map((image) => {
        const fullImgData =
          versionImages?.items?.find((verImg) => verImg.hash === image.hash) ||
          image;
        const transformedImgData = transformImageData(fullImgData);

        // if (fullImgData?.meta) {
        //   fullImgData.meta.comfy = "";
        //   fullImgData.meta = clearObjectKeys(fullImgData.meta);
        //   if (fullImgData.meta?.hashes)
        //     fullImgData.meta.hashes = clearObjectKeys(fullImgData.meta.hashes);
        // }
        return { ...image, ...transformedImgData };
      });

      //   const modelImagesRef = doc(
      //     firestore,
      //     "models",
      //     modelId + "",
      //     "defaultImages",
      //     version.id + ""
      //   );
      const modelDataRef = getFirestore()
        .collection("models")
        .doc(`${modelId}`)
        .collection("defaultImages")
        .doc(`${version.id}`);

      const nsfw = [...new Set(updatedImages.map((image) => image.nsfw))];

      modelDataRef.set({
        items: updatedImages.filter(Boolean),
        versionId: versionsData[0]?.id || null,
        default: true,
        createdAt: updatedImages[0]?.createdAt || null,
        savedAt: Timestamp.now().toMillis(),
        nsfw: updatedImages[0]?.nsfw || false,
        nsfwTypes: nsfw,
        nsfwLevel: updatedImages[0]?.nsfwLevel || null,
      });

      //   await setDoc(
      //     modelImagesRef,
      //     {
      //       items: updatedImages.filter(Boolean),
      //       versionId: versionsData[0]?.id || null,
      //       default: true,
      //       createdAt: updatedImages[0]?.createdAt || null,
      //       savedAt: Timestamp.now().toMillis(),
      //       nsfw: updatedImages[0]?.nsfw || false,
      //       nsfwTypes: nsfw,
      //       nsfwLevel: updatedImages[0]?.nsfwLevel || null,
      //     },
      //     { merge: true }
      //   );

      //   return {
      //     images: updatedImages.filter(Boolean),
      //   };
    })
  );

  return updatedModelversions;
};

exports.uploadModel = onRequest(
  { timeoutSeconds: 120 },
  async (request, response) => {
    //   logger.info("Hello logs!", { structuredData: true });
    //   response.send("Hello from Firebase!");
    const modelId = request.query?.modelId || request.params[0];

    // Checking attribute.
    if (!Number.isFinite(+modelId) || modelId.length === 0) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new HttpsError("invalid-argument", "Invalid ID");
    }
    // Checking that the user is authenticated.
    //   if (!request.auth) {
    //     // Throwing an HttpsError so that the client gets the error details.
    //     throw new HttpsError(
    //       "failed-precondition",
    //       "The function must be " + "called while authenticated."
    //     );
    //   }

    const responseCiv = await fetch(
      `https://civitai.com/api/v1/models/${modelId}`
    );

    const responseData = await responseCiv.json();

    if (!responseCiv.ok) {
      throw new HttpsError(`Error status (${responseData})`);
    }
    //   response.send(`Model name: ${responseData?.name}`);
    // Push the new message into Firestore using the Firebase Admin SDK.
    if (responseData?.id) {
      const writeResult = await getFirestore()
        .collection("models")
        .doc(`${responseData?.id}`)
        .set({ ...responseData, updatedAt: Timestamp.now().toMillis() });

      response.send({ modelId: responseData?.id, message: "Upload complete" });
    } else {
      throw new HttpsError(`Missing ID`);
    }

    // Send back a message that we've successfully written the message
    // response.json({ result: `Message with ID: ${writeResult.id} added.` });

    // response.send(`Model ${modelId} updated`);
  }
);

exports.updateModel = onRequest(
  { timeoutSeconds: 120 },
  async (request, response) => {
    try {
      const modelId = request.query?.modelId || request.params[0];

      // Checking attribute.
      if (!Number.isFinite(+modelId) || modelId.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new HttpsError("invalid-argument", "Invalid ID");
      }
      // Checking that the user is authenticated.
      //   if (!request.auth) {
      //     // Throwing an HttpsError so that the client gets the error details.
      //     throw new HttpsError(
      //       "failed-precondition",
      //       "The function must be " + "called while authenticated."
      //     );
      //   }

      const modelDataRef = getFirestore()
        .collection("models")
        .doc(`${modelId}`);

      const modelDataDoc = await modelDataRef.get();
      const updateDelayMs = 5 * 60 * 1000;

      if (!modelDataDoc.exists) {
        const responseCiv = await fetch(
          `https://civitai.com/api/v1/models/${modelId}`
        );

        const responseData = await responseCiv.json();

        if (!responseCiv.ok) {
          throw new HttpsError(`Error status (${responseData})`);
        }
        //   response.send(`Model name: ${responseData?.name}`);
        // Push the new message into Firestore using the Firebase Admin SDK.
        if (responseData?.id) {
          const writeResult = await getFirestore()
            .collection("models")
            .doc(`${responseData?.id}`)
            .set({ ...responseData, updatedAt: Timestamp.now().toMillis() });

          response.send({
            modelId: responseData?.id,
            message: "Upload complete",
          });

          saveVersionImages(
            modelId,
            responseData?.creator?.username,
            responseData.modelVersions
          );
          return;
        } else {
          throw new HttpsError(`Missing ID`);
        }
      } else {
        const curModelData = modelDataDoc.data();
        const timeNow = Timestamp.now().toMillis();

        if (timeNow - curModelData.updatedAt < updateDelayMs) {
          response.send({
            modelId: modelId,
            updated: false,
            message: "Already up to date",
          });
          return;
        }

        const responseCiv = await fetch(
          `https://civitai.com/api/v1/models/${modelId}`
        );

        const responseData = await responseCiv.json();

        if (!responseCiv.ok) {
          throw new HttpsError(`Error status (${responseData})`);
        }
        //   response.send(`Model name: ${responseData?.name}`);
        // Push the new message into Firestore using the Firebase Admin SDK.
        if (responseData?.id) {
          const newVersions = responseData.modelVersions.filter(
            (version) =>
              !curModelData.modelVersions?.some(
                (oldVersions) => version?.id === oldVersions?.id
              )
          );

          if (!newVersions?.length) {
            const writeResult = await modelDataRef.update({
              updatedAt: timeNow,
            });

            response.send({
              modelId: responseData?.id,
              updated: true,
              message: "No new versions found",
            });
            return;
          }

          const newVersionsWithIndex = [
            ...newVersions,
            ...curModelData?.modelVersions,
          ].map((version) => {
            const index = responseData?.modelVersions?.find(
              (newVersion) => newVersion?.id === version?.id
            )?.index;
            return {
              ...version,
              index,
            };
          });

          const writeResult = await modelDataRef.update({
            modelVersions: newVersionsWithIndex,
            description: responseData.description,
            updatedAt: timeNow,
          });

          response.send({
            modelId: responseData?.id,
            updated: true,
            message: "Update complete",
          });
          console.log("NEW VERSION AMOUNT", newVersions?.length);
          saveVersionImages(
            modelId,
            responseData?.creator?.username,
            newVersions
          );
          return;
        } else {
          throw new HttpsError(`Missing ID`);
        }

        // Send back a message that we've successfully written the message
        // response.json({ result: `Message with ID: ${writeResult.id} added.` });

        // response.send(`Model ${modelId} updated`);
      }
    } catch (err) {
      throw new HttpsError(err.message);
    }
  }
);
