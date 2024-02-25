import React, { useEffect, useState } from "react";
import classes from "./UpdateModelForm.module.scss";
import { ref, set, get } from "firebase/database";
import { db } from "../../../firebase-config";
import {
  addResourcesInfo,
  getImagesInfo,
  getModelInfo,
  makeBatchRequest,
} from "../../../utils/fetchUtils";
import { clearObjectKeys } from "../../../utils/generalUtils";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";

const firestore = getFirestore(firebaseApp);

const UpdateModelForm = ({ modelData, formType = "model" }) => {
  const [updateInput, setUpdateInput] = useState(false);
  const [filterDisabledInput, setFilterDisabledInput] = useState(false);
  const [singleImageIdSwitch, setSingleImageIdSwitch] = useState(false);
  const [modelIsSaving, setModelIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [srcInput, setSrcInput] = useState("civitai.com");
  // const [subDataInput, setSubDataInput] = useState("");
  const [idInput, setIdInput] = useState(modelData?.id || "");
  const [mainInput, setMainInput] = useState(modelData?.main || "");
  const [mainTagInput, setMainTagInput] = useState(modelData?.mainTag || "");
  const [fileNameInput, setFileNameInput] = useState(modelData?.fileName || "");
  const [weightInput, setWeightInput] = useState(modelData?.weight || "");
  const [sizetInput, setSizeInput] = useState(modelData?.size || "");
  const [versionsDownloadStatus, setVersionsDownloadStatus] = useState([]);
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

  const uid = useSelector((state) => state.auth.user.uid);
  const categories = useSelector((state) => state.tabs.categoriesData);

  useEffect(() => {
    if (!modelData) return;
    const versionStatusInputData = modelData.data.modelVersions.map(
      (version, i) => {
        if (modelData?.modelVersionsCustomData.hasOwnProperty(version.id)) {
          const versionsCustomData =
            modelData?.modelVersionsCustomData[version.id];
          return {
            type: "checkbox",
            id: versionsCustomData.versionId + "in",
            name: versionsCustomData.versionName,
            label: versionsCustomData.versionName,
            value: versionsCustomData.downloadStatus,
          };
        } else {
          return {
            type: "checkbox",
            id: version.id + "in",
            name: version.id,
            label: version.name,
            value: false,
          };
        }
      }
    );

    setVersionsDownloadStatus(versionStatusInputData || []);
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
    // setModelIsSaving(true);
    seteErrorMessage("");
    seteSuccessMessage("");
    const formdata = new FormData(e.target);

    const formObj = {};
    for (const [key, value] of formdata) {
      formObj[key] = value;
    }
    console.log(formObj);
    // return;
    const src = formdata.get("src").trim().toLowerCase();
    const modelId = +formdata.get("id").trim().toLowerCase().trim();
    const main = formdata.get("main").trim().toLowerCase().trim();
    const subData = formdata.getAll("sub").filter(Boolean);
    const sub = subData.map((el) => el.trim());
    const mainTag = formdata.get("main-tag").trim();
    const weight = formdata.get("weight").trim();
    const size = formdata.get("size").trim();
    const fileName = formdata.get("file-name").trim();
    const tagSetNames = formdata.getAll("set-name");
    const tagSetsValues = formdata.getAll("set-value");
    const sampler = formdata.get("sampler")?.trim().toLowerCase();
    const cfgScale = formdata.get("cfgScale")?.trim().toLowerCase();
    const hiresUpscaler = formdata.get("hiresUpscaler")?.trim().toLowerCase();
    const hiresUpscale = formdata.get("hiresUpscale")?.trim().toLowerCase();
    const denoisingStrength = formdata
      .get("denoisingStrength")
      ?.trim()
      .toLowerCase();
    const vae = formdata.get("vae")?.trim().toLowerCase();
    const steps = formdata.get("steps")?.trim();

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

    const getModelData = async () => {
      try {
        let data = {};
        let versionsStatus = [];

        if (!modelData || updateInput) {
          const response = await fetch(
            `https://civitai.com/api/v1/models/${modelData?.id || modelId}`
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
                // image.meta.comfy = "";
                image.meta = clearObjectKeys(image.meta);
                if (image.meta.hashes)
                  image.meta.hashes = clearObjectKeys(image.meta.hashes);
              }
            });
          });

          const imagesDataWithRes = await Promise.all(
            responseData.modelVersions.map(async (image) => {
              // const updImg = await getImagesInfo(image.images);
              const updImg = await makeBatchRequest(image.images);
              //Temp
              image.images = updImg;
              return updImg;
            })
          );

          data = responseData;

          console.log(data);
          console.log(imagesDataWithRes);
        } else {
          data = modelData.data;
        }
        if (modelData && updateInput) {
          console.log(modelData, data);
          const newVerison = data.modelVersions.filter(
            (version) =>
              !modelData.data.modelVersions.some(
                (oldVersions) => version.id === oldVersions.id
              )
          );
          data.modelVersions = [...newVerison, ...modelData.data.modelVersions];
          console.log(data.modelVersions);
        }
        // return;
        if (!data.id) return;

        let modelVersionsCustomData = modelData?.modelVersionsCustomData || {};

        if (true) {
          console.log(versionsDownloadStatus);
          data.modelVersions.forEach((version, i) => {
            const isSingle = data.modelVersions.length === 1;
            const curVersionDlStatus = versionsDownloadStatus.find(
              (dlData) => Number.parseInt(dlData.id) === version.id
            )?.value;
            const dlStatus = versionsDownloadStatus.length
              ? !!curVersionDlStatus
              : false;
            const currVersionData = modelVersionsCustomData.hasOwnProperty(
              version.id
            )
              ? modelVersionsCustomData[version.id]
              : {};
            // console.log(
            //   modelVersionsCustomData.hasOwnProperty(version.id),
            //   currVersionData
            // );
            console.log(version.id, dlStatus, isSingle);
            modelVersionsCustomData = {
              ...modelVersionsCustomData,
              [version.id]: {
                versionId: version.id,
                versionName: version.name,
                versionImageUrl:
                  version.images?.filter((img, i) => img.type === "image")[0]
                    ?.url || "",
                ...currVersionData,
                downloadStatus: isSingle ? true : dlStatus,
              },
            };
          });
        } else {
          // data.modelVersions.forEach((version, i) => {
          //   const isSingle = data.modelVersions.length === 1;
          //   const dlStatus = versionsDownloadStatus.length
          //     ? !!versionsDownloadStatus[i]?.value
          //     : false;
          //   modelVersionsCustomData[version.id] = {
          //     ...modelVersionsCustomData[version.id],
          //     versionId: version.id,
          //     versionName: version.name,
          //     versionImageUrl:
          //       version.images?.filter((img, i) => img.type === "image")[0]
          //         ?.url || "",
          //     downloadStatus: versionsDownloadStatus.length
          //       ? dlStatus
          //       : isSingle,
          //   };
          // });
        }
        console.log(modelVersionsCustomData);

        const activePreviewId = Object.values(modelVersionsCustomData).find(
          (version) => version.downloadStatus === true
        )?.versionId;
        console.log(activePreviewId);
        const activePreviewImg =
          (activePreviewId &&
            data.modelVersions
              ?.find((version) => version.id === activePreviewId)
              .images?.filter((img, i) => img.type === "image")[0]?.url) ||
          "";

        const previewImgDefault =
          data.modelVersions[0].images?.filter(
            (img, i) => img.type === "image"
          )[0]?.url || "";

        const previewImg = activePreviewImg || previewImgDefault;
        // console.log(previewImg);

        let modelInfo = {
          ...modelData,
          id: modelData?.id || modelId,
          src,
          main: modelData?.main || main,
          sub: sub,
          mainTag,
          fileName,
          tagSetsData,
          weight,
          size,
          helperTags,
          negativeTags,
          data,
          modelVersionsCustomData,
          updatedAt: new Date().toISOString(),
        };

        if (formType === "Checkpoint") {
          modelInfo = {
            ...modelInfo,
            steps,
            sampler,
            cfgScale,
            hiresUpscaler,
            hiresUpscale,
            denoisingStrength,
            vae,
          };
        }

        // console.log(filterDisabledInput);
        console.log(modelInfo);
        // console.log("CUSTDATA", modelData.modelVersionsCustomData);

        const loraPrevData = {
          id: modelData?.id || modelId,
          src,
          main: modelData?.main || main,
          sub: sub,
          title: data.name,
          imgUrl: previewImg || "",
          type: data.type,
          baseModel: data.modelVersions[0].baseModel,
          mainTag,
          fileName,
          weight,
          size,
          tags: data.modelVersions[0].trainedWords || "",
          tagSetsData,
          helperTags,
          modelVersionsCustomData,
          updatedAt: new Date().toISOString(),
          createdAt: modelData?.downloadedAt || Date.now(),
        };

        const mdID = modelData?.id || modelId;

        const modelsRef = doc(firestore, "users", uid, "models", mdID + "");
        const userRef = doc(firestore, "users", uid);
        let modelsPrevRef;
        let modelType;

        if (formType === "Checkpoint") {
          modelsPrevRef = doc(
            firestore,
            "users",
            uid,
            "checkpoints preview",
            mdID + ""
          );
          modelType = "checkpoints";
        } else {
          modelsPrevRef = doc(
            firestore,
            "users",
            uid,
            "models preview",
            mdID + ""
          );
          modelType = "models";
        }

        const modelSnap = await getDoc(modelsRef);
        const modelsPrevRefSnap = await getDoc(modelsPrevRef);
        let updatedCat;
        if (categories && categories[modelType]?.hasOwnProperty(`${main}`)) {
          const newCat = new Set([...categories[modelType][`${main}`], ...sub]);
          updatedCat = {
            ...categories[modelType],
            [`${main}`]: [...newCat],
          };
          console.log("TEST", updatedCat);
        } else if (categories) {
          updatedCat = {
            ...categories[modelType],
            [`${modelData?.main || main}`]: sub,
          };
        } else {
          updatedCat = { [`${modelData?.main || main}`]: sub };
        }
        console.log("TEST2", updatedCat);

        // Throw error if user try to add existing model using new model form
        if (modelSnap.exists() && modelsPrevRefSnap.exists() && !modelData) {
          throw new Error("Exists");
        } else {
          await setDoc(modelsRef, modelInfo);
          const categoryField = `categories.${modelType}`;

          await updateDoc(
            userRef,
            {
              [categoryField]: updatedCat,
            },
            { merge: true }
          );
          const curPrevData = modelsPrevRefSnap.data();
          console.log(curPrevData);
          await setDoc(modelsPrevRef, { ...curPrevData, ...loraPrevData });
        }

        ///////////////////
        // const modelsRef = ref(db, "models/" + (modelData?.id || modelId));
        // let modelsPrevRef;
        // if (formType === "Checkpoint") {
        //   modelsPrevRef = ref(db, "checkpoint preview/" + main);
        // } else {
        //   modelsPrevRef = ref(
        //     db,
        //     "models preview/" + (modelData?.main || main)
        //   );
        // }

        // get(modelsRef).then((snapshot) => {
        //   if (snapshot.exists()) {
        //     if (!modelData) {
        //       seteSuccessMessage("Exists");
        //       return;
        //     }
        //     set(modelsRef, modelInfo);
        //     savePreview(modelsPrevRef, loraPrevData, modelId);
        //   } else {
        //     set(modelsRef, modelInfo);
        //     savePreview(modelsPrevRef, loraPrevData, modelId);
        //   }
        // });

        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // const modelDlsRef = collection(firestore, "users", uid, "models");
        // const modelDlSnap = await getDocs(modelDlsRef);
        // console.log(modelDlSnap);
        // modelDlSnap.forEach((doc) => {
        //   // doc.data() is never undefined for query doc snapshots
        //   console.log(doc.id);
        // });

        /////////////////////////////////////////////////////////////////////
        //MODELS PORT
        /////////////////////////////////////////////

        // // const modelsRDRef = ref(db, "models/" + "134016");
        // const modelsRDRef = ref(db, "models");
        // const snapshot = await get(modelsRDRef);

        // if (snapshot.exists()) {
        //   const curData = await snapshot.val();
        //   // const curDataR = await snapshot.val();
        //   // console.log(curDataR);
        //   // const curData = { name: curDataR };

        //   await Promise.all(
        //     Object.values(curData).map((model) => {
        //       const modelsFrRef = doc(
        //         firestore,
        //         "users",
        //         uid,
        //         "models",
        //         model.id + ""
        //       );

        //       const modelVersions = model.data.modelVersions.map((version) => {
        //         const images =
        //           version?.images?.map((img) => {
        //             const nImg = { ...img };
        //             nImg.meta = nImg?.meta ? clearObjectKeys(nImg.meta) : {};
        //             nImg.meta.comfy = null;
        //             return nImg;
        //           }) || [];
        //         return {
        //           baseModel: version.baseModel || "",
        //           baseModelType: version.baseModelType || "",
        //           createdAt: version.createdAt || "",
        //           description: version.description || "",
        //           id: version.id,
        //           modelId: version.modelId,
        //           name: version.name,
        //           trainedWords: version.trainedWords || null,
        //           updatedAt: version.updatedAt || "",
        //           vaeId: version.vaeId || null,
        //           images,
        //         };
        //       });
        //       const cleanedModelData = {
        //         id: model.data.id,
        //         name: model.data.name,
        //         description: model.data?.description || "",
        //         nsfw: model.data?.nsfw,
        //         poi: model.data?.poi,
        //         tags: model.data?.tags || "",
        //         type: model.data?.type || "",
        //         modelVersions,
        //       };
        //       const modelVersionsCustomDataConverted = {};
        //       model?.modelVersionsCustomData?.forEach((mvcd) => {
        //         modelVersionsCustomDataConverted[mvcd.versionId] = mvcd;
        //       });
        //       let cleanedSavedImages = {};
        //       if (model?.savedImages)
        //         Object.keys(model?.savedImages).forEach((key) => {
        //           cleanedSavedImages[key] =
        //             model?.savedImages[key].filter(Boolean);
        //         });
        //       const cleanedData = {
        //         id: model.id,
        //         data: cleanedModelData,
        //         main: model.main,
        //         mainTag: model?.mainTag || "",
        //         sampler: model?.sampler || "",
        //         cfgScale: model?.cfgScale || "",
        //         denoisingStrength: model?.denoisingStrength || "",
        //         fileName: model?.fileName || "",
        //         hiresUpscale: model?.hiresUpscale || "",
        //         hiresUpscaler: model?.hiresUpscaler || "",
        //         modelVersionsCustomData: modelVersionsCustomDataConverted || {},
        //         negativeTags: model?.negativeTags || [],
        //         savedImages: cleanedSavedImages || {},
        //         size: model?.size || "",
        //         src: model.src,
        //         steps: model?.steps || "",
        //         sub: model.sub,
        //         updatedAt: model.updatedAt,
        //         vae: model?.vae || "",
        //         weight: model?.weight || "",
        //         title: model?.title || "",
        //         imgUrl: model?.imgUrl || "",
        //         type: model?.type || "",
        //         baseModel: model?.baseModel || "",
        //         tags: model?.tags || [],
        //         tagSetsData: model?.tagSetsData || [],
        //         helperTags: model?.helperTags || [],
        //       };
        //       console.log(cleanedData);
        //       return setDoc(modelsFrRef, cleanedData);
        //     })
        //   );
        // }

        //////////////////////////////////////////////////////
        // PREV PORT
        //////////////////////////////////

        // const modelsRDRef = ref(db, "models preview");
        // const snapshot = await get(modelsRDRef);

        // if (snapshot.exists()) {
        //   const curData = await snapshot.val();
        //   const allprev = Object.values(curData).flat();
        //   let categories = {};
        //   allprev.forEach((prev) => {
        //     if (categories.hasOwnProperty(prev.main)) {
        //       categories[prev.main] = [
        //         ...new Set([...categories[prev.main], ...prev.sub]),
        //       ];
        //     } else {
        //       categories[prev.main] = prev.sub;
        //     }
        //   });
        //   console.log(categories);
        //   const categoryField = `categories.models`;
        //   await updateDoc(
        //     userRef,
        //     {
        //       [categoryField]: categories,
        //     },
        //     { merge: true }
        //   );

        //   await Promise.all(
        //     allprev.map((model) => {
        //       const modelsFrRef = doc(
        //         firestore,
        //         "users",
        //         uid,
        //         "models preview",
        //         model.id + ""
        //       );

        //       return setDoc(modelsFrRef, model);
        //     })
        //   );
        // }

        /////////////////////////////////////

        setModelIsSaving(false);
        seteSuccessMessage("Saved");
      } catch (err) {
        setModelIsSaving(false);
        console.log(err);
        seteErrorMessage(err.message);
      }
    };

    getModelData();
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

  const versionStatusChangeHandler = (e) => {
    setVersionsDownloadStatus((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex(
        (version) => version.id === e.target.id
      );
      console.log(e.target.checked);

      newState[curIndex].value = e.target.checked;
      console.log(newState);
      return newState;
    });
  };

  let versionStatusHtml = versionsDownloadStatus?.map((version) => {
    return (
      <div className={classes["example-field"]} key={version.id}>
        <input
          id={version.id}
          name={version.name}
          type={version.type}
          // defaultChecked={version.value}
          checked={version.value}
          onChange={versionStatusChangeHandler}
          // placeholder={version.placeholder}
        ></input>
        <label htmlFor={version.id}>{version.label}</label>
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
        name="file-name"
        type="text"
        placeholder="file name"
        value={fileNameInput}
        onChange={(e) => {
          setFileNameInput(e.target.value);
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
      {formType === "Checkpoint" && (
        <>
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
        </>
      )}
      {tagSetsHtml}
      <button type="button" onClick={addtagSetHandler} disabled={modelIsSaving}>
        Add tag set
      </button>
      {versionStatusHtml}
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
      <button type="submit" disabled={modelIsSaving}>
        {!modelIsSaving ? "Add" : "Saving..."}
      </button>
      <div>{errorMessage}</div>
      {successMessage && <div>{successMessage}</div>}
    </form>
  );
};

export default UpdateModelForm;
