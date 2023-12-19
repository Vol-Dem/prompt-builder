import React, { useEffect, useState } from "react";
import classes from "./CheckpointForm.module.scss";
import { ref, set, get } from "firebase/database";
import { db } from "../../../firebase-config";
import { addResourcesInfo, getModelInfo } from "../../../utils/fetchUtils";

const CheckpointForm = ({ modelData }) => {
  const [updateInput, setUpdateInput] = useState(false);
  const [srcInput, setSrcInput] = useState("civitai.com");
  const [idInput, setIdInput] = useState(modelData?.id || "");
  const [mainInput, setMainInput] = useState(modelData?.main || "");
  const [vaeInput, setVaeInput] = useState(modelData?.vae || "");
  const [denoisingStrengthtInput, setDenoisingStrengthInput] = useState(
    modelData?.denoisingStrength || ""
  );
  const [hiresUpscaleInput, setHiresUpscaleInput] = useState(
    modelData?.hiresUpscale || ""
  );
  const [hiresUpscalerInput, setHiresUpscalerInput] = useState(
    modelData?.hiresUpscaler || ""
  );
  const [cfgScaleInput, setCfgScaleInput] = useState(modelData?.cfgScale || "");
  const [samplerInput, setSamplerInput] = useState(modelData?.sampler || "");
  const [stepsInput, setStepsInput] = useState(modelData?.steps || "");
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
  const [examplePromtsAmount, setExamplePromtsAmount] = useState([
    {
      type: "text",
      id: 1,
      name: "example",
      placeholder: "example: post id",
      value: "",
    },
  ]);

  useEffect(() => {
    if (!modelData) return;
    const subCats = modelData?.sub?.map((sub, i) => {
      return {
        type: "text",
        id: i,
        name: "sub",
        placeholder: "sub",
        value: sub,
      };
    });
    setSubCatAmount(subCats);
  }, [modelData]);

  const addGeneralTagsHandler = (e) => {
    e.preventDefault();

    const formdata = new FormData(e.target);
    const src = formdata.get("src").trim().toLowerCase();
    const modelId = +formdata.get("id").trim().toLowerCase();
    const main = formdata.get("main").trim().toLowerCase();
    const sampler = formdata.get("sampler").trim().toLowerCase();
    const cfgScale = formdata.get("cfgScale").trim().toLowerCase();
    const hiresUpscaler = formdata.get("hiresUpscaler").trim().toLowerCase();
    const hiresUpscale = formdata.get("hiresUpscale").trim().toLowerCase();
    const denoisingStrength = formdata
      .get("denoisingStrength")
      .trim()
      .toLowerCase();
    const vae = formdata.get("vae").trim().toLowerCase();
    const subData = formdata.getAll("sub").filter(Boolean);
    const sub = subData.map((el) => el.trim());
    const steps = formdata.get("steps").trim();
    const weight = formdata.get("weight").trim();
    const size = formdata.get("size").trim();

    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
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

    const clearObjectKeys = (obj) => {
      const convertedMetaArr = Object.entries(obj).map((entry, i) => {
        const newKey = entry[0]
          ? entry[0].replace(/[^\w\s]/gi, " ")
          : `key${i}`;
        return [newKey, entry[1]];
      });
      return Object.fromEntries(convertedMetaArr);
    };

    const getModelData = async () => {
      try {
        let data = {};

        if (updateInput || !modelData) {
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
        } else if (!updateInput && modelData) {
          data = modelData.data;
        }

        if (!data.id) return;

        let examplesData = [];
        if (exemplePromts.length) {
          examplesData = await Promise.all(
            exemplePromts.map(async (example) => {
              const imgExampleResponse = await fetch(
                `https://civitai.com/api/v1/images?postId=${example}&modelId=${
                  modelData?.id || modelId
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
                  updatedImgData.meta.civitaiResources = await addResourcesInfo(
                    item.meta.civitaiResources
                  );
                }
                console.log(updatedImgData);
                return await updatedImgData;
              })
            );
          })
        );

        console.log(examplesData);
        const previewImg =
          data?.modelVersions[0]?.images?.filter(
            (img) => img.type === "image"
          )[0]?.url || "";

        const modelExemplePromts = modelData?.exemplePromts || [];
        const modelExamplesData =
          modelData?.examplesData?.filter(Boolean) || [];
        console.log(modelExemplePromts);
        console.log(modelExamplesData);
        const loraData = {
          id: modelData?.id || modelId,
          src,
          main: modelData?.main || main,
          sub: sub,
          steps,
          weight,
          size,
          sampler,
          cfgScale,
          hiresUpscaler,
          hiresUpscale,
          denoisingStrength,
          vae,
          helperTags,
          negativeTags,
          exemplePromts: [...exemplePromts, ...modelExemplePromts],
          data,
          examplesData: [...examplesData, ...modelExamplesData],
          updatedAt: new Date().toISOString(),
        };

        console.log(loraData);

        const loraPrevData = {
          id: modelData?.id || modelId,
          src,
          main,
          sub,
          title: data.name,
          imgUrl: previewImg,
          type: data.type,
          baseModel: data.modelVersions[0].baseModel,
          steps,
          weight,
          size,
          tags: data.modelVersions[0].trainedWords || "",
          helperTags,
          updatedAt: new Date().toISOString(),
        };

        const modelsRef = ref(db, "models/" + modelId);
        const modelsPrevRef = ref(db, "checkpoint preview/" + main);

        // get(modelsPrevRef).then((snapshot) => {
        //   if (snapshot.exists()) {
        //     const curData = snapshot.val();

        //     const curPrevIndex = curData.findIndex(
        //       (prev) => prev?.id === modelData?.id
        //     );
        //     console.log(curPrevIndex);
        //     console.log(loraPrevData);
        //     if (curPrevIndex !== -1) {
        //       curData[curPrevIndex] = loraPrevData;
        //       set(modelsPrevRef, [...curData]);
        //     } else {
        //       set(modelsPrevRef, [...curData, loraPrevData]);
        //     }
        //   } else {
        //     set(modelsPrevRef, [loraPrevData]);
        //   }
        // });
        // set(modelsRef, loraData);

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
        console.log(curData[curPrevIndex]);

        if (curPrevIndex !== -1) {
          curData[curPrevIndex] = { ...curData[curPrevIndex], ...loraPrevData };
          set(modelsPrevRef, [...curData]);
        } else {
          set(modelsPrevRef, [...curData, loraPrevData]);
        }
      } else {
        set(modelsPrevRef, [loraPrevData]);
      }
    });
  };

  const addSubHandler = (e) => {
    const elId = e.target.id;
    if (elId === "sub") {
      const newFields = [...subCatAmount];
      newFields.push({
        type: "text",
        id: Date.now(),
        name: "sub",
        placeholder: "sub",
      });
      setSubCatAmount(newFields);
    }
    if (elId === "example") {
      const newFields = [...examplePromtsAmount];
      newFields.push({
        id: Date.now(),
        name: "example",
        placeholder: "example",
        cols: "30",
        rows: "10",
      });

      setExamplePromtsAmount(newFields);
    }
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

  let exemplePromtsHtml = examplePromtsAmount.map((example) => {
    return (
      <input
        key={example.id}
        name={example.name}
        type={example.type}
        placeholder={example.placeholder}
      ></input>
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
      />
      <input
        name="main"
        type="text"
        placeholder="main"
        value={mainInput}
        onChange={(e) => {
          setMainInput(e.target.value);
        }}
      />
      {subCatHtml}
      <button type="button" id="sub" onClick={addSubHandler}>
        Add sub
      </button>
      <input
        name="steps"
        type="text"
        placeholder="steps"
        value={stepsInput}
        onChange={(e) => {
          setStepsInput(e.target.value);
        }}
      />
      <input
        name="sampler"
        type="text"
        placeholder="sampler"
        value={samplerInput}
        onChange={(e) => {
          setSamplerInput(e.target.value);
        }}
      />
      <input
        name="cfgScale"
        type="text"
        placeholder="CFGScale"
        value={cfgScaleInput}
        onChange={(e) => {
          setCfgScaleInput(e.target.value);
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
      <input
        name="hiresUpscaler"
        type="text"
        placeholder="Hires upscaler"
        value={hiresUpscalerInput}
        onChange={(e) => {
          setHiresUpscalerInput(e.target.value);
        }}
      />
      <input
        name="hiresUpscale"
        type="text"
        placeholder="Hires upscale"
        value={hiresUpscaleInput}
        onChange={(e) => {
          setHiresUpscaleInput(e.target.value);
        }}
      />
      <input
        name="denoisingStrength"
        type="text"
        placeholder="Denoising strength"
        value={denoisingStrengthtInput}
        onChange={(e) => {
          setDenoisingStrengthInput(e.target.value);
        }}
      />
      <input
        name="vae"
        type="text"
        placeholder="VAE"
        value={vaeInput}
        onChange={(e) => {
          setVaeInput(e.target.value);
        }}
      />
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
      <button type="button" id="example" onClick={addSubHandler}>
        Add example
      </button>
      <button type="submit">Add</button>
    </form>
  );
};

export default CheckpointForm;
