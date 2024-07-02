import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getFirestore,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  addDelayPromise,
  clearObjectKeys,
  transformImageData,
  transformModelData,
} from "./generalUtils";
import firebaseApp from "../firebase-config";
import { getAuth } from "firebase/auth";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const delayTime = 4000;

export const makeBatchRequest = async (
  data,
  fetchFunc,
  concurrencyLimit = 5,
  returnResult = true,
  delay = 500
) => {
  try {
    let result = [];
    const queue = data.slice();
    // const concurrencyLimit = 5;
    // console.log(queue);
    const processQueue = async () => {
      while (queue.length > 0) {
        const curBatch = [];
        for (let i = 0; i < concurrencyLimit && queue.length > 0; i++) {
          const curElement = queue.shift();
          curBatch.push(curElement);
        }
        await addDelayPromise(delay);

        const batchResults = await fetchFunc(curBatch);
        // console.log(batchResults);
        // console.log(queue);
        if (returnResult) result = [...result, ...batchResults];
      }
    };
    // console.log("END");
    await processQueue();
    return result;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const getImagesInfo = async (images) => {
  try {
    const examplesDataWithRes = await Promise.all(
      images.map(async (item) => {
        const updatedImgData = { ...item };
        const newMeta = item?.meta && (await getModelInfo(item.meta));
        // console.log(newMeta);
        if (newMeta) updatedImgData.meta = newMeta;

        if (item.meta?.resources) {
          const updatedRes = await makeBatchRequest(
            item.meta.resources,
            addResourcesInfo
          );
          console.log(updatedRes);
          if (!updatedRes) {
            throw new Error("failed to update res");
          }
          updatedImgData.meta = {
            ...updatedImgData.meta,
            resources: updatedRes,
          };
        }
        if (item.meta?.civitaiResources) {
          const updatedCivRes = await makeBatchRequest(
            item.meta.civitaiResources,
            addResourcesInfo
          );
          console.log(updatedCivRes);
          if (!updatedCivRes) {
            throw new Error("failed to update res");
          }
          updatedImgData.meta = {
            ...updatedImgData.meta,
            civitaiResources: updatedCivRes,
          };
        }
        console.log(updatedImgData);
        return await updatedImgData;
      })
    );
    return examplesDataWithRes;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const getImageInfo = async (image) => {
  try {
    const updatedImgData = { ...image };
    // const newMeta = image?.meta && (await getModelInfo(image.meta));
    // // console.log(newMeta);
    // if (newMeta) updatedImgData.meta = newMeta;

    if (image.meta?.resources) {
      const updatedRes = await makeBatchRequest(
        image.meta.resources,
        addResourcesInfo
      );
      console.log(updatedRes);
      if (!updatedRes) {
        throw new Error("failed to update res");
      }
      updatedImgData.meta = {
        ...updatedImgData.meta,
        resources: updatedRes,
      };
    }
    if (image.meta?.civitaiResources) {
      const updatedCivRes = await makeBatchRequest(
        image.meta.civitaiResources,
        addResourcesInfo
      );
      console.log(updatedCivRes);
      if (!updatedCivRes) {
        throw new Error("failed to update res");
      }
      updatedImgData.meta = {
        ...updatedImgData.meta,
        civitaiResources: updatedCivRes,
      };
    }
    if (image.meta?.additionalResources) {
      const updatedCivRes = await makeBatchRequest(
        image.meta.additionalResources,
        addResourcesInfo
      );
      console.log(updatedCivRes);
      if (!updatedCivRes) {
        throw new Error("failed to update res");
      }
      updatedImgData.meta = {
        ...updatedImgData.meta,
        additionalResources: updatedCivRes,
      };
    }
    if (image.meta?.hashes) {
      const hashes = { ...image.meta?.hashes, vae: null };
      const hashesData = Object.values(hashes)
        .filter(Boolean)
        .flatMap((hash) => {
          const isInRes = image.meta?.resources?.find(
            (res) => res.hash === hash
          );
          const isInCivRes = image.meta?.civitaiResources?.find(
            (res) => res.hash === hash
          );
          const isInAddRes = image.meta?.additionalResources?.find(
            (res) => res.hash === hash
          );

          if (!isInRes && !isInCivRes && !isInAddRes) {
            return { hash };
          }
          return [];
        });

      const updatedCivRes = await makeBatchRequest(
        hashesData,
        addResourcesInfo
      );
      console.log(updatedCivRes);
      if (!updatedCivRes) {
        throw new Error("failed to update res");
      }
      updatedImgData.meta = {
        ...updatedImgData.meta,
        hashResources: updatedCivRes,
      };
    }
    // console.log(updatedImgData);
    return await updatedImgData;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const getModelInfo = async (resourcesData) => {
  try {
    console.log(resourcesData);
    let modelHash;
    if (resourcesData?.hasOwnProperty("Model hash")) {
      modelHash = resourcesData["Model hash"];
    } else if (resourcesData?.hasOwnProperty("Modelhash")) {
      modelHash = resourcesData["Modelhash"];
    } else {
      return resourcesData;
    }
    const response = await fetch(
      `https://civitai.com/api/v1/model-versions/by-hash/${modelHash}`
    );
    const data = await response.json();

    // console.log(data);
    if (data?.error) {
      throw new Error(data.error);
    }

    const updatedResources = {
      ...resourcesData,
      modelName: data?.model?.name,
      modelId: data.modelId,
      versionName: data.name,
      versionId: data.id,
    };

    console.log(updatedResources);
    return updatedResources;
  } catch (err) {
    console.log(err.message);
  }
};

export const addResourcesInfo = async (resourcesData) => {
  try {
    const modelsData = await Promise.all(
      resourcesData.map(async (resource) => {
        let url;
        if (resource.modelVersionId) {
          url = `https://civitai.com/api/v1/model-versions/${resource.modelVersionId}`;
        } else if (resource.hash) {
          url = `https://civitai.com/api/v1/model-versions/by-hash/${resource.hash}`;
        } else {
          return new Promise((resolve) => {
            resolve({});
          });
        }

        const response = await fetch(url);
        return await response.json();
      })
    );
    console.log(modelsData);

    const updatedResources = resourcesData.map((resource, i) => {
      return {
        ...resource,
        ...(modelsData[i].model?.name && { name: modelsData[i].model?.name }),
        ...(modelsData[i]?.modelId && { modelId: modelsData[i]?.modelId }),
        ...(modelsData[i]?.name && { versionName: modelsData[i]?.name }),
        ...(modelsData[i]?.id && { versionId: modelsData[i]?.id }),
        ...(modelsData[i]?.model?.type && { type: modelsData[i]?.model?.type }),
      };
    });
    // console.log(updatedResources);
    return updatedResources;
  } catch (err) {
    console.log(err.message);
    throw new Error(err);
  }
};

export const getModelData = async (modelId, curModelVersionsData) => {
  try {
    const response = await fetch(
      `https://civitai.com/api/v1/models/${modelId}`
    );

    const responseData = await response.json();
    console.log(response);

    if (!response.ok) {
      throw new Error(`Error status (${response.status})`);
    }
    console.log(responseData);
    // responseData?.modelVersions?.forEach((version) => {
    //   version.images.forEach((image) => {
    //     if (image?.meta) {
    //       image.meta.comfy = "";
    //       image.meta = clearObjectKeys(image.meta);
    //       if (image.meta?.hashes)
    //         image.meta.hashes = clearObjectKeys(image.meta.hashes);
    //     }
    //   });
    // });
    let newVersions = responseData?.modelVersions;

    if (!!curModelVersionsData) {
      newVersions = responseData?.modelVersions?.filter(
        (version) =>
          !curModelVersionsData.some(
            (oldVersions) => version.id === oldVersions.id
          )
      );
    }

    console.log("NEW", newVersions);

    let updatedModelversions = newVersions;

    // if (responseData?.creator?.username && !!newVersions.length) {
    //   const versionsWithUserName = newVersions?.map((version) => {
    //     return {
    //       ...version,
    //       modelId,
    //       username: responseData.creator.username,
    //     };
    //   });
    //   updatedModelversions = await makeBatchRequest(
    //     versionsWithUserName,
    //     updatedModelVersionsImageData
    //   );
    //   console.log(updatedModelversions);
    // }

    // clear empty keys
    updatedModelversions?.forEach((version) => {
      version.images?.forEach((image) => {
        if (image?.meta) {
          const metaArr = Object.entries(image.meta).filter(
            (entry) => !!entry[0]
          );

          if (metaArr) {
            image.meta = Object.fromEntries(metaArr);
          }
          if (image?.meta?.comfy) {
            image.meta.comfy = "";
          }
        }
      });
    });

    const updatedModelData = {
      ...responseData,
      modelVersions: !curModelVersionsData
        ? updatedModelversions
        : [...updatedModelversions, ...curModelVersionsData],
    };

    console.log(updatedModelData);

    // const modelImages = await fetch(`https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId={versionId}&username=${userName}`)

    // const imagesDataWithRes = await Promise.all(
    //   responseData.modelVersions.map(async (image) => {
    //     const updImg = await makeBatchRequest(image.images, getImagesInfo);
    //     //Temp
    //     image.images = updImg;
    //     return updImg;
    //   })
    // );

    // console.log(imagesDataWithRes);

    return transformModelData(updatedModelData);
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};

const updatedModelVersionsImageData = async (versionsData) => {
  console.log(versionsData);
  const updatedModelversions = await Promise.all(
    versionsData?.map(async (version) => {
      const versionImagesRequest = await fetch(
        `https://civitai.com/api/v1/images?modelId=${version.modelId}&modelVersionId=${version.id}&username=${version.username}&nsfw=X`
      );
      const versionImages = await versionImagesRequest.json();
      console.log(versionImages);
      const updatedImages = version?.images?.map((image) => {
        const fullImgData =
          versionImages?.items?.find((verImg) => verImg.hash === image.hash) ||
          [];
        if (fullImgData?.meta) {
          fullImgData.meta.comfy = "";
          fullImgData.meta = clearObjectKeys(fullImgData.meta);
          if (fullImgData.meta?.hashes)
            fullImgData.meta.hashes = clearObjectKeys(fullImgData.meta.hashes);
        }
        return { ...image, ...fullImgData };
      });
      return {
        ...version,
        username: null,
        images: updatedImages.filter(Boolean),
      };
    })
  );

  return updatedModelversions;
};

export const saveVersionImages = async (versionsData) => {
  console.log(versionsData);
  const updatedModelversions = await Promise.all(
    versionsData?.map(async (version) => {
      const versionImagesRequest = await fetch(
        `https://civitai.com/api/v1/images?modelId=${version.modelId}&modelVersionId=${version.id}&username=${version.username}&nsfw=X`
      );
      const versionImages = await versionImagesRequest.json();
      console.log(versionImages);
      const updatedImages = version?.images?.map((image) => {
        const fullImgData =
          versionImages?.items?.find((verImg) => verImg.hash === image.hash) ||
          [];
        const transformedImgData = transformImageData(fullImgData);
        console.log(fullImgData);
        console.log(transformedImgData);
        // if (fullImgData?.meta) {
        //   fullImgData.meta.comfy = "";
        //   fullImgData.meta = clearObjectKeys(fullImgData.meta);
        //   if (fullImgData.meta?.hashes)
        //     fullImgData.meta.hashes = clearObjectKeys(fullImgData.meta.hashes);
        // }
        return { ...image, ...transformedImgData };
      });

      console.log(versionsData);
      console.log(versionImages);
      console.log(updatedImages);

      const uid = auth.currentUser.uid;

      console.log(uid);
      console.log(versionsData[0].modelId);
      console.log(versionsData[0].id);

      const modelImagesRef = doc(
        firestore,
        "users",
        uid,
        "models",
        versionsData[0].modelId + "",
        "defaultImages",
        version.id + ""
      );

      // await addDelayPromise(delayTime);

      const nsfw = [...new Set(updatedImages.map((image) => image.nsfw))];

      await setDoc(
        modelImagesRef,
        {
          items: updatedImages.filter(Boolean),
          versionId: versionsData[0]?.id || null,
          default: true,
          createdAt: updatedImages[0]?.createdAt || null,
          savedAt: new Date().toISOString(),
          nsfw: updatedImages[0]?.nsfw || false,
          nsfwTypes: nsfw,
          nsfwLevel: updatedImages[0]?.nsfwLevel || null,
        },
        { merge: true }
      );

      return {
        images: updatedImages.filter(Boolean),
      };
    })
  );
  console.log(updatedModelversions);
  return updatedModelversions;
};

// const saveVersionImages = async (
//   modelId,
//   versionData,
//   creatorUsername,
//   uid,
//   delayTime = 500
// ) => {
//   try {
//     const imgExampleResponse = await fetch(
//       `https://civitai.com/api/v1/images?modelId=${modelId}&modelVersionId=${versionData.id}&username=${creatorUsername}&nsfw=X`
//     );

//     const data = await imgExampleResponse.json();

//     const examplesDataWithRes = data.items.sort((a, b) => {
//       return b.createdAt - a.createdAt;
//     });
//     console.log(examplesDataWithRes);
//     examplesDataWithRes.versionId = versionData.id;

//     const modelImagesRef = doc(
//       firestore,
//       "users",
//       uid,
//       "models",
//       modelId + "",
//       "images",
//       "default"
//     );

//     // await addDelayPromise(delayTime);

//     const nsfw = [...new Set(examplesDataWithRes.map((image) => image.nsfw))];

//     await setDoc(
//       modelImagesRef,
//       {
//         items: examplesDataWithRes,
//         versionId: versionData.id,
//         default: true,
//         createdAt: examplesDataWithRes[0].createdAt,
//         savedAt: new Date().toISOString(),
//         nsfw: examplesDataWithRes[0].nsfw,
//         nsfwTypes: nsfw,
//         nsfwLevel: examplesDataWithRes[0]?.nsfwLevel || "",
//       },
//       { merge: true }
//     );
//   } catch (err) {
//     console.log(err.message);
//     console.log(err);
//     throw new Error(err);
//   }
// };

export const deleteModelDoc = async (uid, model) => {
  if (!!model?.savedImages) {
    Object.values(model.savedImages).forEach(async (versionData) => {
      const postsData = versionData.map((post) => {
        return {
          ...post,
          uid,
          modelId: model.id,
          type: "images",
        };
      });
      if (postsData?.length) {
        await makeBatchRequest(postsData, deleteImagePostDoc, 50, false);
      }
      // console.log(postsData);
    });
  }

  const defaultImagePosts = model.data.modelVersions.map((version) => {
    return {
      postId: version.id,
      uid,
      modelId: model.id,
      type: "defaultImages",
    };
  });

  // console.log(defaultImagePosts);

  await makeBatchRequest(defaultImagePosts, deleteImagePostDoc, 50, false);

  const modelRef = doc(firestore, "users", uid, "models", model.id + "");
  const modelPreviewRef = doc(
    firestore,
    "users",
    uid,
    "preview",
    model.id + ""
  );

  await deleteDoc(modelRef);
  await deleteDoc(modelPreviewRef);
};

export const deleteImagePostDoc = async (posts) => {
  const batch = writeBatch(firestore);

  posts.forEach((post) => {
    const imgPostRef = doc(
      firestore,
      "users",
      post.uid,
      "models",
      post.modelId + "",
      post.type,
      post.postId + ""
    );

    batch.delete(imgPostRef);
  });

  // // Commit the batch
  await batch.commit();

  // await Promise.all(
  //   posts.map(async (post) => {
  //     const imgPostRef = doc(
  //       firestore,
  //       "users",
  //       post.uid,
  //       "models",
  //       post.modelId + "",
  //       post.type,
  //       post.postId + ""
  //     );

  //     return await deleteDoc(imgPostRef);
  //   })
  // );
};

export const updateImagePostData = async (
  postInfo,
  imagesData,
  replace = false
) => {
  try {
    const { postId, modelId, versionId, nsfwMode, postData } = postInfo;
    const uid = auth.currentUser.uid;

    console.log(postInfo?.ids);
    console.log(imagesData);

    const modelRef = doc(firestore, "users", uid, "models", modelId + "");
    const modelImagesRef = doc(
      firestore,
      "users",
      uid,
      "models",
      modelId + "",
      "images",
      postId + ""
    );

    const newImgData = {
      postId: +postId,
      amount: imagesData.length,
    };
    console.log("LENGTH");
    console.log(imagesData.length);

    await addDelayPromise(delayTime);

    const batch = writeBatch(firestore);

    const nsfw = [...new Set(imagesData.map((image) => image.nsfw))];
    console.log(imagesData);
    console.log(modelId);
    console.log(postId);
    console.log(versionId);
    batch.set(
      modelImagesRef,
      {
        items: imagesData,
        versionId,
        default: false,
        createdAt: imagesData[0].createdAt,
        savedAt: new Date().toISOString(),
        nsfw: imagesData[0].nsfw,
        nsfwTypes: nsfw,
        nsfwLevel: imagesData[0]?.nsfwLevel || "",
      },
      { merge: true }
    );

    if (postData) {
      batch.update(modelRef, {
        [`savedImages.${versionId}`]: arrayRemove(postData),
      });
    }

    batch.set(
      modelRef,
      {
        savedImages: {
          [`${versionId}`]: arrayUnion(newImgData),
        },
      },
      { merge: true }
    );

    // Commit the batch
    await batch.commit();
  } catch (err) {
    console.log(err.message);
    console.log(err);
    // throw new Error(err);
  }
};
