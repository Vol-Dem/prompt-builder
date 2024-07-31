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
// import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
// import VersionForm from "../forms/version-form/VersionForm";
// import SaveImageForm from "../forms/save-image-form/SaveImageForm";
import ModelInfo from "../model/info/ModelInfo";
import ModelTags from "../model/tags/ModelTags";
import GeneratedImages from "../model/generated-images/GeneratedImages";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import ModelSettings from "../model/model-settings/ModelSettings";
import TagSets from "../model/tag-sets/TagSets";
import { addModelToPanel } from "../../store/usedModels";
import { getModelsPreview, tabActions } from "../../store/tabs";
import Spinner from "../ui/Spinner";
import ButtonAdd from "../ui/ButtonAdd";
import ImageCard from "../image-card/ImageCard";
import Buttton from "../ui/Button";
import CrossSvg from "../../assets/CrossSvg";
import ErrorMessage from "../ui/ErrorMessage";
import ButtonTertiary from "../ui/ButtonTertiary";
import ErrorPage from "./ErrorPage";
import { AUTH_ERROR_MESSAGE } from "../../variables/constants";

const firestore = getFirestore(firebaseApp);

const minDescriptionHeight = 300;

const Model = ({ title }) => {
  const [modelPreview, setModelPreview] = useState({});
  const [descHeight, setDescHeight] = useState(null);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [showAllVersions, setSHowAllVersions] = useState(false);
  const [descriptionIsOpen, setDescriptionIsOpen] = useState(false);
  // const [currVersionIndex, setCurrVersionIndex] = useState(null);
  const [curCustomVersionData, setCurCustomVersionData] = useState({});
  const [curImagesModelVersionId, setCurImagesModelVersionId] = useState(null);
  const [curVersionImages, setCurVersionImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { modelId } = useParams();
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const versionsListRef = useRef(null);
  const versionsItemRef = useRef(null);
  let { state } = useLocation();

  // const activeCarouselData = useSelector(
  //   (state) => state.model.activeCarouselData
  // );
  // const activeCarouselHtml = (
  //   <div>
  //     <Carousel
  //       images={activeCarouselData?.images}
  //       versionId={activeCarouselData.curVersion}
  //       existedImgsAmount={activeCarouselData?.existedImgsAmount || null}
  //       postId={activeCarouselData.postId}
  //       modelId={activeCarouselData.modelId}
  //       visibleImgAmount={1}
  //       isOpen={true}
  //     />
  //   </div>
  // );
  // const errorMessage = useSelector((state) => state.model.errorMessage);
  const isAuth = useSelector((state) => state.auth.user.uid);
  const uid = useSelector((state) => state.auth.user.uid);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();
  const descriptionRef = useRef();
  // const descriptionHeight = useRef()

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

  const filterNsfwImages = useCallback((images) => {
    return images?.filter(
      (image) =>
        image?.nsfw === "None" || image?.nsfwLevel <= 1 || image?.nsfw === false
    );
  }, []);

  useEffect(() => {
    if (
      curVersionImages?.versionId === curVersion?.id &&
      curVersionImages?.nsfw !== !!nsfwMode
    ) {
      const filteredModelImages = !!nsfwMode
        ? curVersionImages?.items
        : filterNsfwImages(curVersionImages?.items);
      console.log("FILETRED IMAGES", filteredModelImages);
      console.log(curVersionImages);
      setCurVersionImages({
        items: curVersionImages?.items,
        filteredItems: filteredModelImages,
        versionId: curVersion?.id,
        nsfw: !!nsfwMode,
      });
    }
  }, [curVersionImages, curVersion?.id, nsfwMode, filterNsfwImages]);

  useEffect(() => {
    if (curVersionImages?.versionId === curVersion?.id) return;
    // const modelImages = nsfwMode
    //   ? curVersion?.images
    //   : filterNsfwImages(curVersion?.images);

    // setCurVersionImages({ items: modelImages, versionId: curVersion?.id });

    const getCurVersionImages = async () => {
      try {
        console.log("GET CUR VER IMAGES");
        console.log(uid);
        console.log(model?.id);
        console.log(curVersion?.id);
        const modelDefImagesRef = doc(
          firestore,
          "models",
          model?.id + "",
          "defaultImages",
          curVersion?.id + ""
        );

        const docSnap = await getDoc(modelDefImagesRef);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const curImages = docSnap.data()?.items;
          console.log(curImages);

          const modelImages = nsfwMode
            ? curImages
            : filterNsfwImages(curImages);

          console.log(modelImages);
          setCurVersionImages({
            items: curImages,
            filteredItems: modelImages,
            versionId: curVersion?.id,
            nsfw: !!nsfwMode,
          });
        } else {
          console.log("NO DEF IMAGES");
          console.log(curVersion);
          console.log(curVersion.images);
          const defVersionImages = model?.data?.modelVersions.find(
            (version) => version?.id === curVersion?.id
          )?.images;
          const modelImages = nsfwMode
            ? defVersionImages
            : filterNsfwImages(defVersionImages);

          if (!!defVersionImages?.length) {
            setCurVersionImages({
              items: defVersionImages || [],
              filteredItems: modelImages,
              versionId: curVersion?.id,
              nsfw: !!nsfwMode,
            });
          }
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    if (!!model?.id && !!curVersion?.id) {
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
      console.log(descriptionRef?.current?.offsetHeight);
      setDescHeight(descriptionRef?.current?.offsetHeight);
    }

    return () => {
      // setDescHeight(null);
    };
  }, [descHeight]);

  useEffect(() => {
    if (!isAuth) return;
    // if (!isAuth || model?.id === +modelId) return;
    let unsub;
    try {
      setIsLoading(true);

      unsub = onSnapshot(
        doc(firestore, "users", uid, "models", modelId),
        (doc) => {
          setErrorMessage("");
          const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
          console.log(source);
          const data = doc.data();
          console.log(data);
          if (!data) {
            setErrorMessage("Failed to load model");
            setIsLoading(false);
            unsub();
            return;
          }
          dispatch(modelActions.setModelData(data));
          dispatch(modelActions.setModelPreview({}));
          setIsLoading(false);
        }
      );
    } catch (err) {
      setErrorMessage("Failed to load model");
      dispatch(modelActions.setErrorMessage(err.message));
      setIsLoading(false);
    }
    return () => {
      // console.log("MODEL RESET");
      setErrorMessage("");
      setCurVersionImages({});
      dispatch(modelActions.setCurVersion({}));
      dispatch(modelActions.setModelData({}));
      dispatch(modelActions.setActiveCarouselData({}));
      dispatch(modelActions.resetModelData());
      if (unsub) {
        unsub();
      }
    };
  }, [modelId, isAuth, dispatch, uid]);

  useEffect(() => {
    if (!model?.id) return;

    const getDefModelData = async () => {
      console.log(model.id);
      const modelDefDataRef = doc(firestore, "models", `${model.id}`);

      const docSnap = await getDoc(modelDefDataRef);

      if (docSnap.exists()) {
        const modelDefData = docSnap.data();
        console.log(modelDefData);

        dispatch(
          modelActions.setModelData({
            data: modelDefData,
          })
        );
      }
    };

    getDefModelData();
  }, [model?.id, dispatch]);

  useEffect(() => {
    if (
      !Object.keys(model).length ||
      !model?.modelVersionsCustomData ||
      !model?.data
    )
      return;
    console.log(state?.versionId);
    let curVersionId;
    // const modelVersions = Object.values(model?.modelVersionsCustomData)
    const modelVersions = model?.data?.modelVersions
      .filter((version) =>
        Object.keys(model?.modelVersionsCustomData).includes(`${version.id}`)
      )
      .sort((a, b) => a?.index - b?.index)
      .map((version) => {
        return {
          ...version,
          // modelId: model.id,
          id: version.id,
          name: version.name,
        };
      });
    console.log(modelVersions);
    console.log(model?.data?.modelVersions);
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
    //  const curVersionId =
    //   state?.versionId ||
    //   modelVersions.find(
    //     (version) =>
    //       model?.modelVersionsCustomData.hasOwnProperty(version.id) &&
    //       model.modelVersionsCustomData[version.id].downloadStatus
    //   )?.id;
    console.log(state?.versionId);
    const curVersionData = curVersionId
      ? modelVersions?.find((version) => version.id === curVersionId)
      : modelVersions[0];
    console.log(curVersionData);
    console.log(modelVersions);
    if (model.id !== curVersion?.modelId)
      dispatch(modelActions.setCurVersion(curVersionData));
  }, [model, dispatch, curVersion?.modelId, state?.versionId]);

  useEffect(() => {
    if (!curVersion?.baseModel || !model.id) return;
    console.log(model);
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
      // imgUrl: curVersion?.images ? curVersion?.images[0]?.url : "",
      imgUrl: curVersionImages?.items?.length
        ? curVersionImages?.items[0]?.url
        : "",
      modelType: model?.data?.type,
      baseModel: curVersion?.baseModel,
      mainTag: curVersionCustomData?.mainTag || model?.mainTag,
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
    // console.log(curVersionCustomData);
    console.log(modelPreviewData);

    setModelPreview(modelPreviewData);
    const curCustomVersion = model.modelVersionsCustomData[curVersion.id];
    // console.log(curCustomVersion);
    // console.log(curCustomVersion?.versionId);
    // console.log(curVersion);
    setCurCustomVersionData(curCustomVersion);

    if (!curImagesModelVersionId)
      setCurImagesModelVersionId(curCustomVersion?.versionId || curVersion.id);
  }, [model, curVersion, curImagesModelVersionId, curVersionImages]);

  useEffect(() => {
    console.log(state);
  }, [state]);

  // useEffect(() => {
  //   if (currVersionIndex === null) return;
  //   dispatch(
  //     modelActions.setCurVersion(model?.data?.modelVersions[currVersionIndex])
  //   );
  // }, [model, currVersionIndex, dispatch]);

  const navigate = useNavigate();
  const backHandler = () => {
    navigate("/");
  };

  const openVersionHandler = (e) => {
    const id = +e.target.id;
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id
    );
    console.log(id);
    console.log(curVer);
    // resetExamples();
    dispatch(modelActions.setCurVersion(curVer));
    // setCurrVersionIndex(e.target.dataset.version);
  };

  const modelImagesHtml = (
    <div id={curVersion?.name}>
      <Carousel
        imagesData={curVersionImages?.filteredItems}
        versionId={curVersion?.id}
        saved={false}
      />
    </div>
  );

  const modelVersionsHtml =
    model?.modelVersionsCustomData &&
    Object.values(model?.modelVersionsCustomData)
      ?.sort((a, b) => a?.index - b?.index)
      .map((version, i) => {
        // const isSaved =
        //   model?.modelVersionsCustomData?.hasOwnProperty(version.id) &&
        //   model?.modelVersionsCustomData[version.id]?.downloadStatus;
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
              // dispatch(getModelsPreview());
            }}
          >
            {subcategoryName || sub}
          </Link>
        </li>
      );
    });
  }, [model, categories, dispatch]);

  const openEditHandler = () => {
    setEditIsOpen((prevState) => !prevState);
  };

  const openDescriptionHandler = () => {
    setDescriptionIsOpen((prevState) => !prevState);
  };

  const addToSidePanelHandler = () => {
    dispatch(addModelToPanel(modelPreview));
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
    <div className={classes.model}>
      {/* <ImageCard /> */}
      {isLoading && <Spinner />}
      {!isAuth && <ErrorMessage>{AUTH_ERROR_MESSAGE}</ErrorMessage>}
      {!isLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {/* {!!activeCarouselData?.images?.length && (
        <div className={classes["active-corousel"]}>{activeCarouselHtml}</div>
      )} */}
      {!isLoading && !errorMessage && model?.id && (
        <>
          <div className={classes["panel"]}>
            <Buttton className={classes["btn-back"]} onClick={backHandler}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              Edit
            </Link>
            {/* <Buttton
              className={`${classes["btn-edit"]} ${
                editIsOpen ? classes["btn-edit--active"] : ""
              }`}
              onClick={openEditHandler}
            >
              {!editIsOpen && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
              {editIsOpen && <CrossSvg />}
              {!editIsOpen ? "Edit" : "Close edit"}
            </Buttton> */}
          </div>
          {editIsOpen && <ModelSettings />}
          <div className={classes["title-container"]}>
            <h1 className={classes.title}>
              {model?.name || model?.data?.name}
            </h1>
            {/* <button
              onClick={addToSidePanelHandler}
              className={classes["btn-add"]}
            >
              +
            </button> */}
            <ButtonAdd previewData={modelPreview} />
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
          {!!curVersionImages.items?.length && modelImagesHtml}
          <div className={classes["info-container"]}>
            <ModelInfo customData={curCustomVersionData} />
            <ModelTags
              customData={curCustomVersionData}
              modelPreview={modelPreview}
            />
          </div>
          <TagSets
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

            {/* {model?.defaultCustomData?.description || 
                model?.data?.description?.replace(/(<([^>]+)>)/gi, "")} */}
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
        </>
      )}
    </div>
  );
};

export default Model;
