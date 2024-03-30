import React, { useCallback, useEffect, useState } from "react";
import classes from "./GeneratedImages.module.scss";
import { useSelector } from "react-redux";
import Carousel from "../../carousel/Carousel";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";

const firestore = getFirestore(firebaseApp);

const GeneratedImages = ({ customData }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [curExampleImgsType, setCurExampleImgsType] = useState("saved");
  const [examplesIsLoading, setExamplesIsLoading] = useState(false);
  const [examplesImages, setExamplesImages] = useState([]);
  const [currCursor, setCurrCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [examplesHtml, setExamplesHtml] = useState([]);
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
    // setCurImagesModelVersionId(null);
  };

  useEffect(() => {
    // if (Object.keys(model).length === 0) return;
    // if (!model.savedImages) setCurExampleImgsType("all");
    return () => {
      resetExamples();
      setCurImagesModelVersionId(null);
    };
  }, [model.id]);

  useEffect(() => {
    resetExamples();
  }, [nsfwMode]);

  // useEffect(() => {
  //   if (!curVersion?.baseModel) return;
  //   if (!curImagesModelVersionId) {
  //     setCurImagesModelVersionId(customData?.versionId || curVersion.id);
  //   }
  // }, [model, curVersion, customData, curImagesModelVersionId]);

  useEffect(() => {
    if (curImagesModelVersionId) return;
    if (curImagesModelVersionId === curVersion?.id) return;
    // setCurImagesModelVersionId(customData?.versionId || curVersion.id);

    setCurImagesModelVersionId(curVersion.id);
  }, [curImagesModelVersionId, curVersion, customData]);

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
    if (curExampleImgsType === e.target.dataset.example) return;
    resetExamples();
    setErrorMessage("");
    setCurExampleImgsType(e.target.dataset.example);
  };

  //Temp
  // const updateImgResData = async (postId) => {
  //   try {
  //     const modelsRef = ref(db, `models/` + model.id);

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

  const getallExamples = useCallback(
    async (modelId, versionId, cursor) => {
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
        }${cursor ? `&cursor=${cursor}` : ""}${
          nsfwMode ? `&nsfw=X` : `&nsfw=None`
        }`;

        const imgExampleResponse = await fetch(url);
        const data = await imgExampleResponse.json();
        console.log(data);
        setExamplesIsLoading(false);
        if (!data?.items) return;
        setCurrCursor(nextCursor || true);
        setNextCursor(data.metadata.nextCursor);
        setExamplesImages((prevState) => {
          return [...data?.items, ...prevState];
        });
      } catch (err) {
        console.log(err.message);
        setErrorMessage(err.message);
        setExamplesIsLoading(false);
      }
    },
    [amountPerPage, imagesSortValue, nextCursor, nsfwMode]
  );

  useEffect(() => {
    if (curExampleImgsType === "all") return;
    if (!model?.savedImages || !Object.values(model.savedImages).length) {
      setCurExampleImgsType("all");
      return;
    }

    if (!curImagesModelVersionId) return;
    if (!model.savedImages.hasOwnProperty(curImagesModelVersionId)) {
      const latesVersionId = model.data.modelVersions.find((version) =>
        model.savedImages.hasOwnProperty(version.id)
      ).id;
      setCurImagesModelVersionId(latesVersionId);
    }

    //Temp
    if (curImagesModelVersionId === "unsorted") {
      const examples = model.examplesData.map((item, i) => {
        return (
          <Carousel
            key={i}
            images={item.items}
            visibleImgAmount={1}
            // onUpdate={updateImgResData}
          />
        );
      });
      setExamplesHtml(examples);
      return;
    }
    // if (!model.savedImages[curImagesModelVersionId]) {
    //   const latestVersion = Object.keys(model.savedImages)[0];
    //   if (latestVersion) setCurImagesModelVersionId(+latestVersion);
    // }

    const getImages = async () => {
      const q = query(
        collection(firestore, "users", uid, "models", model.id + "", "images"),
        where("versionId", "==", curImagesModelVersionId),
        orderBy("versionId", "desc")
        // orderBy("savedAt", "desc")
      );
      console.log("START");
      const modelImagesSnap = await getDocs(q);

      const data = modelImagesSnap.docs.map((doc) => {
        // doc.data() is never undefined for query doc snapshots
        return doc.data();
      });
      console.log(data);
      const examples = data.flatMap((item, i) => {
        if (!nsfwMode && item.nsfw) return [];
        return (
          <Carousel
            key={i}
            versionId={curImagesModelVersionId}
            images={item.items}
            visibleImgAmount={1}
            // onUpdate={updateImgResData}
          />
        );
      });
      setExamplesHtml(examples);
    };

    getImages();
  }, [curImagesModelVersionId, curExampleImgsType, model, uid, nsfwMode]);

  useEffect(() => {
    if (curExampleImgsType === "saved") return;
    if (Object.keys(model).length === 0) return;

    //Temp
    if (curImagesModelVersionId === "unsorted") return;
    if (!curImagesModelVersionId) return;
    // if (examplesImages.length) return;
    if (!currCursor)
      getallExamples(model.id, curImagesModelVersionId, currCursor);
  }, [
    model,
    curExampleImgsType,
    curImagesModelVersionId,
    currCursor,
    nsfwMode,
    getallExamples,
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

      return (
        <div key={i}>
          <Carousel
            images={sortedExamples[key]}
            visibleImgAmount={1}
            existedImgsAmount={existedExample?.amount || null}
            postId={postId}
            modelId={model.id}
            versionId={curImagesModelVersionId}
          />
        </div>
      );
    });

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
      const versionIsSaved =
        model.modelVersionsCustomData[version.id]?.downloadStatus;

      if (curExampleImgsType === "saved" && !isSaved) {
        return [];
      }
      return (
        <div
          key={i}
          id={version.id}
          data-version={i}
          onClick={openSavedVersionImagesHandler}
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
      <div className={classes["controls"]}>
        <div className={classes["mode-switch"]}>
          {(model?.examplesData?.length ||
            (model?.savedImages &&
              !!Object.keys(model?.savedImages).length)) && (
            <span
              className={`${classes["btn-mode"]} ${
                curExampleImgsType === "saved"
                  ? classes["btn-mode--active"]
                  : ""
              }`}
              data-example="saved"
              onClick={switchCurExamples}
            >
              Saved
            </span>
          )}
          <span
            className={`${classes["btn-mode"]} ${
              curExampleImgsType === "all" ? classes["btn-mode--active"] : ""
            }`}
            data-example="all"
            onClick={switchCurExamples}
          >
            All
          </span>
        </div>
        <span>Sort: </span>
        <select
          name="sort"
          id="sort"
          value={imagesSortValue}
          className={classes.select}
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
          className={classes.select}
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
