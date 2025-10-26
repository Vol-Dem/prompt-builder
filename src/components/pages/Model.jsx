import { useEffect, useMemo, useState } from "react";
import classes from "./Model.module.scss";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
import ModelInfo from "../model/info/ModelInfo";
import ModelTags from "../model/tags/ModelTags";
import GeneratedImages from "../model/generated-images/GeneratedImages";
import TagSets from "../model/tag-sets/TagSets";
import Spinner from "../ui/Spinner";
import ButtonSquareAdd from "../ui/ButtonSquareAdd";
import ErrorMessage from "../ui/ErrorMessage";
import {
  ERROR_MESSAGE_AUTH,
  ERROR_MESSAGE_MODEL_LOAD,
} from "../../variables/constants";
import AddModelToSidePanelGuide from "../ui/guide/model/AddModelToSidePanelGuide";
import { guideActions } from "../../store/guide";
import ModelDefImages from "../model/model-def-images/ModelDefImages";
import ModelVersionDescription from "../model/model-version-description/ModelVersionDescription";
import ModelNavigationPanel from "../model/model-navigation-panel/ModelNavigationPanel";
import Hashtags from "../hashtags/Hashtags";
import ModelDescription from "../model/description/ModelDescription";
import ModelVersionsList from "../model/model-versions-list/ModelVersionsList";
import { fetchModelData } from "../../utils/fetch/fetchModel";
import {
  createModelPreviewData,
  getCurrentVersionId,
  sortModelVersions,
} from "../../utils/modelUtils";

const Model = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { modelId } = useParams();
  const [searchParams] = useSearchParams();
  const versionIdParam = searchParams.get("versionId");
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const isAuth = useSelector((state) => state.auth.user.uid);
  const guideHomeActive = useSelector((state) => state.guide.home.active);
  const guideIsActive = useSelector((state) => state.guide.active);
  const dispatch = useDispatch();
  const hashtags = model?.hashtags?.length
    ? model?.hashtags
    : model?.data?.tags;
  let curCustomVersionData;

  if (model?.id && curVersion?.id) {
    curCustomVersionData = model?.modelVersionsCustomData[curVersion.id];
  }

  useEffect(() => {
    if (guideIsActive && guideHomeActive) {
      dispatch(guideActions.setGuideActive({ type: "home", value: false }));
    }
  }, [guideIsActive, guideHomeActive, dispatch]);

  useEffect(() => {
    if (!isAuth) return;

    const getModelData = async () => {
      try {
        setIsLoading(true);
        dispatch(modelActions.resetModelData());

        const modelData = await fetchModelData(modelId);

        dispatch(modelActions.setModelData(modelData));

        document.title = modelData?.name || title;
        setIsLoading(false);
      } catch (err) {
        setErrorMessage(ERROR_MESSAGE_MODEL_LOAD);
        dispatch(modelActions.setErrorMessage(err.message));
        setIsLoading(false);
      }
    };
    getModelData();

    return () => {
      setErrorMessage("");
      dispatch(modelActions.setActiveCarouselData({}));
      dispatch(modelActions.resetModelData());
      document.title = "Prompt builder";
    };
  }, [modelId, isAuth, dispatch, title]);

  useEffect(() => {
    if (!model?.modelVersionsCustomData || !model?.data) return;

    const modelVersions = sortModelVersions(model);
    const curVersionId = getCurrentVersionId(
      model,
      modelVersions,
      versionIdParam
    );

    const curVersionData = curVersionId
      ? modelVersions?.find((version) => version.id === curVersionId)
      : modelVersions[0];

    if (model.id !== curVersion?.modelId) {
      dispatch(
        modelActions.setCurVersion({ ...curVersionData, modelId: model.id })
      );
    }
  }, [model, dispatch, curVersion?.modelId, versionIdParam]);

  const modelPreview = useMemo(() => {
    return createModelPreviewData(model, curVersion, curCustomVersionData);
  }, [model, curVersion, curCustomVersionData]);

  const openVersionHandler = (e) => {
    const id = +e.target.id;
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id
    );

    dispatch(modelActions.setCurVersion({ ...curVer, modelId: model.id }));
  };

  return (
    <div>
      {!isLoading && !errorMessage && model?.id && (
        <div className={classes.model}>
          <ModelNavigationPanel />
          <div className={classes["title-container"]}>
            <h1 className={classes.title}>
              {model?.name || model?.data?.name}
            </h1>
            <ButtonSquareAdd previewData={modelPreview} />
            {guideIsActive && <AddModelToSidePanelGuide />}
          </div>
          <ModelVersionsList
            onClick={openVersionHandler}
            itemComponent={Link}
            versionsCustomData={model?.modelVersionsCustomData}
            curVersionId={curVersion?.id}
          />
          <ModelDefImages />
          {!!hashtags?.length && <Hashtags hashtags={hashtags} />}
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
          <ModelVersionDescription />
          <h2 className={classes["h2"]}>Description:</h2>
          <ModelDescription />
          <h2 className={classes["h2"]}>Generated images:</h2>{" "}
          <GeneratedImages />
        </div>
      )}
      {isLoading && <Spinner />}
      {!isAuth && <ErrorMessage>{ERROR_MESSAGE_AUTH}</ErrorMessage>}
      {!isLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
    </div>
  );
};

export default Model;
