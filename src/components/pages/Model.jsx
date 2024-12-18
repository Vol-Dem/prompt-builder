import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import ButtonAdd from "../ui/ButtonAdd";
import Buttton from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import ButtonTertiary from "../ui/ButtonTertiary";
import {
  ERROR_MESSAGE_AUTH,
  ERROR_MESSAGE_DEFAULT,
  GUIDE_STEP_OPEN_IMAGE,
  URL_CIV_MODELS,
} from "../../variables/constants";
import BackSvg from "../../assets/BackSvg";
import { getVersionImagesFromCiv } from "../../utils/fetchUtils";
import CarouselGuide from "../ui/guide/model/CarouselGuide";
import AddModelToSidePanelGuide from "../ui/guide/model/AddModelToSidePanelGuide";
import { guideActions } from "../../store/guide";
import SettingsSvg from "../../assets/SettingsSvg";
import { AnimatePresence } from "framer-motion";

const firestore = getFirestore(firebaseApp);

const minDescriptionHeight = 300;
// const defImagesTimeotSec = 10;

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
  // const [warningMessage, setWarningMessage] = useState("");
  const { modelId } = useParams();
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
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

  // useEffect(() => {
  //   return () => {
  //     dispatch(modelActions.resetModelData());
  //   };
  // }, [dispatch]);

  useEffect(() => {
    if (model?.id) {
      setDescriptionIsOpen(false);
      setDescHeight(null);
    }
  }, [model?.id]);

  const filterNsfwImages = useCallback((images) => {
    return images?.filter((image) => {
      if (image?.nsfwLevel) {
        return image?.nsfwLevel <= 1 || image?.nsfwLevel === "None";
      } else {
        return image?.nsfw === "None" || image?.nsfw === false;
      }
    });
  }, []);

  useEffect(() => {
    if (
      curVersion?.id &&
      curVersionImages?.versionId === curVersion?.id &&
      curVersionImages?.nsfw !== !!nsfwMode
    ) {
      const filteredModelImages = !!nsfwMode
        ? curVersionImages?.items
        : filterNsfwImages(curVersionImages?.items);
      setCurVersionImages({
        items: curVersionImages?.items,
        filteredItems: filteredModelImages,
        versionId: curVersion?.id,
        nsfw: !!nsfwMode,
      });
    }
  }, [curVersionImages, curVersion?.id, nsfwMode, filterNsfwImages]);

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

        // loadingImagesTimeoutRef.current = setTimeout(() => {
        //   setWarningMessage(LONG_LOADING_WARNING_MESSAGE);
        // }, defImagesTimeotSec * 1000);

        const docSnap = await getDoc(modelDefImagesRef);

        if (loadingImagesTimeoutRef?.current) {
          clearTimeout(loadingImagesTimeoutRef.current);
        }

        let curImages;

        if (docSnap.exists()) {
          const versionImages = docSnap.data()?.items;

          if (!versionImages?.length) {
            curImages = model?.data?.modelVersions.find(
              (version) => version?.id === curVersion?.id
            )?.images;
          } else {
            curImages = versionImages;
          }

          // setCurVersionImagesIsLoading(false);
        } else {
          ///LOAD DEFAULT IMAGES FROM MODEL
          // setImageMessage(INITIAL_IMG_LOADING_MESSAGE);
          curImages = await getVersionImagesFromCiv(
            model.id,
            model?.data?.creator?.username,
            curVersion
          );
        }
        const modelImages = nsfwMode ? curImages : filterNsfwImages(curImages);

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
        // setDefaultVersionImages();
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
    // setDefaultVersionImages,
  ]);

  useEffect(() => {
    if (!descHeight && descriptionRef?.current?.offsetHeight !== descHeight) {
      setDescHeight(descriptionRef?.current?.offsetHeight);
    }
  }, [descHeight]);

  useEffect(() => {
    if (!isAuth) return;
    // let unsub;

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

        // unsub = onSnapshot(
        //   doc(firestore, "users", uid, "models", modelId),
        //   (doc) => {
        //     setErrorMessage("");
        //     const data = doc.data();

        //     // console.log(data);
        //     if (!data) {
        //       setErrorMessage("Failed to load model");
        //       setIsLoading(false);
        //       unsub();
        //       return;
        //     }
        //     dispatch(modelActions.setModelData(data));
        //     dispatch(modelActions.setModelPreview({}));
        //     setIsLoading(false);
        //   }
        // );
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
      // if (unsub) {
      //   unsub();
      // }
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

  useEffect(() => {
    if (!model?.id) return;

    const getDefModelData = async () => {
      try {
        setDefDataIsLoading(true);
        const responseCiv = await fetch(
          `https://civitai.com/api/v1/models/${modelId}`
        );

        const responseData = await responseCiv.json();
        // console.log(responseData);

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
    };

    getDefModelData();
  }, [
    model?.id,
    dispatch,
    model?.data?.id,
    modelId,
    getDefModelDataFromFirestore,
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

    if (model.id !== curVersion?.modelId)
      dispatch(modelActions.setCurVersion(curVersionData));
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

    dispatch(modelActions.setCurVersion(curVer));
  };

  const modelImagesHtml = (
    <Carousel
      imagesData={curVersionImages?.filteredItems}
      versionId={curVersion?.id}
      saved={false}
    />
  );

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
    return model?.sub?.map((sub, i) => {
      const subcategoryName =
        categories[model?.modelType]
          ?.find((category) => category.id === model?.main)
          ?.subcategories.find((subcategory) => subcategory.id === sub)?.name ||
        sub;
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
            {subcategoryName || sub}
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

  return (
    <div>
      {(isLoading || defDataIsLoading) && <Spinner />}
      {!isAuth && <ErrorMessage>{ERROR_MESSAGE_AUTH}</ErrorMessage>}
      {!isLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {!isLoading && !defDataIsLoading && !errorMessage && model?.id && (
        <div className={classes.model}>
          <div className={classes["panel"]}>
            <Buttton className={classes["btn-back"]} onClick={backHandler}>
              <BackSvg />

              <span>Back</span>
            </Buttton>
            <div className={classes.categories}>
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
            </div>
            <Link className={`${classes["btn-edit"]}`} to="edit">
              <SettingsSvg />
              Edit
            </Link>
          </div>
          <div className={classes["title-container"]}>
            <h1 className={classes.title}>
              {model?.name || model?.data?.name}
            </h1>
            <ButtonAdd previewData={modelPreview} />
            {guideIsActive && <AddModelToSidePanelGuide />}
          </div>
          <div
            className={classes.versions}
            style={{
              maxHeight: showAllVersions
                ? `${versionsListRef?.current?.offsetHeight}px`
                : `${versionsItemRef?.current?.offsetHeight + 1}px`,
            }}
          >
            <ul ref={versionsListRef} className={classes["versions__list"]}>
              {modelVersionsHtml}
            </ul>
          </div>

          {versionsListRef?.current?.offsetHeight >
            versionsItemRef?.current?.offsetHeight + 1 && (
            <ButtonTertiary onClick={showAllVersionsHandler}>
              {showAllVersions ? "Hide" : "Show All"}
            </ButtonTertiary>
          )}
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
                !curVersionImagesIsLoading &&
                modelImagesHtml}
            </AnimatePresence>
            {curVersionImagesIsLoading && <Spinner />}
            {guideIsActive && <CarouselGuide />}
          </div>

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
                __html: model?.defaultCustomData?.description,
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

          <h2 className={classes["h2"]}>Generated images:</h2>
          <GeneratedImages customData={curCustomVersionData} />
        </div>
      )}
    </div>
  );
};

export default Model;
