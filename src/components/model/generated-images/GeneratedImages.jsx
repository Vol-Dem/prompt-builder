import React, { useEffect, useState } from "react";
import classes from "./GeneratedImages.module.scss";
import { useSelector } from "react-redux";
import { get, ref, set } from "firebase/database";
import { db } from "../../../firebase-config";
import { addResourcesInfo, getModelInfo } from "../../../utils/fetchUtils";
import Carousel from "../../carousel/Carousel";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";

const firestore = getFirestore(firebaseApp);

const GeneratedImages = ({ customData }) => {
  // const [modelPreview, setModelPreview] = useState({});
  // const [isLoading, setIsLoading] = useState(true);
  // const [editIsOpen, setEditIsOpen] = useState(false);
  // const [currVersionIndex, setCurrVersionIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  // const [curVersion, setCurVersion] = useState(null);
  const [curExampleImgsType, setCurExampleImgsType] = useState("saved");
  // const [examplesPage, setExamplesPage] = useState(1);
  const [examplesIsLoading, setExamplesIsLoading] = useState(false);
  const [examplesImages, setExamplesImages] = useState([]);
  // const [allModelexamplesImages, setAllModelexamplesImages] = useState({});
  const [currCursor, setCurrCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [examplesHtml, setExamplesHtml] = useState([]);
  // const [curCustomVersionData, setCurCustomVersionData] = useState({});
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState();
  const [imagesSortValue, setImagesSortValue] = useState("Newest");
  const [amountPerPage, setAmountPerPage] = useState("20");
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const uid = useSelector((state) => state.auth.user.uid);

  const resetExamples = () => {
    console.log("RESET");
    setCurrCursor(null);
    setExamplesImages([]);
  };

  useEffect(() => {
    if (Object.keys(model).length === 0) return;
    if (!model.savedImages) setCurExampleImgsType("all");
    return () => {
      resetExamples();
    };
  }, [model.id]);

  useEffect(() => {
    if (!curVersion?.baseModel) return;
    console.log(
      "WTF",
      curImagesModelVersionId,
      curVersion.id,
      customData?.versionId
    );
    if (!curImagesModelVersionId) {
      console.log("Hmmm", customData?.versionId);
      setCurImagesModelVersionId(customData?.versionId || curVersion.id);
    }
  }, [model, curVersion, customData, curImagesModelVersionId]);

  useEffect(() => {
    if (curImagesModelVersionId !== curVersion.id)
      setCurImagesModelVersionId(customData?.versionId || curVersion.id);
  }, []);

  //   useEffect(() => {
  //     if (!curVersion?.baseModel) return;
  //     if (curImagesModelVersionId === curVersion.id) return;
  //     setCurImagesModelVersionId(curVersion.id);
  //   }, [curVersion]);

  const openSavedVersionImagesHandler = (e) => {
    resetExamples();
    //Temp
    if (e.target.id === "unsorted") {
      setCurImagesModelVersionId(e.target.id);
      return;
    }
    if (e.target.id === "all-versions") {
      setCurImagesModelVersionId(e.target.id);
      return;
    }

    setCurImagesModelVersionId(+e.target.id);
  };
  const switchCurExamples = (e) => {
    // setExamplesPage(1);
    resetExamples();
    setErrorMessage("");
    setCurExampleImgsType(e.target.dataset.example);
    // setCurImagesModelVersionId(curVersion.id);
  };

  //Temp
  const updateImgResData = async (postId) => {
    try {
      const modelsRef = ref(db, `models/` + model.id);

      const data = await get(modelsRef);
      const curData = data.val();

      const exapleIndex = curData.examplesData
        ?.filter(Boolean)
        .findIndex((example) => example.items[0].postId === postId);

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

            return await updatedImgData;
          })
        ),
      };

      curData.examplesData[exapleIndex] = examplesDataWithRes;
      set(modelsRef, curData);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getallExamples = async (modelId, versionId, cursor) => {
    try {
      setExamplesIsLoading(true);
      setErrorMessage("");
      // const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
      //   versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
      // }&limit=${amountPerPage}&sort=Newest${cursor ? `&cursor=${cursor}` : ""}`;
      const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
        versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
      }${amountPerPage ? `&limit=${amountPerPage}` : ""}${
        imagesSortValue ? `&sort=${imagesSortValue}` : ""
      }${cursor ? `&cursor=${cursor}` : ""}${!true ? `&nsfw=None` : ""}`;
      console.log(url);
      console.log(versionId);
      const imgExampleResponse = await fetch(url);
      const data = await imgExampleResponse.json();
      console.log(data);
      setExamplesIsLoading(false);
      if (!data?.items) return;
      setCurrCursor(nextCursor || true);
      setNextCursor(data.metadata.nextCursor);
      // setExamplesImages(data?.items);
      setExamplesImages((prevState) => {
        return [...data?.items, ...prevState];
      });
    } catch (err) {
      console.log(err.message);
      setErrorMessage(err.message);
      setExamplesIsLoading(false);
    }
  };

  useEffect(() => {
    if (curExampleImgsType === "all") return;
    console.log(curImagesModelVersionId);
    if (!curImagesModelVersionId) return;

    //Temp
    if (curImagesModelVersionId === "unsorted") {
      const examples = model.examplesData.map((item, i) => {
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
      return;
    }
    if (!model.savedImages[curImagesModelVersionId]) {
      const latestVersion = Object.keys(model.savedImages)[0];
      if (latestVersion) setCurImagesModelVersionId(+latestVersion);
    }

    const getImages = async () => {
      const modelImagesRef = doc(
        firestore,
        "users",
        uid,
        "models",
        model.id + "",
        "images",
        curImagesModelVersionId + ""
      );
      const modelImagesSnap = await getDoc(modelImagesRef);

      if (modelImagesSnap.exists()) {
        const data = modelImagesSnap.data();
        console.log(data);
        console.log(Object.values(data));
        const examples = Object.values(data).map((item, i) => {
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
        setExamplesHtml([]);
      }
    };

    getImages();

    // const modelsRef = ref(
    //   db,
    //   `savedImages/${model.id}/` + curImagesModelVersionId
    // );

    // get(modelsRef).then((snapshot) => {
    //   if (snapshot.exists()) {
    //     const curData = snapshot.val();
    //     console.log(curData);
    //     // setExamplesImages(curData);
    //     const examples = curData.map((item, i) => {
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
    //   } else {
    //     setExamplesHtml([]);
    //   }
    // });
  }, [curImagesModelVersionId, curExampleImgsType, model]);

  useEffect(() => {
    if (curExampleImgsType === "saved") return;
    if (Object.keys(model).length === 0) return;
    console.log("ALL");
    //Temp
    if (curImagesModelVersionId === "unsorted") return;
    if (!curImagesModelVersionId) return;
    // if (examplesImages.length) return;
    console.log(model.id);
    console.log(curImagesModelVersionId);
    if (!currCursor)
      getallExamples(model.id, curImagesModelVersionId, currCursor);
  }, [
    model,
    curExampleImgsType,
    curImagesModelVersionId,
    currCursor,
    nsfwMode,
  ]);

  const sortExampleImages = () => {
    if (curExampleImgsType === "saved") return;
    // Temp replace with for
    const sortedExamples = examplesImages.reduce((acc, cur) => {
      acc.hasOwnProperty(cur.postId)
        ? acc[cur.postId].push(cur)
        : (acc[cur.postId] = [cur]);
      return acc;
    }, {});
    if (!sortedExamples) return;

    const sortedExamplesArr = Object.keys(sortedExamples).sort((a, b) => {
      return (
        Date.parse(sortedExamples[b][0].createdAt) -
        Date.parse(sortedExamples[a][0].createdAt)
      );
    });

    const examples = sortedExamplesArr.map((key, i) => {
      const existedExample =
        model?.savedImages?.hasOwnProperty(curImagesModelVersionId) &&
        model?.savedImages[`${curImagesModelVersionId}`]?.find(
          (img) => img?.postId === +key
        );
      const postId =
        existedExample && existedExample.amount >= sortedExamples[key].length
          ? ""
          : key;
      // console.log(existedExample, sortedExamples[key]);
      // console.log(model?.savedImages[`${curImagesModelVersionId}`]);
      return (
        <div key={i}>
          <Carousel
            images={sortedExamples[key]}
            visibleImgAmount={1}
            postId={postId}
            modelId={model.id}
            versionId={curImagesModelVersionId}
            // onSave={saveExampleHandler}
          />
        </div>
      );
    });
    // const examples = <Carousel images={data?.items} visibleImgAmount={3} />;

    setExamplesHtml(examples);
  };

  useEffect(sortExampleImages, [
    examplesImages,
    model,
    curExampleImgsType,
    curImagesModelVersionId,
  ]);

  const nextPageHandler = () => {
    getallExamples(model.id, curImagesModelVersionId, nextCursor);
    // setExamplesPage((prev) => prev + 1);
  };
  const retryImageLoadingHandler = () => {
    setErrorMessage("");
    getallExamples(model.id, curImagesModelVersionId, currCursor);
  };

  const modelImageVersionsHtml = model?.data?.modelVersions.flatMap(
    (version, i) => {
      const isSaved =
        model?.savedImages &&
        Object.keys(model.savedImages).includes(`${version.id}`);
      // const versionIsSaved = model.modelVersionsCustomData?.find(
      //   (customData) => customData.versionId === version.id
      // ).downloadStatus;
      const versionIsSaved =
        model.modelVersionsCustomData[version.id]?.downloadStatus;
      // console.log(model.savedImages, version.id);
      if (curExampleImgsType === "saved" && !isSaved) {
        return [];
      }
      return (
        <div
          key={i}
          id={version.id}
          data-version={i}
          onClick={openSavedVersionImagesHandler}
          //   className={`${classes.version} ${
          //     curImagesModelVersionId === version.id
          //       ? classes["version--active"]
          //       : ""
          //   }
          // `}
          className={`${classes.version} ${
            curImagesModelVersionId === version.id
              ? classes["version--active"]
              : ""
          }
        ${versionIsSaved ? classes["version--downloaded"] : ""}`}
        >
          {version.name}
        </div>
      );
    }
  );

  return (
    <>
      <div>
        {(model?.examplesData?.length || model?.savedImages) && (
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
            curExampleImgsType === "all" ? classes["btn-examples--active"] : ""
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
        {curExampleImgsType === "saved" &&
          model?.examplesData?.length !== 0 && (
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
        {curExampleImgsType !== "saved" && (
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
        )}
        {modelImageVersionsHtml}
      </div>
      <div className={classes.images}>{examplesHtml}</div>
      {examplesIsLoading && <div>Loading...</div>}
      {errorMessage && <div>{errorMessage}</div>}
      <div>
        {/* {examplesPage > 1 && (
              <button onClick={prevPageHandler}>prev</button>
            )} */}
        {nextCursor && curExampleImgsType === "all" && (
          <button onClick={nextPageHandler}>next</button>
        )}
        {errorMessage && !nextCursor && (
          <button on onClick={retryImageLoadingHandler}>
            Retry
          </button>
        )}
      </div>
    </>
  );
};

export default GeneratedImages;
