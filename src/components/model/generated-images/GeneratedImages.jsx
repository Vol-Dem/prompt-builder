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
import Modal from "../../ui/Modal";
import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
import Buttton from "../../ui/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import ButtonTertiary from "../../ui/ButtonTertiary";
import usePageEnd from "../../../hooks/use-page-end";

const firestore = getFirestore(firebaseApp);

const postsPerPage = 16;

// let timeoutRef.current;

const GeneratedImages = ({ customData }) => {
  const [showAllVersions, setShowAllVersions] = useState(false);
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
  const [amountPerPage, setAmountPerPage] = useState(100);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [addImgModalIsOpen, setAddImgModalIsOpen] = useState(false);
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const uid = useSelector((state) => state.auth.user.uid);
  const endPageRef = useRef(null);
  const versionsListRef = useRef(null);
  const versionsItemRef = useRef(null);
  const abortControlerRef = useRef(null);
  const intersecting = useIntersection(endPageRef, false);
  const isPageEnd = usePageEnd(600);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // setIsIntersecting(intersecting);
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  const resetExamples = () => {
    console.log("RESET");
    setCurrCursor(null);
    setNextCursor(null);
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
      clearTimeout(timeoutRef.current);
      setCurImagesModelVersionId(null);
      if (abortControlerRef.current) {
        abortControlerRef.current.abort();
      }
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

  const sortExampleImages = useCallback(
    (newExampleImages, versionId) => {
      // if (curExampleImgsType === "saved") return;
      // Temp replace with for
      // console.log(examplesImages);
      // const sortedImages = examplesImages.toSorted(
      //   (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      // );
      const sortedExamples = {};
      newExampleImages.forEach((image) => {
        if (sortedExamples.hasOwnProperty(image.postId)) {
          sortedExamples[image.postId].push(image);
        } else {
          sortedExamples[image.postId] = [image];
        }
      });
      // const sortedExamples = examplesImages.reduce((acc, cur) => {
      //   acc.hasOwnProperty(cur.postId)
      //     ? acc[cur.postId].push(cur)
      //     : (acc[cur.postId] = [cur]);
      //   return acc;
      // }, {});

      if (!sortedExamples) return;

      const sortedExamplesArr = Object.keys(sortedExamples).sort((a, b) => {
        return (
          Date.parse(sortedExamples[b][0].createdAt) -
          Date.parse(sortedExamples[a][0].createdAt)
        );
      });

      const examples = sortedExamplesArr.map((key, i) => {
        return sortedExamples[key];
      });

      const sortedExamplesArrWithSortedImgs = examples.map((post) => {
        // console.log(post);
        return post.sort((a, b) => {
          return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        });
      });
      // console.log(Object.values(sortedExamples));
      // console.log("SORT", versionId, curImagesModelVersionId);
      // console.log("SORTED", sortedExamplesArrWithSortedImgs);
      if (versionId === curImagesModelVersionId) {
        setExamplesImgData(sortedExamplesArrWithSortedImgs);
      }
      // setExamplesImgData(sortedExamplesArrWithSortedImgs);
    },
    [curImagesModelVersionId]
  );

  const getallExamples = useCallback(
    async (modelId, versionId, cursor) => {
      try {
        setExamplesIsLoading(true);
        if (abortControlerRef.current) {
          abortControlerRef.current.abort();
        }
        const newAbortControler = new AbortController();
        abortControlerRef.current = newAbortControler;
        // if (versionId !== curImagesModelVersionId) return;
        clearTimeout(timeoutRef.current);
        setIsIntersecting(false);
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
        // const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
        //   versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
        // }${amountPerPage ? `&limit=${amountPerPage}` : ""}${
        //   imagesSortValue ? `&sort=${imagesSortValue}` : ""
        // }${cursor ? `&cursor=${cursor}` : ""}${
        //   nsfwMode ? `&nsfw=X` : `&nsfw=None`
        // }`;

        // const imgExampleResponse = await fetch(url);
        const imgExampleResponse = await fetch(url, {
          signal: newAbortControler.signal,
        });
        const data = await imgExampleResponse.json();
        console.log(data);
        if (!data?.items) return;
        setCurrCursor(nextCursor || true);
        if (data.metadata?.nextCursor) {
          setNextCursor(data.metadata.nextCursor);
        } else {
          setIsLastPage(true);
        }
        // console.log("TEST", versionId, curImagesModelVersionId);
        if (true) {
          setExamplesImages((prevState) => {
            const newExampleImages = [...data?.items, ...prevState];
            // console.log("PREV", prevState);
            // console.log("NEW", newExampleImages);
            if (versionId === curImagesModelVersionId) {
              sortExampleImages(newExampleImages, versionId);
            }
            return newExampleImages;
          });
        }

        setExamplesIsLoading(false);
      } catch (err) {
        console.log(err);
        // console.log(err.message);
        // console.log("ERROR NAME", err.name);
        if (err.name !== "AbortError") {
          setErrorMessage(err.message);
        }
        setExamplesIsLoading(false);
      }
    },
    [
      amountPerPage,
      imagesSortValue,
      nextCursor,
      nsfwMode,
      curImagesModelVersionId,
      sortExampleImages,
    ]
  );

  const getImagesFromFirestore = useCallback(async () => {
    console.log("START FB FETCH");
    try {
      if (abortControlerRef.current) {
        abortControlerRef.current.abort();
      }
      clearTimeout(timeoutRef.current);
      // console.log("FB LAST", isLastPage);
      if (isLastPage) return;
      setExamplesIsLoading(true);
      // if (examplesIsLoading) return;
      setIsIntersecting(false);
      setErrorMessage("");

      const nsfwFilter = !nsfwMode ? [false] : [true, false];

      const q = query(
        collection(firestore, "users", uid, "models", model.id + "", "images"),
        where("versionId", "==", curImagesModelVersionId),
        where("nsfwTypes", "array-contains-any", nsfwFilter),
        orderBy("createdAt", "desc"),
        // orderBy("versionId", "desc"),
        // orderBy("savedAt", "desc"),
        startAfter(lastVisible),
        limit(postsPerPage)
      );

      const modelImagesSnap = await getDocs(q);

      // const isLast = modelImagesSnap.docs.length <= postsPerPage;
      const isLast =
        !modelImagesSnap.docs.length ||
        modelImagesSnap.docs.length < postsPerPage;

      // console.log("LAST", isLast);

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
            return post.items.filter(
              (item) =>
                item?.nsfw === "None" ||
                item?.nsfwLevel <= 1 ||
                item?.nsfw === false
            );
          }
        })
        .filter((item) => !!item.length);
      // const examples = data.map((item, i) => item.items);
      // console.log(examples);
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

      const lastVisiblePost =
        modelImagesSnap.docs[modelImagesSnap.docs.length - 1];
      if (!isLast) {
        setLastVisible(lastVisiblePost);
      }
      setIsLastPage(isLast);
      setExamplesIsLoading(false);
      // const firstVisible = data.docs[0];
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
    nsfwMode,
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
    if (curExampleImgsType === "saved") return;
    if (!Object.keys(model).length) return;

    //Temp
    // if (curImagesModelVersionId === "unsorted") return;
    if (!curImagesModelVersionId) return;
    // if (examplesImages.length) return;
    if (!currCursor && !examplesImgData.length) {
      clearTimeout(timeoutRef.current);
      getallExamples(model.id, curImagesModelVersionId, currCursor);
    }
  }, [
    model,
    curExampleImgsType,
    curImagesModelVersionId,
    currCursor,
    nsfwMode,
    getallExamples,
    examplesImgData.length,
  ]);

  useEffect(() => {
    const rule =
      !isLastPage &&
      isIntersecting &&
      !!examplesImgData.length &&
      !errorMessage &&
      !examplesIsLoading;
    if (true) {
      // if (!!examplesImgData.length) {
      // if ((rule && nextCursor) || (rule && !!examplesImgData.length)) {
      // setExamplesIsLoading(true);
      if (curExampleImgsType === "all" && rule && !!nextCursor) {
        if (currCursor === nextCursor) return;
        setExamplesIsLoading(true);
        setIsIntersecting(false);
        // console.log("INTERSECT", isIntersecting);
        // console.log(nextCursor);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          getallExamples(model.id, curImagesModelVersionId, nextCursor);
        }, 1000);
      } else if (
        curExampleImgsType === "saved" &&
        rule &&
        !!examplesImgData.length
      ) {
        setExamplesIsLoading(true);
        clearTimeout(timeoutRef.current);
        setIsIntersecting(false);
        // console.log("START INTERSECTING FETCH");
        timeoutRef.current = setTimeout(() => {
          getImagesFromFirestore();
        }, 1000);
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
    currCursor,
  ]);

  // useEffect(sortExampleImages, [
  //   examplesImages,
  //   model,
  //   curExampleImgsType,
  //   curImagesModelVersionId,
  // ]);

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
        <li
          key={i}
          ref={versionsItemRef}
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
        </li>
      );
    }
  );

  // const deletePostHandler = useCallback(
  //   (id) => {
  //     // const newExamples = examplesImgData.filter(
  //     //   (image) => image[0].postId !== id
  //     // );
  //     // setExamplesImgData(newExamples);
  //   },
  //   [examplesImgData]
  // );

  useEffect(() => {
    if (
      !!model?.savedImages &&
      curExampleImgsType === "saved" &&
      !!examplesImgData?.length
    ) {
      const savedPostsIds = model?.savedImages[curImagesModelVersionId]?.map(
        (post) => post.postId
      );
      // console.log("IDS", savedPostsIds);
      const newExamples = examplesImgData?.filter((image) =>
        savedPostsIds?.includes(image[0]?.postId)
      );
      if (examplesImgData?.length > newExamples?.length) {
        setExamplesImgData(newExamples);
      }
    }
  }, [
    model.savedImages,
    curImagesModelVersionId,
    curExampleImgsType,
    examplesImgData,
  ]);

  useEffect(() => {
    let examples;
    if (curExampleImgsType === "saved") {
      examples = examplesImgData.flatMap((item, i) => {
        if (!nsfwMode && item.nsfw) return [];
        return (
          <Carousel
            key={i}
            versionId={curImagesModelVersionId}
            imagesData={item}
            visibleImgAmount={1}
            modelId={model.id}
            // onDelete={deletePostHandler}
            saved={true}
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
            imagesData={item}
            visibleImgAmount={1}
            existedImgsAmount={existedExample?.amount || null}
            postId={postId}
            saved={!postId}
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
    // deletePostHandler,
  ]);

  const addImgByIdHandler = () => {
    setAddImgModalIsOpen(true);
  };

  const showAllVersionsHandler = () => {
    setShowAllVersions((prevState) => !prevState);
  };

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
        <Buttton className={classes["button-add"]} onClick={addImgByIdHandler}>
          Add Image by ID
        </Buttton>
        {curExampleImgsType === "all" && (
          <div className={classes.sort}>
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
            {/* <select
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
            </select> */}
          </div>
        )}
      </div>
      <div
        className={classes["versions"]}
        style={{
          maxHeight: showAllVersions
            ? `${versionsListRef?.current?.offsetHeight + 2}px`
            : `${versionsItemRef?.current?.offsetHeight + 2}px`,
        }}
      >
        <ul ref={versionsListRef} className={classes["versions__list"]}>
          {/* {curExampleImgsType !== "saved" && (
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
          )} */}
          {modelImageVersionsHtml}
        </ul>
      </div>
      {versionsListRef?.current?.offsetHeight >
        versionsItemRef?.current?.offsetHeight + 2 && (
        <ButtonTertiary onClick={showAllVersionsHandler}>
          {showAllVersions ? "Hide" : "Show All"}
        </ButtonTertiary>
      )}
      <div className={classes.images}>{examplesHtml}</div>
      {examplesIsLoading && <Spinner />}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!examplesIsLoading && (
        <div>
          {/* {nextCursor && curExampleImgsType === "all" && (
            <button onClick={nextPageHandler}>next</button>
          )}
          {!isLastPage && curExampleImgsType !== "all" && (
            <button onClick={getImagesFromFirestore}>more</button>
          )} */}
          {errorMessage && !!nextCursor && curExampleImgsType === "all" && (
            <Buttton onClick={retryImageLoadingHandler}>Retry</Buttton>
          )}
        </div>
      )}
      {!examplesIsLoading && !examplesHtml.length && !errorMessage && (
        <div>No images found</div>
      )}
      <div ref={endPageRef}></div>
      {addImgModalIsOpen && (
        <Modal
          title="Add images by ID"
          onClose={() => {
            setAddImgModalIsOpen(false);
          }}
        >
          <SaveImageForm
            modelData={model}
            curVersion={curImagesModelVersionId}
          />
        </Modal>
      )}
    </>
  );
};

export default GeneratedImages;
