import React, { useCallback, useEffect, useRef, useState } from "react";
import classes from "./GeneratedImages.module.scss";
import { useSelector } from "react-redux";
import Carousel from "../../carousel/Carousel";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import Spinner from "../../ui/Spinner";
import useIntersection from "../../../hooks/use-intersection";

const firestore = getFirestore(firebaseApp);

const postsPerPage = 16;

let getImageTimeout;

const GeneratedImages = ({ customData }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [curExampleImgsType, setCurExampleImgsType] = useState("saved");
  const [examplesIsLoading, setExamplesIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [lastVisible, setLastVisible] = useState({});
  const [examplesImages, setExamplesImages] = useState([]);
  const [currCursor, setCurrCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [examplesImgData, setExamplesImgData] = useState([]);
  const [examplesHtml, setExamplesHtml] = useState([]);
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState();
  const [imagesSortValue, setImagesSortValue] = useState("Newest");
  const [amountPerPage, setAmountPerPage] = useState(50);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const uid = useSelector((state) => state.auth.user.uid);
  const endPage = useRef(null);
  const intersecting = useIntersection(endPage, false);

  useEffect(() => {
    setIsIntersecting(intersecting);
  }, [intersecting]);

  const resetExamples = () => {
    // console.log("RESET");
    setCurrCursor(null);
    setExamplesImages([]);
    setExamplesImgData([]);
    setIsLastPage(false);
    setLastVisible({});
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
        // if (currCursor === nextCursor) return;
        setIsIntersecting(false);
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
        if (data.metadata?.nextCursor) {
          setNextCursor(data.metadata.nextCursor);
        } else {
          setIsLastPage(true);
        }
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

  const getImagesFromFirestore = useCallback(async () => {
    try {
      if (isLastPage) return;
      setIsIntersecting(false);
      setErrorMessage("");
      setExamplesIsLoading(true);
      const q = query(
        collection(firestore, "users", uid, "models", model.id + "", "images"),
        where("versionId", "==", curImagesModelVersionId),
        // where("nsfw", "==", nsfwMode),
        orderBy("versionId", "desc"),
        // orderBy("savedAt", "desc"),
        startAfter(lastVisible),
        limit(postsPerPage)
      );

      const modelImagesSnap = await getDocs(q);

      // const isLast = modelImagesSnap.docs.length <= postsPerPage;
      const isLast =
        !modelImagesSnap.docs.length ||
        modelImagesSnap.docs.length < postsPerPage;

      const allData = modelImagesSnap.docs.map((doc, i) => {
        // doc.data() is never undefined for query doc snapshots

        return doc.data();
      });
      console.log(modelImagesSnap.docs.length);
      console.log(allData);

      const data = modelImagesSnap.docs.flatMap((doc, i) => {
        // doc.data() is never undefined for query doc snapshots
        // if (i === postsPerPage) {
        //   return [];
        // }
        return doc.data();
      });

      console.log(data);

      const examples = data
        .map((post) => {
          if (nsfwMode) {
            return post.items;
          } else {
            return post.items.filter((item) => !item.nsfw);
          }
        })
        .filter((item) => !!item.length);
      // const examples = data.map((item, i) => item.items);
      console.log(examples);
      // const examples = data.flatMap((item, i) => {
      //   if (!nsfwMode && item.nsfw) return [];
      //   return (
      //     <Carousel
      //       key={i}
      //       versionId={curImagesModelVersionId}
      //       images={item.items}
      //       visibleImgAmount={1}
      //       // onUpdate={updateImgResData}
      //     />
      //   );
      // });

      setExamplesImgData((prevState) => [...prevState, ...examples]);
      setExamplesIsLoading(false);

      const lastVisiblePost =
        modelImagesSnap.docs[modelImagesSnap.docs.length - 1];
      if (!isLast) {
        setLastVisible(lastVisiblePost);
      }
      // const firstVisible = data.docs[0];
      setIsLastPage(isLast);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
      setExamplesIsLoading(false);
    }
  }, [
    curImagesModelVersionId,
    isLastPage,
    lastVisible,
    model.id,
    // nsfwMode,
    uid,
  ]);

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
    if (!!examplesImgData.length) return;

    getImagesFromFirestore();
    //Temp
    // if (curImagesModelVersionId === "unsorted") {
    //   const examples = model.examplesData.map((item, i) => {
    //     return (
    //       <Carousel
    //         key={i}
    //         images={item.items}
    //         visibleImgAmount={1}
    //         // onUpdate={updateImgResData}
    //       />
    //     );
    //   });
    //   setExamplesImgData(model.examplesData);
    //   return;
    // }
    // if (!model.savedImages[curImagesModelVersionId]) {
    //   const latestVersion = Object.keys(model.savedImages)[0];
    //   if (latestVersion) setCurImagesModelVersionId(+latestVersion);
    // }
  }, [
    curImagesModelVersionId,
    curExampleImgsType,
    model,
    examplesImgData,
    getImagesFromFirestore,
  ]);

  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !examplesIsLoading &&
      !errorMessage &&
      !!examplesImgData.length
    ) {
      setExamplesIsLoading(true);
      if (curExampleImgsType === "all") {
        // console.log("INTERSECT", isIntersecting);
        // console.log(nextCursor);
        clearTimeout(getImageTimeout);
        getImageTimeout = setTimeout(() => {
          getallExamples(model.id, curImagesModelVersionId, nextCursor);
        }, 1000);
      } else if (curExampleImgsType === "saved") {
        clearTimeout(getImageTimeout);
        getImageTimeout = setTimeout(() => {
          getImagesFromFirestore();
        }, 500);
        console.log("INT", isIntersecting);
      }
    }
  }, [
    isIntersecting,
    isLastPage,
    examplesImgData.length,
    curExampleImgsType,
    getImagesFromFirestore,
    curImagesModelVersionId,
    errorMessage,
    examplesIsLoading,
    getallExamples,
    model.id,
    nextCursor,
  ]);

  useEffect(() => {
    if (curExampleImgsType === "saved") return;
    if (Object.keys(model).length === 0) return;

    //Temp
    if (curImagesModelVersionId === "unsorted") return;
    if (!curImagesModelVersionId) return;
    // if (examplesImages.length) return;
    if (!currCursor && !examplesImgData.length)
      getallExamples(model.id, curImagesModelVersionId, currCursor);
  }, [
    model,
    curExampleImgsType,
    curImagesModelVersionId,
    currCursor,
    nsfwMode,
    getallExamples,
    examplesImgData.length,
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

      return sortedExamples[key];
      // return (
      //   <div key={i}>
      //     <Carousel
      //       images={sortedExamples[key]}
      //       visibleImgAmount={1}
      //       existedImgsAmount={existedExample?.amount || null}
      //       postId={postId}
      //       modelId={model.id}
      //       versionId={curImagesModelVersionId}
      //     />
      //   </div>
      // );
    });

    // console.log(examples);

    const sortedExamplesArrWithSortedImgs = examples.map((post) => {
      // console.log(post);
      return post.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
    });

    setExamplesImgData(sortedExamplesArrWithSortedImgs);
  };

  useEffect(sortExampleImages, [
    examplesImages,
    model,
    curExampleImgsType,
    curImagesModelVersionId,
  ]);

  const nextPageHandler = () => {
    if (curExampleImgsType === "all") {
      getallExamples(model.id, curImagesModelVersionId, nextCursor);
    } else {
    }
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

  useEffect(() => {
    let examples;
    if (curExampleImgsType === "saved") {
      examples = examplesImgData.flatMap((item, i) => {
        if (!nsfwMode && item.nsfw) return [];
        return (
          <Carousel
            key={i}
            versionId={curImagesModelVersionId}
            images={item}
            visibleImgAmount={1}
            // onUpdate={updateImgResData}
          />
        );
      });
    } else {
      examples = examplesImgData.map((item, i) => {
        // console.log(item);
        const existedExample =
          model?.savedImages?.hasOwnProperty(curImagesModelVersionId) &&
          model?.savedImages[`${curImagesModelVersionId}`]?.find(
            (img) => img?.postId === +item[0]?.postId
          );
        const postId =
          existedExample && existedExample.amount >= item.length
            ? ""
            : item[0]?.postId;

        return (
          <Carousel
            key={i}
            images={item}
            visibleImgAmount={1}
            existedImgsAmount={existedExample?.amount || null}
            postId={postId}
            modelId={model.id}
            versionId={curImagesModelVersionId}
          />
        );
      });
    }

    setExamplesHtml(examples);
  }, [
    curExampleImgsType,
    curImagesModelVersionId,
    examplesImgData,
    model,
    nsfwMode,
  ]);

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
      {examplesIsLoading && <Spinner />}
      {errorMessage && <div>{errorMessage}</div>}
      {!examplesIsLoading && (
        <div>
          {/* {nextCursor && curExampleImgsType === "all" && (
            <button onClick={nextPageHandler}>next</button>
          )}
          {!isLastPage && curExampleImgsType !== "all" && (
            <button onClick={getImagesFromFirestore}>more</button>
          )} */}
          {errorMessage && !nextCursor && curExampleImgsType === "all" && (
            <button onClick={retryImageLoadingHandler}>Retry</button>
          )}
        </div>
      )}
      {!examplesIsLoading && !examplesHtml.length && <div>No images found</div>}
      <div ref={endPage}></div>
    </>
  );
};

export default GeneratedImages;
