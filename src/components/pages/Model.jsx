import React, { useCallback, useEffect, useState } from "react";
import classes from "./Model.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { db } from "../../firebase-config";
// import { get, onValue, ref, set } from "firebase/database";
// import { useSelector } from "react-redux";
// import ImageCard from "../image-card/ImageCard";
// import TagList from "../tag-list/TagList";
// import Tag from "../tag/Tag";
import Carousel from "../carousel/Carousel";
// import Tab from "../ui/tab/Tab";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
// import CheckpointForm from "../forms/checkpoint/CheckpointForm";
import { useDispatch, useSelector } from "react-redux";
import { getModel, modelActions } from "../../store/model";
// import { addResourcesInfo, getModelInfo } from "../../utils/fetchUtils";
import VersionForm from "../forms/version-form/VersionForm";
import SaveImageForm from "../forms/save-image-form/SaveImageForm";
import ModelInfo from "../model/info/ModelInfo";
import ModelTags from "../model/tags/ModelTags";
import GeneratedImages from "../model/generated-images/GeneratedImages";
// import LoraForm from "../forms/lora/LoraForm";

const Model = () => {
  // const [model, setModel] = useState({});
  const [modelPreview, setModelPreview] = useState({});
  // const [isLoading, setIsLoading] = useState(true);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [currVersionIndex, setCurrVersionIndex] = useState(null);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [curVersion, setCurVersion] = useState(null);
  // const [curExampleImgsType, setCurExampleImgsType] = useState("saved");
  // const [examplesPage, setExamplesPage] = useState(1);
  // const [examplesIsLoading, setExamplesIsLoading] = useState(false);
  // const [examplesImages, setExamplesImages] = useState([]);
  // const [allModelexamplesImages, setAllModelexamplesImages] = useState({});
  // const [currCursor, setCurrCursor] = useState(null);
  // const [nextCursor, setNextCursor] = useState(null);
  // const [examplesHtml, setExamplesHtml] = useState([]);
  const [curCustomVersionData, setCurCustomVersionData] = useState({});
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState();
  // const [imagesSortValue, setImagesSortValue] = useState("Newest");
  // const [amountPerPage, setAmountPerPage] = useState("20");
  const { modelId } = useParams();
  // const { state } = useLocation();
  // const { type } = state;
  // const type = ''
  // let type = "model";
  const model = useSelector((state) => state.model.model);
  const isLoading = useSelector((state) => state.model.isLoading);
  const curVersion = useSelector((state) => state.model.curVersion);
  const dispatch = useDispatch();

  // const resetExamples = () => {
  //   console.log("RESET");
  //   setCurrCursor(null);
  //   setExamplesImages([]);
  // };

  useEffect(() => {
    // resetExamples();
    dispatch(getModel(modelId));
    return () => {
      // resetExamples();
      dispatch(modelActions.setCurVersion({}));
      dispatch(modelActions.setModelData({}));
    };
  }, [modelId, dispatch]);

  // useEffect(() => {
  //   console.log("CHECK", model, !model);
  //   if (Object.keys(model).length === 0) return;
  //   console.log(curExampleImgsType);
  //   console.log(!model.savedImages);
  //   if (!model.savedImages) setCurExampleImgsType("all");
  // }, [model]);

  useEffect(() => {
    if (!curVersion?.baseModel) return;
    const modelPreviewData = {
      id: model?.id,
      src: model?.src,
      main: model?.main,
      sub: model?.sub,
      title: model?.data?.name,
      imgUrl: curVersion?.images ? curVersion?.images[0]?.url : "",
      type: model?.data?.type,
      baseModel: curVersion?.baseModel,
      mainTag: model?.mainTag,
      weight: model?.weight,
      size: model?.size,
      tags: curVersion?.trainedWords,
      helperTags: model?.helperTags,
      updatedAt: model?.updatedAt,
    };
    setModelPreview(modelPreviewData);

    const curCustomVersion = model.modelVersionsCustomData?.find(
      (version) => version.versionId === curVersion.id
    );
    // console.log(curCustomVersion);
    setCurCustomVersionData(curCustomVersion);

    if (!curImagesModelVersionId)
      setCurImagesModelVersionId(curCustomVersion?.versionId || curVersion.id);
  }, [model, curVersion, curImagesModelVersionId]);

  useEffect(() => {
    if (currVersionIndex === null) return;
    dispatch(
      modelActions.setCurVersion(model?.data?.modelVersions[currVersionIndex])
    );
  }, [model, currVersionIndex, dispatch]);

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/");
  };

  const openVersionHandler = (e) => {
    const id = +e.target.id;
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id
    );

    // resetExamples();
    dispatch(modelActions.setCurVersion(curVer));
    setCurrVersionIndex(e.target.dataset.version);
    // setCurImagesModelVersionId(curVer.id);
    // setCurVersion(curVer);
  };

  const modelImagesHtml = (
    <div id={curVersion?.name}>
      <Carousel images={curVersion?.images} />
    </div>
  );

  // const clearObjectKeys = (obj) => {
  //   const convertedMetaArr = Object.entries(obj).map((entry, i) => {
  //     const newKey = entry[0] ? entry[0].replace(/[^\w\s]/gi, " ") : `key${i}`;
  //     return [newKey, entry[1]];
  //   });
  //   return Object.fromEntries(convertedMetaArr);
  // };

  //Temp
  // const updateImgResData = async (postId) => {
  //   try {
  //     const modelsRef = ref(db, `models/` + modelId);

  //     const data = await get(modelsRef);
  //     const curData = data.val();

  //     const exapleIndex = curData.examplesData
  //       ?.filter(Boolean)
  //       .findIndex((example) => example.items[0].postId === postId);

  //     const examplesDataWithRes = {
  //       items: await Promise.all(
  //         curData.examplesData[exapleIndex].items.map(async (item) => {
  //           const updatedImgData = { ...item };
  //           if (item.meta?.hasOwnProperty("Model hash")) {
  //             const newMeta = await getModelInfo(item.meta);
  //             if (newMeta) updatedImgData.meta = newMeta;
  //           }
  //           if (item.meta?.resources) {
  //             updatedImgData.meta.resources = await addResourcesInfo(
  //               item.meta.resources
  //             );
  //           }
  //           if (item.meta?.civitaiResources) {
  //             updatedImgData.meta.civitaiResources = await addResourcesInfo(
  //               item.meta.civitaiResources
  //             );
  //           }

  //           return await updatedImgData;
  //         })
  //       ),
  //     };

  //     curData.examplesData[exapleIndex] = examplesDataWithRes;
  //     set(modelsRef, curData);
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // };

  // const saveExampleHandler = useCallback(
  //   async (postId) => {
  //     try {
  //       const imgExampleResponse = await fetch(
  //         `https://civitai.com/api/v1/images?postId=${postId}&modelId=${model.id}&modelVersionId=${curImagesModelVersionId}`
  //       );
  //       const data = await imgExampleResponse.json();
  //       console.log(data);
  //       if (!data.items.length) {
  //         throw new Error("0 items");
  //       }
  //       data.items.forEach((image) => {
  //         if (image.meta) {
  //           image.meta = clearObjectKeys(image.meta);
  //           if (image.meta.hashes)
  //             image.meta.hashes = clearObjectKeys(image.meta.hashes);
  //         }
  //       });
  //       const examplesDataWithRes = {
  //         items: await Promise.all(
  //           data.items.map(async (item) => {
  //             const updatedImgData = { ...item };
  //             if (item.meta?.hasOwnProperty("Model hash")) {
  //               const newMeta = await getModelInfo(item.meta);
  //               if (newMeta) updatedImgData.meta = newMeta;
  //             }
  //             if (item.meta?.resources) {
  //               updatedImgData.meta.resources = await addResourcesInfo(
  //                 item.meta.resources
  //               );
  //             }
  //             if (item.meta?.civitaiResources) {
  //               updatedImgData.meta.civitaiResources = await addResourcesInfo(
  //                 item.meta.civitaiResources
  //               );
  //             }
  //             return await updatedImgData;
  //           })
  //         ),
  //       };
  //       examplesDataWithRes.versionId = curImagesModelVersionId;
  //       const modelsRef = ref(db, "models/" + modelId);
  //       get(modelsRef).then((snapshot) => {
  //         if (snapshot.exists()) {
  //           const curData = snapshot.val();
  //           console.log(curImagesModelVersionId);
  //           if (
  //             curData?.savedImages?.hasOwnProperty(`${curImagesModelVersionId}`)
  //           ) {
  //             curData.savedImages[`${curImagesModelVersionId}`].unshift({
  //               postId: +postId,
  //               amount: data.items.length,
  //             });
  //           } else {
  //             curData.savedImages = {
  //               ...curData?.savedImages,
  //               [`${curImagesModelVersionId}`]: [
  //                 { postId: +postId, amount: data.items.length },
  //               ],
  //             };
  //           }
  //           set(modelsRef, curData);
  //         } else {
  //         }
  //       });
  //       const savedImagesRef = ref(db, `savedImages/` + modelId);
  //       get(savedImagesRef).then((snapshot) => {
  //         if (snapshot.exists()) {
  //           const curData = snapshot.val();
  //           const exapleIndex = curData[curImagesModelVersionId]
  //             ?.filter(Boolean)
  //             .findIndex(
  //               (example) =>
  //                 example.items[0].postId ===
  //                 examplesDataWithRes.items[0].postId
  //             );
  //           if (exapleIndex && exapleIndex !== -1) {
  //             const newExamples = examplesDataWithRes.items.filter((item) => {
  //               const isExists = curData[curImagesModelVersionId]
  //                 .filter(Boolean)
  //                 .find((example) => example.items[0].id === item.id);
  //               return !isExists;
  //             });
  //             curData[curImagesModelVersionId][exapleIndex].items = [
  //               ...newExamples,
  //               ...curData[curImagesModelVersionId][exapleIndex].items,
  //             ];
  //             // curData.examplesData[exapleIndex].versionId = curImagesModelVersionId
  //           } else {
  //             curData[curImagesModelVersionId] = curData[
  //               curImagesModelVersionId
  //             ]
  //               ? [examplesDataWithRes, ...curData[curImagesModelVersionId]]
  //               : [examplesDataWithRes];
  //           }
  //           console.log(curData);
  //           set(savedImagesRef, curData);
  //         } else {
  //           const images = { [curImagesModelVersionId]: [examplesDataWithRes] };
  //           set(savedImagesRef, images);
  //         }
  //       });
  //     } catch (err) {
  //       console.log(err.message);
  //     }
  //   },
  //   [model, modelId, curImagesModelVersionId]
  // );

  // const getallExamples = async (modelId, versionId, cursor) => {
  //   try {
  //     setExamplesIsLoading(true);
  //     setErrorMessage("");
  //     // const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
  //     //   versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
  //     // }&limit=${amountPerPage}&sort=Newest${cursor ? `&cursor=${cursor}` : ""}`;
  //     const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
  //       versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
  //     }${amountPerPage ? `&limit=${amountPerPage}` : ""}${
  //       imagesSortValue ? `&sort=${imagesSortValue}` : ""
  //     }${cursor ? `&cursor=${cursor}` : ""}`;
  //     console.log(url);
  //     console.log(versionId);
  //     const imgExampleResponse = await fetch(url);
  //     const data = await imgExampleResponse.json();
  //     console.log(data);
  //     setExamplesIsLoading(false);
  //     if (!data?.items) return;
  //     setCurrCursor(nextCursor || true);
  //     setNextCursor(data.metadata.nextCursor);
  //     // setExamplesImages(data?.items);
  //     setExamplesImages((prevState) => {
  //       return [...data?.items, ...prevState];
  //     });
  //   } catch (err) {
  //     console.log(err.message);
  //     setErrorMessage(err.message);
  //     setExamplesIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (curExampleImgsType === "all") return;

  //   if (Array.isArray(model?.examplesData)) {
  //     const examples = examplesImages.map((item, i) => {
  //       return (
  //         <Carousel
  //           key={i}
  //           images={item.items}
  //           visibleImgAmount={1}
  //           onUpdate={updateImgResData}
  //         />
  //       );
  //     });
  //     setExamplesHtml(examples);
  //   }
  // }, [curExampleImgsType, examplesImages]);

  // useEffect(() => {
  //   if (curExampleImgsType === "saved") return;
  //   if (Object.keys(model).length === 0) return;
  //   console.log("ALL");
  //   //Temp
  //   if (curImagesModelVersionId === "unsorted") return;
  //   if (!curImagesModelVersionId) return;
  //   // if (examplesImages.length) return;
  //   console.log(model.id);
  //   console.log(curImagesModelVersionId);
  //   if (!currCursor)
  //     getallExamples(model.id, curImagesModelVersionId, currCursor);
  // }, [model, curExampleImgsType, curImagesModelVersionId, currCursor]);

  // const sortExampleImages = () => {
  //   if (curExampleImgsType === "saved") return;
  //   // Temp replace with for
  //   const sortedExamples = examplesImages.reduce((acc, cur) => {
  //     acc.hasOwnProperty(cur.postId)
  //       ? acc[cur.postId].push(cur)
  //       : (acc[cur.postId] = [cur]);
  //     return acc;
  //   }, {});
  //   if (!sortedExamples) return;

  //   const sortedExamplesArr = Object.keys(sortedExamples).sort((a, b) => {
  //     return (
  //       Date.parse(sortedExamples[b][0].createdAt) -
  //       Date.parse(sortedExamples[a][0].createdAt)
  //     );
  //   });

  //   const examples = sortedExamplesArr.map((key, i) => {
  //     const existedExample =
  //       model?.savedImages?.hasOwnProperty(curImagesModelVersionId) &&
  //       model?.savedImages[`${curImagesModelVersionId}`]?.find(
  //         (img) => img?.postId === +key
  //       );
  //     const postId =
  //       existedExample && existedExample.amount >= sortedExamples[key].length
  //         ? ""
  //         : key;
  //     console.log(existedExample, sortedExamples[key]);
  //     // console.log(model?.savedImages[`${curImagesModelVersionId}`]);
  //     return (
  //       <div key={i}>
  //         <Carousel
  //           images={sortedExamples[key]}
  //           visibleImgAmount={1}
  //           postId={postId}
  //           modelId={model.id}
  //           versionId={curImagesModelVersionId}
  //           // onSave={saveExampleHandler}
  //         />
  //       </div>
  //     );
  //   });
  //   // const examples = <Carousel images={data?.items} visibleImgAmount={3} />;

  //   setExamplesHtml(examples);
  // };

  // useEffect(sortExampleImages, [
  //   examplesImages,
  //   model,
  //   curExampleImgsType,
  //   curImagesModelVersionId,
  // ]);

  // const createCarousel = (images) => {
  //   const examples = images.map((key, i) => {
  //     const existedExample = model?.examplesData?.find(
  //       (img) => img?.items[0]?.postId === +key
  //     );
  //     const postId =
  //       existedExample && existedExample.items.length >= images[key].length
  //         ? ""
  //         : key;
  //     // console.log(existedExample, sortedExamples[key]);
  //     return (
  //       <div key={i}>
  //         <Carousel
  //           images={images[key]}
  //           visibleImgAmount={1}
  //           postId={postId}
  //           onSave={saveExampleHandler}
  //         />
  //       </div>
  //     );
  //   });
  //   // const examples = <Carousel images={data?.items} visibleImgAmount={3} />;

  //   setExamplesHtml(examples);
  // };

  const modelVersionsHrml = model?.data?.modelVersions.map((version, i) => {
    return (
      <div
        key={i}
        id={version.id}
        data-version={i}
        onClick={openVersionHandler}
        className={`${classes.version} ${
          curVersion?.id === version.id ? classes["version--active"] : ""
        }
        ${
          model?.modelVersionsCustomData &&
          model?.modelVersionsCustomData[i]?.downloadStatus
            ? classes["version--downloaded"]
            : ""
        }`}
      >
        {version.name}
      </div>
    );
  });

  const subCatsHtml = model?.sub?.map((sub, i) => <li key={i}>{sub}</li>);

  // const splitTags = (arr) => {
  //   const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
  //   return arr.split(splitRegEx).flatMap((tag) => tag.trim() || []);
  // };

  // const tagSets = curCustomVersionData?.tagSetsData || model?.tagSetsData;

  // const tagSetsHtml = tagSets?.map((tagSet, i) => (
  //   <li key={i}>
  //     {tagSet.name}:{" "}
  //     {<TagList tags={splitTags(tagSet.value)} promptType="positive" />}
  //   </li>
  // ));

  const openEditHandler = () => {
    setEditIsOpen((prevState) => !prevState);
  };

  // const switchCurExamples = (e) => {
  //   setExamplesPage(1);
  //   resetExamples();
  //   setErrorMessage("");
  //   setCurExampleImgsType(e.target.dataset.example);
  //   // setCurImagesModelVersionId(curVersion.id);
  // };

  // const nextPageHandler = () => {
  //   getallExamples(model.id, curImagesModelVersionId, nextCursor);
  //   // setExamplesPage((prev) => prev + 1);
  // };

  // const prevPageHandler = () => {
  //   setExamplesPage((prev) => prev - 1);
  // };

  // const openSavedVersionImagesHandler = (e) => {
  //   resetExamples();
  //   //Temp
  //   if (e.target.id === "unsorted") {
  //     setCurImagesModelVersionId(e.target.id);
  //     return;
  //   }
  //   if (e.target.id === "all-versions") {
  //     setCurImagesModelVersionId(e.target.id);
  //     return;
  //   }

  //   setCurImagesModelVersionId(+e.target.id);
  // };

  // useEffect(() => {
  //   if (curExampleImgsType === "all") return;
  //   console.log(curImagesModelVersionId);
  //   if (!curImagesModelVersionId) return;

  //   //Temp
  //   if (curImagesModelVersionId === "unsorted") {
  //     const examples = model.examplesData.map((item, i) => {
  //       return (
  //         <Carousel
  //           key={i}
  //           images={item.items}
  //           visibleImgAmount={1}
  //           // onUpdate={updateImgResData}
  //         />
  //       );
  //     });
  //     setExamplesHtml(examples);
  //     return;
  //   }

  //   const modelsRef = ref(
  //     db,
  //     `savedImages/${modelId}/` + curImagesModelVersionId
  //   );

  //   get(modelsRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       const curData = snapshot.val();
  //       console.log(curData);
  //       // setExamplesImages(curData);
  //       const examples = curData.map((item, i) => {
  //         return (
  //           <Carousel
  //             key={i}
  //             images={item.items}
  //             visibleImgAmount={1}
  //             // onUpdate={updateImgResData}
  //           />
  //         );
  //       });
  //       setExamplesHtml(examples);
  //     } else {
  //       setExamplesHtml([]);
  //     }
  //   });
  // }, [modelId, curImagesModelVersionId, curExampleImgsType, model]);

  // const modelImageVersionsHtml = model?.data?.modelVersions.map(
  //   (version, i) => {
  //     return (
  //       <div
  //         key={i}
  //         id={version.id}
  //         data-version={i}
  //         onClick={openSavedVersionImagesHandler}
  //         className={`${classes.version} ${
  //           curImagesModelVersionId === version.id
  //             ? classes["version--active"]
  //             : ""
  //         }
  //       `}
  //       >
  //         {version.name}
  //       </div>
  //     );
  //   }
  // );

  // const viersionVAE = curVersion?.files?.find(
  //   (file) => file.type === "VAE"
  // )?.name;

  const versionFormsHtml = model?.modelVersionsCustomData?.flatMap(
    (version, i) => {
      if (!version.downloadStatus) return [];
      return (
        <div key={i}>
          <div>{version.versionName}</div>
          <VersionForm
            versionData={version}
            modelId={model.id}
            mainCat={model.main}
          />
        </div>
      );
    }
  );

  // const mergeHandler = () => {
  //   const modelsChRef = ref(db, `checkpoint`);

  //   get(modelsChRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       const curData = snapshot.val();
  //       console.log(curData);

  //       Object.keys(curData).forEach((modelId) => {
  //         const modelsRef = ref(db, "models/" + modelId);
  //         const data = curData[modelId];
  //         set(modelsRef, data);
  //       });
  //     }
  //   });
  // };

  // const retryImageLoadingHandler = () => {
  //   setErrorMessage("");
  //   getallExamples(model.id, curImagesModelVersionId, currCursor);
  // };

  return (
    <div className={classes.model}>
      {/* <button onClick={mergeHandler}>Merge</button> */}
      {!isLoading && (
        <>
          <div className={classes["panel"]}>
            <button className={classes["btn-back"]} onClick={backHandler}>
              Back
            </button>
            <div className={classes.categories}>
              {model?.main}
              <ul className={classes["subcategories"]}>{subCatsHtml}</ul>
            </div>
            <button className={classes["btn-edit"]} onClick={openEditHandler}>
              Edit
            </button>
          </div>
          {editIsOpen && model.data.type !== "Checkpoint" && (
            <UpdateModelForm modelData={model} />
          )}
          {editIsOpen && model.data.type === "Checkpoint" && (
            <UpdateModelForm modelData={model} formType="Checkpoint" />
          )}
          {editIsOpen && versionFormsHtml}
          {editIsOpen && <SaveImageForm modelData={model} />}

          <div className={classes.title}> {model?.data?.name}</div>
          <ul className={classes.versions}>{modelVersionsHrml}</ul>
          {!isLoading && modelImagesHtml}
          <div className={classes["info-container"]}>
            {/* <div className={classes?.info}>
              <div>{model?.data?.type}</div>
              <div>Base model: {curVersion?.baseModel}</div>
              <div>Size: {curCustomVersionData?.size || model?.size}</div>
              <div>Weight: {curCustomVersionData?.weight || model?.weight}</div>
              <div>Version: {curVersion?.name}</div>
              <div>
                File: {curCustomVersionData?.fileName || model?.fileName}
              </div>
              {viersionVAE && <div>VAE: {viersionVAE}</div>}
              {model?.clipSkip && <div>Clip Skip: {model?.clipSkip}</div>}
              <a href={`https://${model?.src}/models/${model?.id}`}>Link</a>
            </div> */}
            <ModelInfo customData={curCustomVersionData} />
            {/* <div className={classes["tags"]}>
              <div>Main tag:</div>
              <ul className={classes["main-tag"]}>
                <Tag
                  tag={curCustomVersionData?.mainTag || model?.mainTag}
                  promptType="positive"
                  modelData={modelPreview}
                />
              </ul>
              {(curVersion?.trainedWords ||
                curCustomVersionData?.trainedWords) && (
                <>
                  <div>Trigger Words:</div>
                  <TagList
                    tags={
                      curCustomVersionData?.trainedWords ||
                      curVersion?.trainedWords
                    }
                    promptType="positive"
                  />
                </>
              )}
              {(model?.helperTags || curCustomVersionData?.helperTags) && (
                <>
                  <div>Helper Words:</div>
                  <TagList
                    tags={curCustomVersionData?.helperTags || model?.helperTags}
                    promptType="positive"
                  />
                </>
              )}
              {(model?.tagSetsData || curCustomVersionData?.tagSetsData) && (
                <>
                  <div>Tag sets:</div>
                  <ul className={classes["tag-sets__list"]}>{tagSetsHtml}</ul>
                </>
              )}
              {(model?.negativeTags || curCustomVersionData?.negativeTags) && (
                <>
                  <div>Negative Words:</div>
                  <TagList
                    tags={
                      curCustomVersionData?.negativeTags || model?.negativeTags
                    }
                    promptType="negative"
                  />
                </>
              )}
            </div> */}
            <ModelTags
              customData={curCustomVersionData}
              modelPreview={modelPreview}
            />
          </div>
          {curVersion?.description && (
            <>
              <h3>Version description:</h3>
              <div>{curVersion?.description?.replace(/(<([^>]+)>)/gi, "")}</div>
            </>
          )}
          <h3>Description:</h3>
          <div>{model?.data?.description?.replace(/(<([^>]+)>)/gi, "")}</div>

          <div>Exapmles:</div>
          <GeneratedImages
            customData={curCustomVersionData}
            // curImagesModelVersionId={curImagesModelVersionId}
            // onOpen={openSavedVersionImagesHandler}
          />
          {/* <div>
            {(model?.examplesData || model?.savedImages) && (
              <span
                className={`${classes["btn-examples"]} ${
                  curExampleImgsType === "saved"
                    ? classes["btn-examples--active"]
                    : ""
                }`}
                data-example="saved"
                onClick={switchCurExamples}
              >
                Saved
              </span>
            )}{" "}
            <span
              className={`${classes["btn-examples"]} ${
                curExampleImgsType === "all"
                  ? classes["btn-examples--active"]
                  : ""
              }`}
              data-example="all"
              onClick={switchCurExamples}
            >
              All
            </span>
            <select
              name="sort"
              id="sort"
              value={imagesSortValue}
              onChange={(e) => {
                resetExamples();
                setImagesSortValue(e.target.value);
              }}
            >
              <option value="">-</option>
              <option value="Newest">Newest</option>
              <option value="Most Comments">Most Comments</option>
              <option value="Most Reactions">Most Reactions</option>
            </select>
            <select
              name="amount-per-page"
              id="amount-per-page"
              value={amountPerPage}
              onChange={(e) => {
                resetExamples();
                setAmountPerPage(e.target.value);
              }}
            >
              <option value="">-</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className={classes["image-versions"]}>
            {curExampleImgsType === "saved" && model?.examplesData?.length && (
              <div
                className={`${classes.version} ${
                  curImagesModelVersionId === "unsorted"
                    ? classes["version--active"]
                    : ""
                }
        `}
                id="unsorted"
                onClick={openSavedVersionImagesHandler}
              >
                Unsorted
              </div>
            )}
            <div
              className={`${classes.version} ${
                curImagesModelVersionId === "all-versions"
                  ? classes["version--active"]
                  : ""
              }
        `}
              id="all-versions"
              onClick={openSavedVersionImagesHandler}
            >
              All
            </div>
            {modelImageVersionsHtml}
          </div>
          <div className={classes.images}>{examplesHtml}</div>
          {examplesIsLoading && <div>Loading...</div>}
          {errorMessage && <div>{errorMessage}</div>}
          <div>
            {nextCursor && curExampleImgsType === "all" && (
              <button onClick={nextPageHandler}>next</button>
            )}
            {errorMessage && !nextCursor && (
              <button on onClick={retryImageLoadingHandler}>
                Retry
              </button>
            )}
          </div> */}
        </>
      )}
      {/* <div className={classes.test}>
        <div className={classes["test__item"]}>1</div>
        <div className={classes["test__item"]}>2</div>
        <div className={classes["test__item"]}>3</div>
        <div className={classes["test__item"]}>4</div>
        <div className={classes["test__item"]}>5</div>
        <div className={classes["test__item"]}>6</div>
        <div className={classes["test__item"]}>7</div>
      </div> */}
    </div>
  );
};

export default Model;
