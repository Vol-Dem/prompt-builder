import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classes from "./Model.module.scss";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Carousel from "../carousel/Carousel";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
import ModelInfo from "../model/info/ModelInfo";
import ModelTags from "../model/tags/ModelTags";
import GeneratedImages from "../model/generated-images/GeneratedImages";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import TagSets from "../model/tag-sets/TagSets";
import { tabActions } from "../../store/tabs";
import Spinner from "../ui/Spinner";
import ButtonSquareAdd from "../ui/ButtonSquareAdd";
import ErrorMessage from "../ui/ErrorMessage";
import ButtonTertiary from "../ui/ButtonTertiary";
import {
  ERROR_MESSAGE_AUTH,
  ERROR_MESSAGE_DEFAULT,
  GUIDE_STEP_OPEN_IMAGE,
  SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV,
  SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../../variables/constants";
import { getVersionImagesFromCiv } from "../../utils/fetchUtils";
import CarouselGuide from "../ui/guide/model/CarouselGuide";
import AddModelToSidePanelGuide from "../ui/guide/model/AddModelToSidePanelGuide";
import { guideActions } from "../../store/guide";
import { AnimatePresence } from "framer-motion";
import ImageSvg from "../../assets/ImageSvg";
import { liveSearch, searchActions } from "../../store/search";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { checkIsInCurrentNsfwRange } from "../../utils/generalUtils";
import NavigationPanel from "../layout/navigation-panel/NavigationPanel";

const firestore = getFirestore(firebaseApp);

const minDescriptionHeight = 300;

const Model = ({ title }) => {
  const [modelPreview, setModelPreview] = useState({});
  const [descHeight, setDescHeight] = useState(null);
  const [showAllVersions, setSHowAllVersions] = useState(false);
  const [descriptionIsOpen, setDescriptionIsOpen] = useState(false);
  const [curCustomVersionData, setCurCustomVersionData] = useState({});
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState(null);
  const [curVersionImagesIsLoading, setCurVersionImagesIsLoading] =
    useState(false);
  const [curVersionImages, setCurVersionImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [defDataIsLoading, setDefDataIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAllHashtags, setShowAllHashtags] = useState(false);
  const [hashtags, setHashtags] = useState([]);
  const { modelId } = useParams();
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const versionsListRef = useRef(null);
  const versionsItemRef = useRef(null);
  let { state } = useLocation();
  const isAuth = useSelector((state) => state.auth.user.uid);
  const uid = useSelector((state) => state.auth.user.uid);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const guideModelIsActive = useSelector((state) => state.guide.model.active);
  const guideHomeActive = useSelector((state) => state.guide.home.active);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const dispatch = useDispatch();
  const descriptionRef = useRef();
  const loadingImagesTimeoutRef = useRef();
  const allHashtags = model?.hashtags?.length
    ? model?.hashtags
    : model?.data?.tags;

  // const allHashtags = useMemo(() => {
  //   return model?.hashtags || model?.data?.tags;
  // }, [model]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const responseCiv = await fetch(`${URL_CIV_MODELS}512412`);

  //       const data = await responseCiv.json();
  //       console.log(data);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
    if (guideIsActive && guideHomeActive) {
      dispatch(guideActions.setGuideActive({ type: "home", value: false }));
    }
  }, [guideIsActive, guideHomeActive, dispatch]);

  useEffect(() => {
    document.title = model?.name || title;

    return () => {
      document.title = "Prompt builder";
    };
  }, [title, model?.name]);

  useEffect(() => {
    if (model?.id) {
      setDescriptionIsOpen(false);
      setDescHeight(null);
    }
  }, [model?.id]);

  const filterNsfwImages = useCallback((images, nsfwLevel) => {
    return images?.filter((image) => {
      if (image?.nsfwLevel) {
        return (
          checkIsInCurrentNsfwRange(nsfwLevel, image.nsfwLevel) ||
          image.nsfwLevel === 1
        );
      } else {
        return image?.nsfw === "None" || image?.nsfw === false;
      }
    });
  }, []);

  useEffect(() => {
    if (
      curVersion?.id &&
      curVersionImages?.versionId === curVersion?.id &&
      curVersionImages?.nsfwLevel !== nsfwLevel
    ) {
      const filteredModelImages = filterNsfwImages(
        curVersionImages?.items,
        nsfwLevel
      );
      setCurVersionImages({
        items: curVersionImages?.items,
        filteredItems: filteredModelImages,
        versionId: curVersion?.id,
        nsfwLevel,
      });
    }
  }, [curVersionImages, curVersion?.id, nsfwLevel, filterNsfwImages]);

  ///////////LOAD DEFAULT IMAGES FROM MODEL
  // const setDefaultVersionImages = useCallback(() => {
  //   const defVersionImages = model?.data?.modelVersions.find(
  //     (version) => version?.id === curVersion?.id
  //   )?.images;
  //   const modelImages = nsfwMode
  //     ? defVersionImages
  //     : filterNsfwImages(defVersionImages);

  //   if (!!defVersionImages?.length) {
  //     setCurVersionImages({
  //       items: defVersionImages || [],
  //       filteredItems: modelImages,
  //       versionId: curVersion?.id,
  //       nsfw: !!nsfwMode,
  //     });
  //   }
  // }, [model, curVersion, nsfwMode, filterNsfwImages]);

  useEffect(() => {
    if (curVersionImages?.versionId === curVersion?.id) return;

    const getCurVersionImages = async () => {
      try {
        setCurVersionImagesIsLoading(true);
        const modelDefImagesRef = doc(
          firestore,
          "models",
          model?.id + "",
          "defaultImages",
          curVersion?.id + ""
        );
        if (loadingImagesTimeoutRef?.current) {
          clearTimeout(loadingImagesTimeoutRef.current);
        }

        const defImagesSnap = await getDoc(modelDefImagesRef);

        if (loadingImagesTimeoutRef?.current) {
          clearTimeout(loadingImagesTimeoutRef.current);
        }

        let curImages;

        if (defImagesSnap.exists()) {
          const versionImages = defImagesSnap.data()?.items;

          if (!versionImages?.length) {
            curImages = model?.data?.modelVersions.find(
              (version) => version?.id === curVersion?.id
            )?.images;
          } else {
            curImages = versionImages;
          }
        } else {
          ///LOAD DEFAULT IMAGES FROM MODEL
          curImages = await getVersionImagesFromCiv(
            model.id,
            model?.data?.creator?.username,
            curVersion
          );
        }
        const modelImages = filterNsfwImages(curImages);

        setCurVersionImages({
          items: curImages,
          filteredItems: modelImages,
          versionId: curVersion?.id,
          nsfw: !!nsfwMode,
        });
        setCurVersionImagesIsLoading(false);
      } catch (err) {
        if (loadingImagesTimeoutRef?.current) {
          clearTimeout(loadingImagesTimeoutRef.current);
        }
        ///LOAD DEFAULT IMAGES FROM MODEL
        setCurVersionImagesIsLoading(false);
        console.error(err.message);
      }
    };

    if (!!model?.id && !!curVersion?.id && !!model?.data) {
      getCurVersionImages();
    }
  }, [
    model,
    curVersion,
    nsfwMode,
    uid,
    curVersionImages?.versionId,
    filterNsfwImages,
  ]);

  useEffect(() => {
    if (!descHeight && descriptionRef?.current?.offsetHeight !== descHeight) {
      setDescHeight(descriptionRef?.current?.offsetHeight);
    }
  }, [descHeight, descriptionRef?.current?.offsetHeight]);

  useEffect(() => {
    if (!isAuth) return;

    const getModelData = async () => {
      try {
        setIsLoading(true);

        dispatch(modelActions.resetModelData());

        const modelRef = doc(firestore, "users", uid, "models", modelId);

        const docSnap = await getDoc(modelRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          dispatch(modelActions.setModelData(data));
          dispatch(modelActions.setModelPreview({}));
          setIsLoading(false);
        } else {
          throw new Error("Failed to load model");
        }
      } catch (err) {
        setErrorMessage("Failed to load model");
        dispatch(modelActions.setErrorMessage(err.message));
        setIsLoading(false);
      }
    };
    getModelData();

    const loadingImagesTimeout = loadingImagesTimeoutRef?.current;
    return () => {
      setErrorMessage("");
      setCurVersionImages({});
      dispatch(modelActions.setCurVersion({}));
      dispatch(modelActions.setModelData({}));
      dispatch(modelActions.setActiveCarouselData({}));
      dispatch(modelActions.resetModelData());
      clearTimeout(loadingImagesTimeout);
    };
  }, [modelId, isAuth, dispatch, uid]);

  const getDefModelDataFromFirestore = useCallback(async () => {
    try {
      const modelDefDataRef = doc(firestore, "models", `${model.id}`);
      const docSnap = await getDoc(modelDefDataRef);

      if (docSnap.exists()) {
        const modelDefData = docSnap.data();

        dispatch(
          modelActions.setModelData({
            data: modelDefData,
          })
        );
      }
      setDefDataIsLoading(false);
    } catch (err) {
      console.log(err.message);
      setErrorMessage(ERROR_MESSAGE_DEFAULT);
      setDefDataIsLoading(false);
    }
  }, [dispatch, model.id]);

  const getDefModelDataFromCivitai = useCallback(async () => {
    try {
      setDefDataIsLoading(true);
      const responseCiv = await fetch(
        `https://civitai.com/api/v1/models/${model.id}`
      );

      const responseData = await responseCiv.json();

      if (!responseData?.id) {
        throw new Error("Civitai failed");
      }

      dispatch(
        modelActions.setModelData({
          data: responseData,
        })
      );
      setDefDataIsLoading(false);
    } catch (err) {
      console.log(err.message);
      getDefModelDataFromFirestore();
    }
  }, [dispatch, model.id, getDefModelDataFromFirestore]);

  useEffect(() => {
    if (!model?.id) return;

    const getDefModelData = async () => {
      try {
        if (SETTINGS_LOAD_DEFAULT_DATA_FROM_CIV) {
          await getDefModelDataFromCivitai();
        } else {
          await getDefModelDataFromFirestore();
        }
      } catch (err) {
        console.log(err.message);
        // getDefModelDataFromFirestore();
      }
    };

    getDefModelData();
  }, [
    model?.id,
    dispatch,
    getDefModelDataFromFirestore,
    getDefModelDataFromCivitai,
  ]);

  useEffect(() => {
    if (
      !Object.keys(model).length ||
      !model?.modelVersionsCustomData ||
      !model?.data
    )
      return;

    let curVersionId;
    const modelVersions = model?.data?.modelVersions
      .filter((version) =>
        Object.keys(model?.modelVersionsCustomData).includes(`${version.id}`)
      )
      .sort((a, b) => a?.index - b?.index)
      .map((version) => {
        return {
          ...version,
          id: version.id,
          name: version.name,
        };
      });

    if (
      state?.versionId &&
      !!modelVersions?.find((version) => version.id === state?.versionId)
    ) {
      curVersionId = state?.versionId;
    } else {
      curVersionId = modelVersions?.find(
        (version) =>
          model?.modelVersionsCustomData.hasOwnProperty(version.id) &&
          model.modelVersionsCustomData[version.id].downloadStatus
      )?.id;
    }

    const curVersionData = curVersionId
      ? modelVersions?.find((version) => version.id === curVersionId)
      : modelVersions[0];

    if (model.id !== curVersion?.modelId) {
      dispatch(
        modelActions.setCurVersion({ ...curVersionData, modelId: model.id })
      );
    }
  }, [model, dispatch, curVersion?.modelId, state?.versionId]);

  useEffect(() => {
    if (!curVersion?.baseModel || !model.id) return;

    const curVersionCustomData = model.modelVersionsCustomData[curVersion.id];
    const modelPreviewData = {
      id: model?.id,
      src: model?.src,
      main: model?.main,
      sub: model?.sub,
      title: model.name || model.title || model?.data?.name,
      versionName:
        curVersionCustomData?.name ||
        curVersionCustomData?.versionName ||
        curVersion.name,
      imgUrl: curVersionImages?.items?.length
        ? curVersionImages?.items[0]?.url
        : "",
      modelType: model?.data?.type,
      baseModel: curVersion?.baseModel,
      mainTag:
        curVersionCustomData?.mainTag ||
        model?.mainTag ||
        curVersionCustomData?.defActTag,
      weight: curVersionCustomData?.weight || model?.defaultCustomData?.weight,
      minWeight:
        curVersionCustomData?.minWeight || model?.defaultCustomData?.minWeight,
      maxWeight:
        curVersionCustomData?.maxWeight || model?.defaultCustomData?.maxWeight,
      size: curVersionCustomData?.size || model?.defaultCustomData?.size,
      tags: curVersionCustomData?.trainedWords || curVersion?.trainedWords,
      helperTags:
        curVersionCustomData?.helperTags ||
        model?.defaultCustomData?.helperTags,
      updatedAt: model?.updatedAt,
    };

    setModelPreview(modelPreviewData);
    const curCustomVersion = model.modelVersionsCustomData[curVersion.id];
    setCurCustomVersionData(curCustomVersion);

    if (!curImagesModelVersionId)
      setCurImagesModelVersionId(curCustomVersion?.versionId || curVersion.id);
  }, [model, curVersion, curImagesModelVersionId, curVersionImages]);

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/");
  };

  const openVersionHandler = (e) => {
    const id = +e.target.id;
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id
    );

    dispatch(modelActions.setCurVersion({ ...curVer, modelId: model.id }));
  };

  const modelVersionsHtml =
    model?.modelVersionsCustomData &&
    Object.values(model?.modelVersionsCustomData)
      ?.sort((a, b) => a?.index - b?.index)
      .map((version, i) => {
        return (
          <li
            key={i}
            ref={versionsItemRef}
            id={version.versionId}
            data-version={i}
            onClick={openVersionHandler}
            className={`${classes.version} ${
              curVersion?.id === version.versionId
                ? classes["version--active"]
                : ""
            }
        ${version?.downloadStatus ? classes["version--downloaded"] : ""}`}
          >
            {version.name}
          </li>
        );
      });

  const subCatsHtml = useMemo(() => {
    return model?.sub?.flatMap((sub, i) => {
      const subcategoryName = categories[model?.modelType]
        ?.find((category) => category.id === model?.main)
        ?.subcategories.find((subcategory) => subcategory.id === sub)?.name;

      if (!subcategoryName) {
        return [];
      }

      return (
        <li key={i}>
          <Link
            to="/"
            className={classes["link"]}
            onClick={() => {
              dispatch(tabActions.setCurrentTab(model.modelType));
              dispatch(tabActions.setCurrentCategory(model.main));
              dispatch(tabActions.setCurrentSubcategory(sub));
            }}
          >
            {subcategoryName}
          </Link>
        </li>
      );
    });
  }, [model, categories, dispatch]);

  const openDescriptionHandler = () => {
    setDescriptionIsOpen((prevState) => !prevState);
  };

  const mainCategoryName = useMemo(() => {
    if (!!model?.modelType) {
      const categoryName = categories[model?.modelType]?.find(
        (category) => category.id === model?.main
      )?.name;
      return categoryName;
    }
  }, [categories, model?.main, model?.modelType]);

  const showAllVersionsHandler = () => {
    setSHowAllVersions((prevState) => !prevState);
  };

  const submitSearchHandler = (e) => {
    e.preventDefault();
    dispatch(searchActions.resetSearchData());

    navigate("/search");
    dispatch(
      liveSearch(
        e.target.dataset.value,
        nsfwMode,
        SETTINGS_SEARCH_RESULT_PER_PAGE,
        false,
        false,
        true
      )
    );
  };

  useEffect(() => {
    if (!allHashtags?.length) return;

    const visibleHashtags = showAllHashtags
      ? allHashtags
      : allHashtags.slice(0, SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT);

    setHashtags(visibleHashtags);
  }, [model, showAllHashtags, allHashtags]);

  const modelHashtagsHtml = hashtags?.map((tag, i) => {
    return (
      <li
        key={i}
        className={classes["hashtags__tag"]}
        onClick={submitSearchHandler}
        data-value={tag}
      >
        #{tag}
      </li>
    );
  });

  const showAllHashtagsHandler = () => {
    setShowAllHashtags((prevState) => !prevState);
  };

  return (
    <div>
      {(isLoading || defDataIsLoading) && <Spinner />}
      {!isAuth && <ErrorMessage>{ERROR_MESSAGE_AUTH}</ErrorMessage>}
      {!isLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {!isLoading && !defDataIsLoading && !errorMessage && model?.id && (
        <div className={classes.model}>
          <NavigationPanel onBack={backHandler}>
            <Link
              to="/"
              className={classes["link"]}
              onClick={() => {
                dispatch(tabActions.setCurrentTab(model.modelType));
                dispatch(tabActions.setCurrentCategory(model.main));
              }}
            >
              {mainCategoryName || model?.main}
            </Link>
            <ul className={classes["subcategories"]}>{subCatsHtml}</ul>
          </NavigationPanel>
          <div className={classes["title-container"]}>
            <h1 className={classes.title}>
              {model?.name || model?.data?.name}
            </h1>
            <ButtonSquareAdd previewData={modelPreview} />
            {guideIsActive && <AddModelToSidePanelGuide />}
          </div>
          <div className={classes["versions-container"]}>
            <div
              className={classes.versions}
              style={{
                maxHeight: showAllVersions
                  ? `${versionsListRef?.current?.offsetHeight + 2}px`
                  : `${versionsItemRef?.current?.offsetHeight + 2}px`,
              }}
            >
              <ul ref={versionsListRef} className={classes["versions__list"]}>
                {modelVersionsHtml}
              </ul>
            </div>
            {versionsListRef?.current?.offsetHeight >
              versionsItemRef?.current?.offsetHeight && (
              <ButtonTertiary
                onClick={showAllVersionsHandler}
                className={classes["btn-all"]}
              >
                {showAllVersions ? "Hide" : "Show All"}
              </ButtonTertiary>
            )}
          </div>
          <div
            className={`${classes["img-container"]} ${
              guideIsActive &&
              guideModelIsActive &&
              guideStep === GUIDE_STEP_OPEN_IMAGE
                ? classes["img-container--guide"]
                : ""
            }`}
          >
            <AnimatePresence>
              {!!curVersionImages.filteredItems?.length &&
                !curVersionImagesIsLoading && (
                  <Carousel
                    imagesData={curVersionImages?.filteredItems}
                    versionId={curVersion?.id}
                    saved={false}
                    modelId={model.id}
                    postId={curVersionImages?.filteredItems[0].postId}
                    location="models"
                    locationId={model.id}
                  />
                )}
              {!curVersionImages?.filteredItems?.length &&
                !curVersionImagesIsLoading && (
                  <div className={classes["img-container__placeholder"]}>
                    <ImageSvg className={classes["img-container__svg"]} />
                    <span>Images not found</span>
                  </div>
                )}
            </AnimatePresence>
            {curVersionImagesIsLoading && <Spinner />}
            {guideIsActive && <CarouselGuide />}
          </div>
          {true && (
            <ul className={classes["hashtags"]}>
              {modelHashtagsHtml}{" "}
              {allHashtags?.length > SETTINGS_MODEL_VISIBLE_HASHTAGS_AMOUNT && (
                <li>
                  <button
                    onClick={showAllHashtagsHandler}
                    className={`${classes["hashtags__btn"]} ${
                      classes[
                        !showAllHashtags
                          ? "hashtags__btn--show"
                          : "hashtags__btn--hide"
                      ]
                    }`}
                  >
                    {showAllHashtags ? (
                      <>
                        <ChevronLeftIcon
                          className={classes["hashtags__btn-icon"]}
                        />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <span>Show All</span>
                        <ChevronRightIcon
                          className={classes["hashtags__btn-icon"]}
                        />
                      </>
                    )}
                  </button>
                </li>
              )}
            </ul>
          )}
          <div className={classes["info-container"]}>
            <ModelInfo customData={curCustomVersionData} />
            <ModelTags
              customData={curCustomVersionData}
              modelPreview={modelPreview}
            />
          </div>
          <TagSets
            customVersionData={curCustomVersionData}
            customData={curCustomVersionData?.tagSetsData}
            defaultData={model?.defaultCustomData?.tagSetsData}
          />
          {curVersion?.description && (
            <>
              <h2 className={classes["h2"]}>Version description:</h2>
              <div className={classes.description}>
                {curVersion?.description?.replace(/(<([^>]+)>)/gi, "")}
              </div>
            </>
          )}
          <h2 className={classes["h2"]}>Description:</h2>
          <div
            className={`${classes.description} ${
              descriptionIsOpen ? classes["description--open"] : ""
            } ${
              descHeight > minDescriptionHeight &&
              !descriptionIsOpen &&
              descHeight
                ? classes["description--hidden"]
                : ""
            }`}
            style={{
              maxHeight: `${
                descriptionIsOpen ? descHeight + 100 : minDescriptionHeight
              }px`,
            }}
          >
            <div
              ref={descriptionRef}
              dangerouslySetInnerHTML={{
                __html:
                  model?.defaultCustomData?.description ||
                  model?.data?.description,
              }}
            />
          </div>
          {descHeight > minDescriptionHeight && (
            <span
              className={classes["description__btn-show"]}
              onClick={openDescriptionHandler}
            >
              {!descriptionIsOpen ? "Read more" : "Hide"}
            </span>
          )}
          <h2 className={classes["h2"]}>Generated images:</h2>{" "}
          <GeneratedImages />
        </div>
      )}
    </div>
  );
};

export default Model;
