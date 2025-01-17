import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import Modal from "../../ui/Modal";
import SaveImageForm from "../../forms/save-image-form/SaveImageForm";
import Buttton from "../../ui/Button";
import ErrorMessage from "../../ui/ErrorMessage";
import ButtonTertiary from "../../ui/ButtonTertiary";
import usePageEnd from "../../../hooks/use-page-end";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import {
  ERROR_MESSAGE_DEFAULT,
  GUIDE_STEP_GENERATED_IMAGES,
  ERROR_MESSAGE_OFFLINE,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
} from "../../../variables/constants";
import GeneratedImagesGuide from "../../ui/guide/model/GeneratedImagesGuide";
import { AnimatePresence } from "framer-motion";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";
import FolderSvg from "../../../assets/FolderSvg";
import { motion } from "framer-motion";

const firestore = getFirestore(firebaseApp);

const postsPerPage = 16;

const amountPerPage = 100;

const GeneratedImages = memo(({ customData }) => {
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [curExampleImgsType, setCurExampleImgsType] = useState("all");
  const [examplesIsLoading, setExamplesIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [lastVisible, setLastVisible] = useState({});
  const [examplesImages, setExamplesImages] = useState([]);
  const [currCursor, setCurrCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [examplesImgData, setExamplesImgData] = useState([]);
  const [examplesHtml, setExamplesHtml] = useState([]);
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState(null);
  const [imagesSortValue, setImagesSortValue] = useState("Newest");
  // const [amountPerPage, setAmountPerPage] = useState(100);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [addImgModalIsOpen, setAddImgModalIsOpen] = useState(false);
  const [isShowAll, setIsShowAll] = useState(false);
  const [savedImages, setSavedImages] = useState({});
  const model = useSelector((state) => state.model.model);
  const savedImagesData = useSelector((state) => state.model.savedImages);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const uid = useSelector((state) => state.auth.user.uid);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const endPageRef = useRef(null);
  const versionsListRef = useRef(null);
  const versionsItemRef = useRef(null);
  const abortControlerRef = useRef(null);
  const isPageEnd = usePageEnd(600);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);

  const resetExamples = () => {
    setCurrCursor(null);
    setNextCursor(null);
    setExamplesImages([]);
    setExamplesImgData([]);
    setIsLastPage(false);
    setLastVisible({});
    // setCurImagesModelVersionId(null);
  };

  useEffect(() => {
    resetExamples();
    return () => {
      // console.log("RESET");
      // console.log(model.id);
      // console.log(curVersion.id);
      // console.log(curImagesModelVersionId);
      // console.log("RESET");
      resetExamples();
      clearTimeout(timeoutRef.current);
      setCurImagesModelVersionId(null);
      if (abortControlerRef.current) {
        abortControlerRef.current.abort();
      }
    };
  }, [curVersion?.id]);

  useEffect(() => {
    if (model?.id && model.id === savedImagesData?.modelId) {
      setSavedImages(savedImagesData.data);
    } else {
      setSavedImages({});
    }
  }, [model?.id, savedImagesData]);

  useEffect(() => {
    // setIsIntersecting(intersecting);
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);
  useEffect(() => {
    // console.log("LIST", versionsListRef?.current?.offsetHeight);
    // console.log("ITEM", versionsItemRef?.current?.offsetHeight);
    const showAll =
      versionsListRef?.current?.offsetHeight >
      versionsItemRef?.current?.offsetHeight;
    // const showAll =
    //   versionsListRef?.current?.offsetHeight >
    //   versionsItemRef?.current?.offsetHeight + 2;
    setIsShowAll(showAll);
  }, [
    versionsListRef?.current?.offsetHeight,
    versionsItemRef?.current?.offsetHeight,
  ]);

  useEffect(() => {
    resetExamples();
  }, [nsfwMode]);

  useEffect(() => {
    if (curImagesModelVersionId) return;
    if (curImagesModelVersionId === curVersion?.id) return;
    if (curVersion?.id) setCurImagesModelVersionId(curVersion.id);
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
      const sortedExamples = {};
      newExampleImages.forEach((image) => {
        if (sortedExamples.hasOwnProperty(image.postId)) {
          sortedExamples[image.postId].push(image);
        } else {
          sortedExamples[image.postId] = [image];
        }
      });

      if (!sortedExamples) return;

      const sortedExamplesArr = Object.keys(sortedExamples).sort((a, b) => {
        return (
          Date.parse(sortedExamples[b].slice(-1).pop().createdAt) -
          Date.parse(sortedExamples[a].slice(-1).pop().createdAt)
        );
      });

      const examples = sortedExamplesArr.map((key, i) => {
        return sortedExamples[key];
      });

      const sortedExamplesArrWithSortedImgs = examples.map((post) => {
        return post.sort((a, b) => {
          return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        });
      });

      if (versionId === curImagesModelVersionId) {
        setExamplesImgData(sortedExamplesArrWithSortedImgs);
      }
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
        clearTimeout(timeoutRef.current);
        setIsIntersecting(false);
        setErrorMessage("");
        const url = `https://civitai.com/api/v1/images?modelId=${modelId}${
          versionId !== "all-versions" ? `&modelVersionId=${versionId}` : ""
        }${amountPerPage ? `&limit=${amountPerPage}` : ""}${
          imagesSortValue ? `&sort=${imagesSortValue}` : ""
        }${cursor ? `&cursor=${cursor}` : ""}${
          nsfwMode ? `&nsfw=X` : `&nsfw=None`
        }`;

        const imgExampleResponse = await fetch(url, {
          signal: newAbortControler.signal,
        });
        const data = await imgExampleResponse.json();
        // console.log(data);
        if (!data?.items) return;
        setCurrCursor(nextCursor || true);
        if (data.metadata?.nextCursor) {
          setNextCursor(data.metadata.nextCursor);
        } else {
          setIsLastPage(true);
        }

        // Remove dublicate images (fix for civitai bug)
        const dataUniq = data?.items?.filter((obj1, i, arr) => {
          if (!!obj1?.id) {
            return arr.findIndex((obj2) => obj2?.id === obj1?.id) === i;
          } else {
            return true;
          }
        });

        setExamplesImages((prevState) => {
          const newExampleImages = [...dataUniq, ...prevState];
          if (versionId === curImagesModelVersionId) {
            sortExampleImages(newExampleImages, versionId);
          }
          return newExampleImages;
        });

        setExamplesIsLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          // setErrorMessage(err.message);
          setErrorMessage(
            "Failed to connect to Civitai. There may be maintenance going on at the moment. Try again later."
          );
        }
        setExamplesIsLoading(false);
      }
    },
    [
      imagesSortValue,
      nextCursor,
      nsfwMode,
      curImagesModelVersionId,
      sortExampleImages,
    ]
  );

  const getImagesFromFirestore = useCallback(async () => {
    try {
      if (abortControlerRef.current) {
        abortControlerRef.current.abort();
      }
      clearTimeout(timeoutRef.current);

      if (isLastPage) return;
      setExamplesIsLoading(true);

      setIsIntersecting(false);
      setErrorMessage("");

      // const nsfwFilter = !nsfwMode ? [false] : [true, false];

      // {
      //   images: [image1, image2]
      //   hasSfw: true,
      //   // hasNsfw: true,
      // }

      let q;

      if (nsfwMode) {
        q = query(
          // collection(firestore, "users", uid, "models", model.id + "", "images"),
          collection(firestore, "users", uid, "images"),
          // where("versionId", "==", curImagesModelVersionId),
          where("versionsId", "array-contains", curImagesModelVersionId),
          // where("hasSfw", "==", nsfwFilter),
          // where("hasNsfw", "==", nsfwFilter),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(postsPerPage)
        );
      } else {
        // console.log(curImagesModelVersionId);
        q = query(
          // collection(firestore, "users", uid, "models", model.id + "", "images"),
          collection(firestore, "users", uid, "images"),
          // where("versionId", "==", curImagesModelVersionId),
          where("versionsId", "array-contains", curImagesModelVersionId),
          where("hasSfw", "==", true),
          // where("hasNsfw", "==", nsfwFilter),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(postsPerPage)
        );
      }

      const modelImagesSnap = await getDocs(q);

      const isLast =
        !modelImagesSnap.docs.length ||
        modelImagesSnap.docs.length < postsPerPage;

      const data = modelImagesSnap.docs.flatMap((doc, i) => {
        return doc.data();
      });

      // console.log(data);

      const examples = data
        .map((post) => {
          return post.items
            .filter((image) => {
              const saved =
                savedImages.hasOwnProperty(curImagesModelVersionId) &&
                savedImages[curImagesModelVersionId]
                  ?.find((postData) => postData.postId === image.postId)
                  ?.imagesId?.includes(image.id);

              const safe =
                image?.nsfw === "None" ||
                image?.nsfwLevel <= 1 ||
                image?.nsfw === false;

              if (nsfwMode) {
                return saved;
              } else {
                return saved && safe;
              }
            })
            .sort((a, b) => {
              return Date.parse(a.createdAt) - Date.parse(b.createdAt);
            });
        })
        .filter((item) => !!item.length);

      setExamplesImgData((prevState) => [...prevState, ...examples]);

      const lastVisiblePost =
        modelImagesSnap.docs[modelImagesSnap.docs.length - 1];
      if (!isLast) {
        setLastVisible(lastVisiblePost);
      }
      setIsLastPage(isLast);
      setExamplesIsLoading(false);
    } catch (err) {
      setErrorMessage(ERROR_MESSAGE_DEFAULT);
      setExamplesIsLoading(false);
    }
  }, [
    curImagesModelVersionId,
    isLastPage,
    lastVisible,
    savedImages,
    nsfwMode,
    uid,
  ]);

  useEffect(() => {
    if (curExampleImgsType === "all") return;
    // if (!Object.values(savedImages).length) {
    //   setCurExampleImgsType("all");
    //   return;
    // }

    if (!curImagesModelVersionId) return;
    if (!savedImages.hasOwnProperty(curImagesModelVersionId)) {
      const latesVersionId = Object.values(model.modelVersionsCustomData)
        .sort((a, b) => a?.index - b?.index)
        .find((version) =>
          savedImages.hasOwnProperty(version.versionId)
        )?.versionId;
      if (latesVersionId) {
        setCurImagesModelVersionId(latesVersionId);
      }
    }
    if (!examplesImgData.length && !examplesIsLoading && !errorMessage) {
      getImagesFromFirestore();
    }
  }, [
    curImagesModelVersionId,
    curExampleImgsType,
    model,
    examplesImgData,
    getImagesFromFirestore,
    examplesIsLoading,
    errorMessage,
    savedImages,
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
      isOnline &&
      !examplesIsLoading;
    if (true) {
      if (curExampleImgsType === "all" && rule && !!nextCursor) {
        if (currCursor === nextCursor) return;
        setExamplesIsLoading(true);
        setIsIntersecting(false);
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
        timeoutRef.current = setTimeout(() => {
          getImagesFromFirestore();
        }, 1000);
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
    isOnline,
  ]);

  // const nextPageHandler = () => {
  //   if (curExampleImgsType === "all") {
  //     getallExamples(model.id, curImagesModelVersionId, nextCursor);
  //   } else {
  //   }
  // };

  const retryImageLoadingHandler = () => {
    setErrorMessage("");
    getallExamples(model.id, curImagesModelVersionId, nextCursor);
  };

  const modelImageVersionsHtml =
    model?.modelVersionsCustomData &&
    Object.values(model?.modelVersionsCustomData)
      ?.sort((a, b) => a?.index - b?.index)
      .flatMap((version, i) => {
        const isSaved =
          savedImages &&
          Object.keys(savedImages).includes(`${version.versionId}`);
        const versionIsSaved = version.downloadStatus;

        if (curExampleImgsType === "saved" && !isSaved) {
          return [];
        }
        return (
          <li
            key={i}
            ref={versionsItemRef}
            id={version.versionId}
            data-version={i}
            onClick={openSavedVersionImagesHandler}
            className={`${classes.version} ${
              curImagesModelVersionId === version.versionId
                ? classes["version--active"]
                : ""
            }
        ${versionIsSaved ? classes["version--downloaded"] : ""}`}
          >
            {version.name}
          </li>
        );
      });

  useEffect(() => {
    if (
      !!savedImages &&
      curExampleImgsType === "saved" &&
      !!examplesImgData?.length
    ) {
      const savedPostsIds = savedImages[curImagesModelVersionId]?.map(
        (post) => post.postId
      );

      const newExamples = examplesImgData?.filter((image) =>
        savedPostsIds?.includes(image[0]?.postId)
      );
      if (examplesImgData?.length > newExamples?.length) {
        setExamplesImgData(newExamples);
      }
    }
  }, [
    savedImages,
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
            saved={true}
          />
        );
      });
    } else {
      examples = examplesImgData.map((item, i) => {
        const existedExample =
          savedImages?.hasOwnProperty(curImagesModelVersionId) &&
          savedImages[`${curImagesModelVersionId}`]?.find(
            (img) => img?.postId === +item[0]?.postId
          );
        const postId =
          existedExample && existedExample?.imagesId?.length >= item.length
            ? ""
            : item[0]?.postId;

        return (
          <Carousel
            key={i}
            imagesData={item}
            visibleImgAmount={1}
            existedImgsAmount={existedExample?.imagesId?.length || null}
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
    savedImages,
  ]);

  const addImgByIdHandler = () => {
    setAddImgModalIsOpen(true);
  };

  const showAllVersionsHandler = () => {
    setShowAllVersions((prevState) => !prevState);
  };

  return (
    <div className={classes.container}>
      <div className={classes["controls"]}>
        <div className={classes["mode-switch"]}>
          <span
            className={`${classes["btn-mode"]} ${classes["btn-mode--left"]} ${
              curExampleImgsType === "saved" ? classes["btn-mode--active"] : ""
            }`}
            data-example="saved"
            onClick={switchCurExamples}
          >
            Saved
          </span>
          {/* {(model?.examplesData?.length ||
            (savedImages && !!Object.keys(savedImages).length)) && (
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
          )} */}
          <span
            className={`${classes["btn-mode"]} ${classes["btn-mode--right"]} ${
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
        {/* SORT BUG TEMP DISABLED */}
        {/* {curExampleImgsType === "all" && (
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
          </div>
        )} */}
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
          {modelImageVersionsHtml}
        </ul>
      </div>
      {isShowAll && (
        <ButtonTertiary onClick={showAllVersionsHandler}>
          {showAllVersions ? "Hide" : "Show All"}
        </ButtonTertiary>
      )}
      <div
        className={`${classes["images-container"]} ${
          guideIsActive &&
          examplesHtml?.length &&
          guideStep === GUIDE_STEP_GENERATED_IMAGES
            ? classes["images-container--guide"]
            : ""
        }`}
      >
        <GeneratedImagesGuide />
        <div className={classes.images}>{examplesHtml}</div>
      </div>
      {examplesIsLoading && <Spinner />}
      {errorMessage && isOnline && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!examplesIsLoading && (
        <div>
          {errorMessage && !!nextCursor && curExampleImgsType === "all" && (
            <Buttton onClick={retryImageLoadingHandler}>Retry</Buttton>
          )}
        </div>
      )}
      {!examplesIsLoading && !examplesHtml.length && !errorMessage && (
        <motion.div
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          className={classes["notification"]}
        >
          <ExclamationCircleSvg className={classes["notification__svg"]} />
          <span>No images found.</span>
          {curExampleImgsType === "saved" && (
            <span>
              Click{" "}
              <FolderSvg
                className={`${classes["svg"]} ${classes["svg--medium"]}`}
              />{" "}
              at the top left corner of the image to add it to your collection.
            </span>
          )}
        </motion.div>
      )}
      {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
      <div ref={endPageRef}></div>
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
});

export default GeneratedImages;
