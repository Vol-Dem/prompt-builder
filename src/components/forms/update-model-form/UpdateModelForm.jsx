import React, { useEffect, useState } from "react";
import classes from "./UpdateModelForm.module.scss";
import { ref, set, get } from "firebase/database";
import { db } from "../../../firebase-config";
import { addResourcesInfo, getModelInfo } from "../../../utils/fetchUtils";

const UpdateModelForm = ({ modelData }) => {
  const [updateInput, setUpdateInput] = useState(false);
  const [filterDisabledInput, setFilterDisabledInput] = useState(false);
  const [singleImageIdSwitch, setSingleImageIdSwitch] = useState(false);
  const [srcInput, setSrcInput] = useState("civitai.com");
  // const [subDataInput, setSubDataInput] = useState("");
  const [idInput, setIdInput] = useState(modelData?.id || "");
  const [mainInput, setMainInput] = useState(modelData?.main || "");
  const [mainTagInput, setMainTagInput] = useState(modelData?.mainTag || "");
  const [weightInput, setWeightInput] = useState(modelData?.weight || "");
  const [sizetInput, setSizeInput] = useState(modelData?.size || "");
  const [helperTagsInput, setHelperTagsInput] = useState(
    modelData?.helperTags || []
  );
  const [negativeTagsInput, setNegativeTagsInput] = useState(
    modelData?.negativeTags || []
  );

  const [subCatAmount, setSubCatAmount] = useState([
    { type: "text", id: 1, name: "sub", placeholder: "sub", value: "" },
  ]);
  const [tagSetsAmount, setTagSetsAmount] = useState([
    [
      {
        type: "text",
        id: "set-name-1",
        name: "set-name",
        placeholder: "set name",
        value: "",
      },
      {
        id: "set-value-1",
        name: "set-value",
        placeholder: "set value",
        value: "",
      },
    ],
  ]);
  const [examplePromtsAmount, setExamplePromtsAmount] = useState([
    [
      {
        type: "text",
        id: "exmpl-post-id",
        name: "example",
        placeholder: "example: post id",
        value: "",
      },
      {
        type: "text",
        id: "exmpl-image-id",
        name: "image-id",
        placeholder: "image id",
        value: "",
      },
    ],
  ]);

  const [versionTagAmount, setVersionTagAmount] = useState([
    {
      type: "text",
      id: "version-1",
      name: "version",
      placeholder: "version tag",
      value: "",
    },
  ]);

  useEffect(() => {
    if (!modelData) return;
    console.log(modelData);
    const subCats = modelData.sub.map((sub, i) => {
      return {
        type: "text",
        id: i,
        name: "sub",
        placeholder: "sub",
        value: sub,
      };
    });
    setSubCatAmount(subCats);
    const versionTag = modelData.sub.map((version, i) => {
      return {
        type: "text",
        id: version.id,
        name: "version-main-tag",
        placeholder: version.name,
        value: version.mainTag,
      };
    });
    setVersionTagAmount(versionTag);
    if (!modelData.tagSetsData) return;
    const tagSets = modelData.tagSetsData.map((tagSet, i) => {
      console.log(tagSet);
      return [
        {
          type: "text",
          id: i + "tname",
          name: "set-name",
          placeholder: "set name",
          value: tagSet.name,
        },
        {
          id: i + "tval",
          name: "set-value",
          placeholder: "set value",
          value: tagSet.value,
        },
      ];
    });
    setTagSetsAmount(tagSets);
  }, [modelData]);

  const addGeneralTagsHandler = (e) => {
    e.preventDefault();

    const formdata = new FormData(e.target);
    const src = formdata.get("src").trim().toLowerCase();
    // const modelId = +formdata.get("id").trim().toLowerCase();
    // const main = formdata.get("main").trim().toLowerCase();
    const modelId = +formdata.get("id").trim().toLowerCase().trim();
    const main = formdata.get("main").trim().toLowerCase().trim();
    const subData = formdata.getAll("sub").filter(Boolean);
    const sub = subData.map((el) => el.trim());
    const mainTag = formdata.get("main-tag").trim();
    const weight = formdata.get("weight").trim();
    const size = formdata.get("size").trim();
    const tagSetNames = formdata.getAll("set-name");
    const tagSetsValues = formdata.getAll("set-value");

    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;

    const tagSetsData = tagSetNames.flatMap((setName, i) => {
      if (!setName && !tagSetsValues[i]) return [];
      return [{ name: setName, value: tagSetsValues[i] }];
    });

    const helperTags = formdata
      .get("helper-tags")
      .trim()
      .split(splitRegEx)
      .filter(Boolean)
      .map((tag) => tag.trim());
    const negativeTags = formdata
      .get("negative-tags")
      .trim()
      .split(splitRegEx)
      .filter(Boolean)
      .map((tag) => tag.trim());
    const exemplePromts = formdata.getAll("example").filter(Boolean);
    // const exemplePromts = formdata.getAll("example");
    const exemplePromtsImageId = formdata.getAll("image-id").filter(Boolean);

    const exampleInputData = exemplePromts.flatMap((postId, i) => {
      if (!postId && !exemplePromtsImageId[i]) return [];
      return [{ postId: postId, imageId: exemplePromtsImageId[i] }];
    });

    const clearObjectKeys = (obj) => {
      const convertedMetaArr = Object.entries(obj).map((entry, i) => {
        const newKey = entry[0]
          ? entry[0].replace(/[^\w\s]/gi, " ")
          : `key${i}`;
        return [newKey, entry[1]];
      });
      return Object.fromEntries(convertedMetaArr);
    };

    // const addResourcesInfo = async (resourcesData) => {
    //   const modelsData = await Promise.all(
    //     resourcesData.map(async (resource) => {
    //       let url;
    //       if (resource.modelVersionId) {
    //         url = `https://civitai.com/api/v1/model-versions/${resource.modelVersionId}`;
    //       } else if (resource.hash) {
    //         url = `https://civitai.com/api/v1/model-versions/by-hash/${resource.hash}`;
    //       } else {
    //         return new Promise((resolve) => {
    //           resolve({});
    //         });
    //       }

    //       const response = await fetch(url);
    //       return await response.json();
    //     })
    //   );
    //   console.log(modelsData);

    //   const updatedResources = resourcesData.map((resource, i) => {
    //     return {
    //       ...resource,
    //       ...(modelsData[i].model?.name && { name: modelsData[i].model?.name }),
    //       ...(modelsData[i]?.modelId && { modelId: modelsData[i]?.modelId }),
    //       ...(modelsData[i]?.name && { versionName: modelsData[i]?.name }),
    //       ...(modelsData[i]?.id && { versionId: modelsData[i]?.id }),
    //     };
    //   });
    //   console.log(updatedResources);
    //   return updatedResources;
    // };

    const getModelData = async () => {
      try {
        let data = {};

        if (!modelData || updateInput) {
          const response = await fetch(
            `https://civitai.com/api/v1/models/${modelData?.id || modelId}`
          );

          data = await response.json();
          console.log(response);
          console.log(data);

          data.modelVersions.forEach((version) => {
            version.images.forEach((image) => {
              if (image.meta) {
                image.meta = clearObjectKeys(image.meta);
                if (image.meta.hashes)
                  image.meta.hashes = clearObjectKeys(image.meta.hashes);
              }
            });
          });

          const examplesDataWithRes = await Promise.all(
            data.modelVersions.map(async (image) => {
              return await Promise.all(
                image.images.map(async (item) => {
                  const updatedImgData = { ...item };
                  if (item.meta?.hasOwnProperty("Model hash")) {
                    const newMeta = await getModelInfo(item.meta);
                    if (newMeta) updatedImgData.meta = newMeta;
                  }
                  if (item.meta?.resources) {
                    updatedImgData.meta.resources = await addResourcesInfo(
                      item.meta.resources
                    );
                  }
                  if (item.meta?.civitaiResources) {
                    updatedImgData.meta.civitaiResources =
                      await addResourcesInfo(item.meta.civitaiResources);
                  }
                  console.log(updatedImgData);
                  return await updatedImgData;
                })
              );
            })
          );
          console.log(data);
        } else {
          data = modelData.data;
        }

        if (!data.id) return;

        let examplesData = [];
        if (exemplePromts.length) {
          examplesData = await Promise.all(
            exemplePromts.map(async (example) => {
              const imgExampleResponse = await fetch(
                `https://civitai.com/api/v1/images?postId=${example}${
                  !filterDisabledInput
                    ? `&modelId=${modelData?.id || modelId}`
                    : ""
                }`
              );
              return await imgExampleResponse.json();
            })
          );
          console.log(examplesData);
          examplesData.forEach((post) => {
            post.items.forEach((image) => {
              if (image.meta) {
                image.meta = clearObjectKeys(image.meta);
                if (image.meta.hashes)
                  image.meta.hashes = clearObjectKeys(image.meta.hashes);
              }
            });
          });
        }

        const examplesDataFiltered = examplesData.map((images, i) => {
          const hasSingleImg = !!exemplePromtsImageId.length;
          return !hasSingleImg
            ? images
            : {
                items: images.items.filter((image) => {
                  // return image.id === +exampleInputData[i].imageId;
                  return exemplePromtsImageId.some((img) => +img === image.id);
                }),
              };
        });
        console.log(examplesDataFiltered);

        const examplesDataCleaned = examplesDataFiltered.filter(
          (images, i) => images.items.length
        );

        const examplesTransformed = examplesDataCleaned.map(
          (image) => image.items
        );

        const examplesDataWithRes = await Promise.all(
          examplesTransformed.map(async (image) => {
            return {
              items: await Promise.all(
                image.map(async (item) => {
                  const updatedImgData = { ...item };
                  if (item.meta?.hasOwnProperty("Model hash")) {
                    const newMeta = await getModelInfo(item.meta);
                    if (newMeta) updatedImgData.meta = newMeta;
                  }
                  if (item.meta?.resources) {
                    updatedImgData.meta.resources = await addResourcesInfo(
                      item.meta.resources
                    );
                  }
                  if (item.meta?.civitaiResources) {
                    updatedImgData.meta.civitaiResources =
                      await addResourcesInfo(item.meta.civitaiResources);
                  }
                  console.log(updatedImgData);
                  return await updatedImgData;
                })
              ),
            };
          })
        );
        console.log(examplesDataWithRes);

        const previewImg = data.modelVersions[0].images.filter(
          (img) => img.type === "image"
        )[0].url;

        const modelExemplePromts = modelData?.exemplePromts || [];
        const modelExamplesData = modelData?.examplesData || [];

        const loraData = {
          id: modelData?.id || modelId,
          src,
          main: modelData?.main || main,
          sub: sub,
          mainTag,
          tagSetsData,
          weight,
          size,
          helperTags,
          negativeTags,
          exemplePromts: [...exemplePromts, ...modelExemplePromts],
          data,
          examplesData: [...examplesDataWithRes, ...modelExamplesData],
          updatedAt: new Date().toISOString(),
        };
        console.log(filterDisabledInput);
        console.log(loraData);

        const loraPrevData = {
          id: modelData?.id || modelId,
          src,
          main: modelData?.main || main,
          sub: sub,
          title: data.name,
          imgUrl: previewImg,
          type: data.type,
          baseModel: data.modelVersions[0].baseModel,
          mainTag,
          weight,
          size,
          tags: data.modelVersions[0].trainedWords || "",
          tagSetsData,
          helperTags,
          updatedAt: new Date().toISOString(),
        };

        const modelsRef = ref(db, "models/" + (modelData?.id || modelId));
        const modelsPrevRef = ref(
          db,
          "models preview/" + (modelData?.main || main)
        );

        get(modelsRef).then((snapshot) => {
          if (snapshot.exists()) {
            if (!modelData) return;
            set(modelsRef, loraData);
            savePreview(modelsPrevRef, loraPrevData, modelId);
          } else {
            set(modelsRef, loraData);
            savePreview(modelsPrevRef, loraPrevData, modelId);
          }
        });
      } catch (err) {
        console.log(err);
      }
    };

    getModelData();
  };

  const savePreview = (modelsPrevRef, loraPrevData, modelId) => {
    get(modelsPrevRef).then((snapshot) => {
      if (snapshot.exists()) {
        const curData = snapshot.val();
        const curPrevIndex = curData.findIndex((prev) => prev.id === modelId);
        console.log(curPrevIndex);
        console.log(loraPrevData);

        if (curPrevIndex !== -1) {
          curData[curPrevIndex] = { ...curData[curPrevIndex], loraPrevData };
          set(modelsPrevRef, [...curData]);
        } else {
          set(modelsPrevRef, [...curData, loraPrevData]);
        }
      } else {
        set(modelsPrevRef, [loraPrevData]);
      }
    });
  };

  const addSubHandler = () => {
    const newFields = [...subCatAmount];
    newFields.push({
      type: "text",
      id: Date.now(),
      name: "sub",
      placeholder: "sub",
    });

    setSubCatAmount(newFields);
  };

  const addtagSetHandler = () => {
    const newFields = [...tagSetsAmount];
    newFields.push([
      {
        type: "text",
        id: Date.now(),
        name: "set-name",
        placeholder: "set name",
        value: "",
      },
      {
        type: "text",
        id: `${Date.now() + "val"}`,
        name: "set-value",
        placeholder: "set value",
        value: "",
      },
    ]);
    console.log(newFields);
    setTagSetsAmount(newFields);
  };

  const addExampleInputHandler = () => {
    const newFields = [...examplePromtsAmount];
    newFields.push([
      {
        id: Date.now(),
        name: "example",
        placeholder: "example",
        cols: "30",
        rows: "10",
      },
      {
        id: `${Date.now() + "imid"}`,
        name: "image-id",
        placeholder: "image id",
        cols: "30",
        rows: "10",
      },
    ]);

    setExamplePromtsAmount(newFields);
  };

  const subCatHtml = subCatAmount.map((sub) => {
    return (
      <input
        key={sub.id}
        name={sub.name}
        type={sub.type}
        placeholder={sub.placeholder}
        defaultValue={sub.value}
      />
    );
  });
  const tagSetsHtml = tagSetsAmount.map((tagSet) => {
    return (
      <div key={tagSet[0].id}>
        <input
          name={tagSet[0].name}
          type={tagSet[0].type}
          placeholder={tagSet[0].placeholder}
          defaultValue={tagSet[0].value}
        />
        <textarea
          name={tagSet[1].name}
          id=""
          cols="30"
          rows="5"
          placeholder={tagSet[1].placeholder}
          defaultValue={tagSet[1].value}
          // onChange={(e) => {
          //   setHelperTagsInput(e.target.value);
          // }}
        ></textarea>
      </div>
    );
  });

  let exemplePromtsHtml = examplePromtsAmount.map((example) => {
    return (
      <div className={classes["example-field"]} key={example[0].id}>
        <input
          name={example[0].name}
          type={example[0].type}
          placeholder={example[0].placeholder}
        ></input>
        <input
          name={example[1].name}
          type={example[1].type}
          placeholder={example[1].placeholder}
        ></input>
      </div>
    );
  });

  //   const srcHandler = (e) => {
  //     setSrcInput(e.target.value);
  //   };

  return (
    <form onSubmit={addGeneralTagsHandler} className={classes["form"]}>
      <label htmlFor="update">
        <input
          id="update"
          type="checkbox"
          value={updateInput}
          onChange={(e) => {
            setUpdateInput(e.target.checked);
          }}
        />
        update
      </label>
      <input
        name="src"
        type="text"
        placeholder="src"
        // value="civitai.com"
        value={srcInput}
        onChange={(e) => {
          setSrcInput(e.target.value);
        }}
        // readOnly
      />
      <input
        name="id"
        type="number"
        placeholder="id"
        value={idInput}
        onChange={(e) => {
          setIdInput(e.target.value);
        }}
        readOnly={!!modelData}
      />
      <input
        name="main"
        type="text"
        placeholder="main"
        value={mainInput}
        onChange={(e) => {
          setMainInput(e.target.value);
        }}
        readOnly={!!modelData}
      />
      {subCatHtml}
      <button type="button" id="sub" onClick={addSubHandler}>
        Add sub
      </button>
      <input
        name="main-tag"
        type="text"
        placeholder="main-tag"
        value={mainTagInput}
        onChange={(e) => {
          setMainTagInput(e.target.value);
        }}
      />
      <input
        name="weight"
        type="text"
        placeholder="weight"
        value={weightInput}
        onChange={(e) => {
          setWeightInput(e.target.value);
        }}
      />
      <input
        name="size"
        type="text"
        placeholder="size"
        value={sizetInput}
        onChange={(e) => {
          setSizeInput(e.target.value);
        }}
      />
      {tagSetsHtml}
      <button type="button" onClick={addtagSetHandler}>
        Add tag set
      </button>
      <textarea
        name="helper-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="helper tags"
        value={helperTagsInput}
        onChange={(e) => {
          setHelperTagsInput(e.target.value);
        }}
      ></textarea>
      <textarea
        name="negative-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="negative tags"
        value={negativeTagsInput}
        onChange={(e) => {
          setNegativeTagsInput(e.target.value);
        }}
      ></textarea>
      {exemplePromtsHtml}
      <div className={classes.filter}>
        <input
          id="filter"
          type="checkbox"
          onChange={(e) => {
            setFilterDisabledInput(e.target.checked);
          }}
        />
        <label htmlFor="filter">disable filter</label>
      </div>
      <div className={classes.filter}>
        <input
          id="single"
          type="checkbox"
          onChange={(e) => {
            setSingleImageIdSwitch(e.target.checked);
          }}
        />
        <label htmlFor="filter">single image</label>
      </div>
      <button type="button" id="example" onClick={addExampleInputHandler}>
        Add example
      </button>
      <button type="submit">Add</button>
    </form>
  );
};

export default UpdateModelForm;
