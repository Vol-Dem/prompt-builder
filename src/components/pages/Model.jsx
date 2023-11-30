import React, { useCallback, useEffect, useState } from "react";
import classes from "./Model.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase-config";
import { get, onValue, ref, set } from "firebase/database";
// import { useSelector } from "react-redux";
// import ImageCard from "../image-card/ImageCard";
import TagList from "../tag-list/TagList";
import Tag from "../tag/Tag";
import Carousel from "../carousel/Carousel";
// import Tab from "../ui/tab/Tab";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
import CheckpointForm from "../forms/checkpoint/CheckpointForm";
import { useDispatch, useSelector } from "react-redux";
import { getModel, modelActions } from "../../store/model";
import { addResourcesInfo, getModelInfo } from "../../utils/fetchUtils";
// import LoraForm from "../forms/lora/LoraForm";

const Model = () => {
  // const [model, setModel] = useState({});
  const [modelPreview, setModelPreview] = useState({});
  // const [isLoading, setIsLoading] = useState(true);
  const [editIsOpen, setEditIsOpen] = useState(false);
  // const [curVersion, setCurVersion] = useState(null);
  const [curExampleImgsType, setCurExampleImgsType] = useState("saved");
  const [examplesPage, setExamplesPage] = useState(1);
  const [examplesImages, setExamplesImages] = useState([]);
  const [examplesHtml, setExamplesHtml] = useState([]);
  const { modelId } = useParams();
  const { state } = useLocation();
  const { type } = state;
  const amountPerPage = 20;
  // let type = "model";
  const model = useSelector((state) => state.model.model);
  const isLoading = useSelector((state) => state.model.isLoading);
  const curVersion = useSelector((state) => state.model.curVersion);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getModel(modelId, type));
    // setIsLoading(true);

    // let modelRef;
    // if (type === "Checkpoint") {
    //   modelRef = ref(db, `checkpoint/` + modelId);
    // } else {
    //   modelRef = ref(db, `models/` + modelId);
    // }

    // onValue(modelRef, (snapshot) => {
    //   const data = snapshot.val();
    //   console.log(data);

    //   setModel(data);

    //   setCurVersion(data?.data?.modelVersions[0]);
    //   setIsLoading(false);
    // });
  }, [modelId, type, dispatch]);

  useEffect(() => {
    if (!curVersion.length) return;
    const modelPreviewData = {
      id: model?.id,
      src: model?.src,
      main: model?.main,
      sub: model?.sub,
      title: model?.data?.name,
      imgUrl: curVersion?.images[0]?.url,
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
  }, [model, curVersion]);

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/");
  };

  const openVersionHandler = (e) => {
    const id = +e.target.id;
    console.log(id);
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id
    );

    dispatch(modelActions.setCurVersion(curVer));
    // setCurVersion(curVer);
  };

  const modelImagesHtml = (
    <div id={curVersion?.name}>
      <Carousel images={curVersion?.images} />
    </div>
  );

  const clearObjectKeys = (obj) => {
    const convertedMetaArr = Object.entries(obj).map((entry, i) => {
      const newKey = entry[0] ? entry[0].replace(/[^\w\s]/gi, " ") : `key${i}`;
      return [newKey, entry[1]];
    });
    return Object.fromEntries(convertedMetaArr);
  };

  // const getModelInfo = async (resourcesData) => {
  //   try {
  //     const response = await fetch(
  //       `https://civitai.com/api/v1/model-versions/by-hash/${resourcesData["Model hash"]}`
  //     );
  //     const data = await response.json();

  //     console.log(data);
  //     if (data?.error) {
  //       throw new Error(data.error);
  //     }

  //     const updatedResources = {
  //       ...resourcesData,
  //       modelName: data?.name,
  //       modelId: data.modelId,
  //       versionName: data.name,
  //       versionId: data.id,
  //     };

  //     console.log(updatedResources);
  //     return updatedResources;
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // };

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

  //Temp
  const updateImgResData = async (postId) => {
    let modelsRef;
    if (type === "Checkpoint") {
      modelsRef = ref(db, `checkpoint/` + modelId);
    } else {
      modelsRef = ref(db, `models/` + modelId);
    }

    const data = await get(modelsRef);
    const curData = data.val();

    const exapleIndex = curData.examplesData
      ?.filter(Boolean)
      .findIndex((example) => example.items[0].postId === postId);

    console.log(exapleIndex);

    const examplesDataWithRes = {
      items: await Promise.all(
        curData.examplesData[exapleIndex].items.map(async (item) => {
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
      ),
    };

    console.log(examplesDataWithRes);

    curData.examplesData[exapleIndex] = examplesDataWithRes;

    set(modelsRef, curData);
  };

  const saveExampleHandler = useCallback(
    async (postId) => {
      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postId}&modelId=${model.id}`
      );
      const data = await imgExampleResponse.json();
      console.log(data);
      data.items.forEach((image) => {
        if (image.meta) {
          image.meta = clearObjectKeys(image.meta);
          if (image.meta.hashes)
            image.meta.hashes = clearObjectKeys(image.meta.hashes);
        }
      });

      const examplesDataWithRes = {
        items: await Promise.all(
          data.items.map(async (item) => {
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
        ),
      };

      // const modelsRef = ref(db, "models/" + modelId);
      let modelsRef;
      if (type === "Checkpoint") {
        modelsRef = ref(db, `checkpoint/` + modelId);
      } else {
        modelsRef = ref(db, `models/` + modelId);
      }

      get(modelsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const curData = snapshot.val();
          console.log(examplesDataWithRes, curData);
          const exapleIndex = curData.examplesData
            ?.filter(Boolean)
            .findIndex(
              (example) =>
                example.items[0].postId === examplesDataWithRes.items[0].postId
            );

          if (exapleIndex && exapleIndex !== -1) {
            console.log(exapleIndex, curData.examplesData[exapleIndex].items);
            const newExamples = examplesDataWithRes.items.filter((item) => {
              const isExists = curData.examplesData
                .filter(Boolean)
                .find((example) => example.items[0].id === item.id);
              return !isExists;
            });
            curData.examplesData[exapleIndex].items = [
              ...newExamples,
              ...curData.examplesData[exapleIndex].items,
            ];
          } else {
            curData.examplesData = curData.examplesData
              ? [examplesDataWithRes, ...curData.examplesData.filter(Boolean)]
              : [examplesDataWithRes];
            curData.exemplePromts = curData.exemplePromts
              ? [...new Set([postId, ...curData.exemplePromts.filter(Boolean)])]
              : [postId];
          }

          set(modelsRef, curData);
        }
      });
    },
    [model, modelId, type]
  );

  useEffect(() => {
    console.log("tets");
    if (curExampleImgsType === "saved") {
      if (!model?.examplesData) {
        setCurExampleImgsType("all");
        return;
      }
      const examples = model?.examplesData?.map((item, i) => {
        // console.log(item);
        return (
          <Carousel
            key={i}
            images={item.items}
            visibleImgAmount={1}
            onUpdate={updateImgResData}
          />
        );
      });
      setExamplesHtml(examples);
    } else {
      if (!model?.id) return;
      console.log(model.id);
      const getallExamples = async () => {
        const imgExampleResponse = await fetch(
          `https://civitai.com/api/v1/images?modelId=${model.id}&limit=${amountPerPage}&page=${examplesPage}&sort=Newest`
        );
        const data = await imgExampleResponse.json();
        console.log(data.items);
        if (!data?.items) return;
        setExamplesImages(data?.items);

        const sortedExamples = data?.items?.reduce((acc, cur) => {
          acc.hasOwnProperty(cur.postId)
            ? acc[cur.postId].push(cur)
            : (acc[cur.postId] = [cur]);
          return acc;
        }, {});
        if (!sortedExamples) return;
        console.log(sortedExamples);

        const examples = Object.keys(sortedExamples).map((key, i) => {
          // console.log(item);
          const existedExample = model?.examplesData?.find(
            (img) => img?.items[0]?.postId === +key
          );
          const postId =
            existedExample &&
            existedExample.items.length >= sortedExamples[key].length
              ? ""
              : key;
          // console.log(existedExample, sortedExamples[key]);
          return (
            <div key={i}>
              <Carousel
                images={sortedExamples[key]}
                visibleImgAmount={1}
                postId={postId}
                onSave={saveExampleHandler}
              />
            </div>
          );
        });
        // const examples = <Carousel images={data?.items} visibleImgAmount={3} />;
        // console.log(data);
        // console.log(examples);
        setExamplesHtml(examples);
      };
      getallExamples();
    }
  }, [model, curExampleImgsType, examplesPage, saveExampleHandler]);

  const modelVersionsHrml = model?.data?.modelVersions.map((version, i) => {
    return (
      <div
        key={i}
        id={version.id}
        onClick={openVersionHandler}
        className={`${classes.version} ${
          curVersion.id === version.id ? classes["version--active"] : ""
        }`}
      >
        {version.name}
      </div>
    );
  });

  const subCatsHtml = model?.sub?.map((sub, i) => <li key={i}>{sub}</li>);

  const splitTags = (arr) => {
    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
    return arr.split(splitRegEx).flatMap((tag) => tag.trim() || []);
  };

  const tagSetsHtml = model?.tagSetsData?.map((tagSet, i) => (
    <li key={i}>
      {tagSet.name}: {<TagList tags={splitTags(tagSet.value)} />}
    </li>
  ));

  const openEditHandler = () => {
    setEditIsOpen((prevState) => !prevState);
  };

  const switchCurExamples = (e) => {
    setExamplesPage(1);
    setCurExampleImgsType(e.target.dataset.example);
  };

  const nextPageHandler = () => {
    setExamplesPage((prev) => prev + 1);
  };

  const prevPageHandler = () => {
    setExamplesPage((prev) => prev - 1);
  };

  const viersionVAE = curVersion.files?.find(
    (file) => file.type === "VAE"
  )?.name;

  return (
    <div className={classes.model}>
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
          {editIsOpen && <UpdateModelForm modelData={model} />}
          {editIsOpen && <CheckpointForm modelData={model} />}

          <div className={classes.title}> {model?.data.name}</div>
          <ul className={classes.versions}>{modelVersionsHrml}</ul>
          {!isLoading && modelImagesHtml}
          <div className={classes["info-container"]}>
            <div className={classes?.info}>
              <div>{model?.data?.type}</div>
              <div>Base model: {curVersion?.baseModel}</div>
              <div>Size: {model?.size}</div>
              <div>Weight: {model?.weight}</div>
              <div>Version: {curVersion?.name}</div>
              {viersionVAE && <div>VAE: {viersionVAE}</div>}
              {model?.clipSkip && <div>Clip Skip: {model?.clipSkip}</div>}
              <a href={`https://${model?.src}/models/${model?.id}`}>Link</a>
            </div>
            <div className={classes["tags"]}>
              <div>Main tag:</div>
              <ul className={classes["main-tag"]}>
                <Tag
                  tag={model?.mainTag}
                  promptType="positive"
                  modelData={modelPreview}
                />
              </ul>
              {curVersion?.trainedWords && (
                <>
                  <div>Trigger Words:</div>
                  <TagList
                    tags={curVersion?.trainedWords}
                    promptType="positive"
                  />
                </>
              )}
              {model?.helperTags && (
                <>
                  <div>Helper Words:</div>
                  <TagList tags={model?.helperTags} promptType="positive" />
                </>
              )}
              {model?.tagSetsData && (
                <>
                  <div>Tag sets:</div>
                  <ul className={classes["tag-sets__list"]}>{tagSetsHtml}</ul>
                  {/* <TagList tags={model?.helperTags} promptType="positive" /> */}
                </>
              )}
              {model?.negativeTags && (
                <>
                  <div>Negative Words:</div>
                  <TagList tags={model?.negativeTags} promptType="negative" />
                </>
              )}
            </div>
          </div>
          {curVersion?.description && (
            <>
              <h3>Version description:</h3>
              <div>{curVersion?.description?.replace(/(<([^>]+)>)/gi, "")}</div>
            </>
          )}
          <h3>Description:</h3>
          <div>{model?.data.description?.replace(/(<([^>]+)>)/gi, "")}</div>
          {examplesHtml?.length && (
            <>
              <div>Exapmles:</div>
              <div>
                {model?.examplesData && (
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
              </div>

              <div className={classes.images}>{examplesHtml}</div>
            </>
          )}
          <div>
            {examplesPage > 1 && (
              <button onClick={prevPageHandler}>prev</button>
            )}
            {examplesImages?.length >= amountPerPage && (
              <button onClick={nextPageHandler}>next</button>
            )}
          </div>
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
