import { addDelayPromise, clearObjectKeys } from "./generalUtils";

export const makeBatchRequest = async (
  data,
  fetchFunc,
  concurrencyLimit = 5,
  returnResult = true,
  delay
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
        // console.log(updatedImgData);
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
    if (resourcesData.hasOwnProperty("Model hash")) {
      modelHash = resourcesData["Model hash"];
    } else if (resourcesData.hasOwnProperty("Modelhash")) {
      modelHash = resourcesData["Modelhash"];
    } else {
      return;
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

    // console.log(updatedResources);
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
      };
    });
    // console.log(updatedResources);
    return updatedResources;
  } catch (err) {
    console.log(err.message);
    throw new Error(err);
  }
};

export const getModelData = async (modelId) => {
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
    responseData?.modelVersions?.forEach((version) => {
      version.images.forEach((image) => {
        if (image.meta) {
          image.meta.comfy = "";
          image.meta = clearObjectKeys(image.meta);
          if (image.meta.hashes)
            image.meta.hashes = clearObjectKeys(image.meta.hashes);
        }
      });
    });

    // const imagesDataWithRes = await Promise.all(
    //   responseData.modelVersions.map(async (image) => {
    //     const updImg = await makeBatchRequest(image.images, getImagesInfo);
    //     //Temp
    //     image.images = updImg;
    //     return updImg;
    //   })
    // );

    // console.log(imagesDataWithRes);

    return responseData;
  } catch (err) {
    // console.log(err);
    throw new Error(err);
  }
};
