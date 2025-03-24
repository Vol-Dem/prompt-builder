/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
// import * as functions from "firebase-functions";
const { onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
// const { pubsub } = require("firebase-functions");
// const { google } = require("googleapis");
// const { GoogleAuth } = require("google-auth-library");
const logger = require("firebase-functions/logger");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");
const { Timestamp } = require("firebase-admin/firestore");
const { onMessagePublished } = require("firebase-functions/v2/pubsub");
// const { request } = require("http");
const { CloudBillingClient } = require("@google-cloud/billing");
// const { sendDiscordBillingMessage } = require("./discord");

initializeApp();

// const billing = google.cloudbilling("v1").projects;
const billing = new CloudBillingClient();
const PROJECT_ID = process.env.GCLOUD_PROJECT;
// const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const MIN_COST_DIF_FOR_ALERT = 1;

// ERROR_MESSAGES
const ERROR_MESSAGE_AUTH = "You must be authorized to perform this action";
const ERROR_MESSAGE_INVALID_ID = "Invalid ID";
const ERROR_MESSAGE_INVALID_DATA = "Invalid data";

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const sendDiscordMessage = async (webhookUrl, data) => {
  // logger.debug("sendDIscordMessage");
  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

const sendDiscordBillingMessage = async (message) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  await sendDiscordMessage(webhookUrl, {
    username: "Firebase Billing",
    content: message,
    avatar_url:
      "https://firebase.google.com/static/images/brand-guidelines/logo-logomark.png",
  });
};

const _isBillingEnabled = async () => {
  try {
    const [res] = await billing.getProjectBillingInfo({
      name: PROJECT_NAME,
    });
    // logger.debug(`Billing INfo: ${res}`);
    logger.debug(`Billing INfo string: ${JSON.stringify(res)}`);
    return res.billingEnabled;
  } catch (err) {
    logger.error(
      `Unable to determine if billing is enabled on specified project, assuming billing is enabled ${err}`
    );
    return false;
  }
};

const _disableBilling = async () => {
  try {
    const billingEnabled = await _isBillingEnabled();
    if (!billingEnabled) return;
    const [res] = await billing.updateProjectBillingInfo({
      name: PROJECT_NAME,
      projectBillingInfo: { billingAccountName: "" }, // Disable billing
      // requestBody: { billingAccountName: "" }, // Disable billing
    });
    // return `Billing disabled: ${JSON.stringify(res)}`;
    logger.debug(`Billing successfully disabled ${JSON.stringify(res)}`);
  } catch (err) {
    logger.error(`Something went wrong while disabling billing: ${err}`);
  }
};

exports.handelBillingAlert = onMessagePublished(
  "projects/aide-tools/topics/billing",
  async (event) => {
    // logger.debug("BilllingA Allert");
    const eventData = event.data.message.json;
    // logger.debug(`eventData: ${JSON.stringify(eventData)}`);
    const billingRef = getDatabase().ref("billing");
    const billingData = (await billingRef.once("value")).val();
    // logger.debug(`Billing data: ${JSON.stringify(billingData)}`);
    let { lastReportedCost, lastReportedIntervalStart } = billingData;
    const budgetExceeded = eventData.costAmount >= eventData.budgetAmount;
    const isNewBillingCycle =
      eventData.costIntervalStart !== lastReportedIntervalStart;
    // logger.debug(`isNewBillingCycle: ${isNewBillingCycle}`);
    if (isNewBillingCycle) lastReportedCost = 0;

    if (
      !budgetExceeded &&
      eventData.costAmount - lastReportedCost < MIN_COST_DIF_FOR_ALERT
    )
      return;

    const promises = [];

    if (budgetExceeded) {
      await getFirestore()
        .collection("application")
        .doc("info")
        .set({ maintenance: true }, { merge: true });
      const billingEnabled = await _isBillingEnabled();
      logger.debug(`Billing is enabled: ${billingEnabled}`);
      promises.push(
        sendDiscordBillingMessage(
          `**ALERT**: 100% of your budget used. Current bill: $${eventData.costAmount} ${eventData.currencyCode}`
        )
      );
      _disableBilling();
    } else {
      const percentageUsed = Math.floor(
        (eventData.costAmount / eventData.budgetAmount) * 100
      );
      promises.push(
        sendDiscordBillingMessage(
          `Current bill $${eventData.costAmount} ${eventData.currencyCode}. \n${percentageUsed}% of your budget`
        )
      );
    }

    promises.push(
      billingRef.update({
        lastReportedCost: eventData.costAmount,
        lastReportedIntervalStart: eventData.costIntervalStart,
      })
    );

    await Promise.all(promises);
  }
);

// exports.getBillingInfo = onRequest(async (request, response) => {
//   try {
//     setCredentialsForBilling();
//     const billingInfo = await billing.getBillingInfo({ name: PROJECT_NAME });
//     console.log("Billin info");
//     console.log(billingInfo);
//     response.send("DONE!!!!");
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// const setCredentialsForBilling = () => {
//   const client = new GoogleAuth({
//     scopes: [
//       "https://googleapis.com/auth/cloud-billing",
//       "https://googleapis.com/auth/cloud-platform",
//     ],
//   });

//   // Set credential globally for all requests
//   google.options({
//     auth: client,
//   });
// };

// const disableBilling = async () => {
//   try {
//     setCredentialsForBilling();
//     if (PROJECT_NAME) {
//       const billingInfo = await billing.getBillingInfo({ name: PROJECT_NAME });
//       if (billingInfo.data.billingEnabled) {
//         const result = billing.updateBillingInfo({
//           name: PROJECT_NAME,
//           requestBody: { billingAccountName: "" },
//         });
//         console.log(JSON.stringify(result));
//       }
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

// const getBillingData = async () => {
//   try {
//     setCredentialsForBilling();
//     const billingInfo = await billing.getBillingInfo({ name: PROJECT_NAME });
//     console.log("Billin info");
//     console.log(billingInfo);
//   } catch (err) {
//     console.error(err.message);
//   }
// };

// exports.reciveBillingNotice = pubsub.topic("billing").onPublish((message) => {
//   try {
//     const data = message.json;
//     handelPubSub(data);
//   } catch (err) {
//     console.error(err.message);
//   }

//   return null;
// });

// const handelPubSub = async (data) => {
//   console.log("Recieved notif");
//   console.log(data);
//   await getBillingData();
// };

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
        ...(Object.hasOwn(imageData, "Model hash") && {
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
  // console.log(versionsData);
  const updatedModelversions = await Promise.all(
    versionsData?.map(async (version) => {
      const versionImagesRequest = await fetch(
        `https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId=${version.id}&username=${username}&nsfw=X&limit=200&sort=Oldest`
      );
      const versionImages = await versionImagesRequest.json();

      const updatedImages = version?.images?.flatMap((image) => {
        const fullImgData = versionImages?.items?.find(
          (verImg) => verImg.hash === image.hash
        );

        if (!fullImgData) return [];

        const transformedImgData = transformImageData(fullImgData || image);

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

// exports.uploadModel = onRequest(
//   {
//     timeoutSeconds: 60,
//     cors: true,
//     // cors: [
//     //   "aide-tools.com",
//     //   "aide-tools.web.app",
//     //   "https://aide-tools.web.app",
//     //   "https://aide-tools.com",
//     //   /aide-tools\.com$/,
//     // ],
//   },
//   async (request, response) => {
//     //   logger.info("Hello logs!", { structuredData: true });
//     //   response.send("Hello from Firebase!");
//     const modelId = request.query?.modelId || request.params[0];

//     // Checking attribute.
//     if (!Number.isFinite(+modelId) || modelId.length === 0) {
//       // Throwing an HttpsError so that the client gets the error details.
//       throw new HttpsError("invalid-argument", "Invalid ID");
//     }
//     // Checking that the user is authenticated.
//     //   if (!request.auth) {
//     //     // Throwing an HttpsError so that the client gets the error details.
//     //     throw new HttpsError(
//     //       "failed-precondition",
//     //       "The function must be " + "called while authenticated."
//     //     );
//     //   }

//     const responseCiv = await fetch(
//       `https://civitai.com/api/v1/models/${modelId}`
//     );

//     const responseData = await responseCiv.json();

//     if (!responseCiv.ok) {
//       throw new HttpsError(`Error status (${responseData})`);
//     }
//     //   response.send(`Model name: ${responseData?.name}`);
//     // Push the new message into Firestore using the Firebase Admin SDK.
//     if (responseData?.id) {
//       await getFirestore()
//         .collection("models")
//         .doc(`${responseData?.id}`)
//         .set({ ...responseData, updatedAt: Timestamp.now().toMillis() });

//       response.send({ modelId: responseData?.id, message: "Upload complete" });
//     } else {
//       throw new HttpsError(`Missing ID`);
//     }

//     // Send back a message that we've successfully written the message
//     // response.json({ result: `Message with ID: ${writeResult.id} added.` });

//     // response.send(`Model ${modelId} updated`);
//   }
// );

exports.updateModel = onRequest(
  {
    timeoutSeconds: 60,
    cors: true,
  },
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
          await getFirestore()
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
            await modelDataRef.update({
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
            ...curModelData.modelVersions,
          ].map((version) => {
            const index = responseData?.modelVersions?.find(
              (newVersion) => newVersion?.id === version?.id
            )?.index;
            return {
              ...version,
              index,
            };
          });

          await modelDataRef.update({
            modelVersions: newVersionsWithIndex,
            description: responseData.description,
            updatedAt: timeNow,
          });

          response.send({
            modelId: responseData?.id,
            updated: true,
            message: "Update complete",
          });
          // console.log("NEW VERSION AMOUNT", newVersions?.length);
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
        // response.json({ result: `Message with ID: ${writeResult.id} added.`});

        // response.send(`Model ${modelId} updated`);
      }
    } catch (err) {
      // throw new HttpsError(err);
      return {
        error: err.message,
      };
    }
  }
);

exports.updateModelCall = onCall(
  {
    enforceAppCheck: true, // Reject requests with missing or invalid App Check tokens.
  },
  async (request) => {
    try {
      // const modelId = request.query?.modelId || request.params[0];
      const modelId = request?.data?.id;

      const uid = request?.auth?.uid;

      if (!uid) {
        throw new HttpsError("unauthenticated", ERROR_MESSAGE_AUTH);
      }
      // const name = request.auth.token.name || null;
      // const picture = request.auth.token.picture || null;
      // const email = request.auth.token.email || null;

      // Checking attribute.
      if (!Number.isFinite(+modelId) || modelId.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new HttpsError("invalid-argument", ERROR_MESSAGE_INVALID_ID);
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

        if (responseData.error) {
          throw new HttpsError("internal", responseData.error);
        }
        // if (!responseCiv.ok) {
        //   throw new HttpsError(`Error status (${responseData})`);
        // }
        //   response.send(`Model name: ${responseData?.name}`);
        // Push the new message into Firestore using the Firebase Admin SDK.
        if (responseData?.id) {
          await getFirestore()
            .collection("models")
            .doc(`${responseData?.id}`)
            .set({ ...responseData, updatedAt: Timestamp.now().toMillis() });

          saveVersionImages(
            modelId,
            responseData?.creator?.username,
            responseData.modelVersions
          );

          return {
            modelId: responseData?.id,
            modelData: responseData,
            message: "Upload complete",
          };
        } else {
          throw new HttpsError("unavailable", ERROR_MESSAGE_INVALID_DATA);
        }
      } else {
        const curModelData = modelDataDoc.data();
        const timeNow = Timestamp.now().toMillis();

        if (timeNow - curModelData.updatedAt < updateDelayMs) {
          return {
            modelId: modelId,
            updated: false,
            message: "Already up to date",
          };
        }

        const responseCiv = await fetch(
          `https://civitai.com/api/v1/models/${modelId}`
        );

        const responseData = await responseCiv.json();

        if (responseData.error) {
          throw new HttpsError("internal", responseData.error);
        }
        // if (!responseCiv.ok) {
        //   throw new HttpsError(`Error status (${responseData})`);
        // }
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
            await modelDataRef.update({
              updatedAt: timeNow,
            });

            return {
              modelId: responseData?.id,
              updated: true,
              message: "No new versions found",
            };
          }

          const newVersionsWithIndex = [
            ...newVersions,
            ...curModelData.modelVersions,
          ].map((version) => {
            const index = responseData?.modelVersions?.find(
              (newVersion) => newVersion?.id === version?.id
            )?.index;
            return {
              ...version,
              index,
            };
          });

          await modelDataRef.update({
            modelVersions: newVersionsWithIndex,
            description: responseData.description,
            updatedAt: timeNow,
          });

          saveVersionImages(
            modelId,
            responseData?.creator?.username,
            newVersions
          );

          return {
            modelId: responseData?.id,
            updated: true,
            message: "Update complete",
          };
          // console.log("NEW VERSION AMOUNT", newVersions?.length);

          // return;
        } else {
          throw new HttpsError("unavailable", ERROR_MESSAGE_INVALID_DATA);
        }

        // Send back a message that we've successfully written the message
        // response.json({ result: `Message with ID: ${writeResult.id} added.`});

        // response.send(`Model ${modelId} updated`);
      }
    } catch (err) {
      // throw new HttpsError(err.message);
      return {
        error: err.message,
      };
    }
  }
);

exports.updateModelCallDev = onCall(async (request) => {
  try {
    // const modelId = request.query?.modelId || request.params[0];
    const modelId = request?.data?.id;

    const uid = request?.auth?.uid;

    if (!uid) {
      return {
        modelId: modelId,
        message: "Auth error",
      };
    }
    // const name = request.auth.token.name || null;
    // const picture = request.auth.token.picture || null;
    // const email = request.auth.token.email || null;

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

    const modelDataRef = getFirestore().collection("models").doc(`${modelId}`);

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
        await getFirestore()
          .collection("models")
          .doc(`${responseData?.id}`)
          .set({ ...responseData, updatedAt: Timestamp.now().toMillis() });

        saveVersionImages(
          modelId,
          responseData?.creator?.username,
          responseData.modelVersions
        );

        return {
          modelId: responseData?.id,
          modelData: responseData,
          message: "Upload complete",
        };
      } else {
        throw new HttpsError(`Missing ID`);
      }
    } else {
      const curModelData = modelDataDoc.data();
      const timeNow = Timestamp.now().toMillis();

      if (timeNow - curModelData.updatedAt < updateDelayMs) {
        return {
          modelId: modelId,
          updated: false,
          message: "Already up to date",
        };
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
          await modelDataRef.update({
            updatedAt: timeNow,
          });

          return {
            modelId: responseData?.id,
            updated: true,
            message: "No new versions found",
          };
        }

        const newVersionsWithIndex = [
          ...newVersions,
          ...curModelData.modelVersions,
        ].map((version) => {
          const index = responseData?.modelVersions?.find(
            (newVersion) => newVersion?.id === version?.id
          )?.index;
          return {
            ...version,
            index,
          };
        });

        await modelDataRef.update({
          modelVersions: newVersionsWithIndex,
          description: responseData.description,
          updatedAt: timeNow,
        });

        saveVersionImages(
          modelId,
          responseData?.creator?.username,
          newVersions
        );

        return {
          modelId: responseData?.id,
          updated: true,
          message: "Update complete",
        };
        // console.log("NEW VERSION AMOUNT", newVersions?.length);

        // return;
      } else {
        throw new HttpsError(`Missing ID`);
      }

      // Send back a message that we've successfully written the message
      // response.json({ result: `Message with ID: ${writeResult.id} added.`});

      // response.send(`Model ${modelId} updated`);
    }
  } catch (err) {
    // throw new HttpsError(err.message);
    return {
      error: err.message,
    };
  }
});

exports.getGeonamesCountries = onRequest(
  {
    timeoutSeconds: 20,
    cors: true,
  },
  async (request, response) => {
    try {
      const responseGeo = await fetch(
        `http://api.geonames.org/countryInfoJSON?username=unstogeo`
      );

      const responseData = await responseGeo.json();

      response.send(responseData);
    } catch (err) {
      return {
        error: err.message,
      };
    }
  }
);
exports.getGeonamesCities = onRequest(
  {
    timeoutSeconds: 20,
    cors: true,
  },
  async (request, response) => {
    try {
      const countryCode = request.query?.country || request.params[0];
      const maxRows = request.query?.maxRows || request.params[1];

      const responseGeo = await fetch(
        `http://api.geonames.org/searchJSON?country=${countryCode}&featureClass=P&maxRows=${maxRows}&username=unstogeo`
      );

      const responseData = await responseGeo.json();

      response.send(responseData);
    } catch (err) {
      return {
        error: err.message,
      };
    }
  }
);
