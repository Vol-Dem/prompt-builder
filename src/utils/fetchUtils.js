export const getModelInfo = async (resourcesData) => {
  try {
    const response = await fetch(
      `https://civitai.com/api/v1/model-versions/by-hash/${resourcesData["Model hash"]}`
    );
    const data = await response.json();

    console.log(data);
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
  console.log(updatedResources);
  return updatedResources;
};
