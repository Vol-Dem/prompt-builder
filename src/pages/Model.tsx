import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import classes from "./Model.module.scss";
import { modelActions } from "../store/model";
import { guideActions } from "../store/guide";
import { fetchModelData } from "../utils/fetch/fetchModel";
import {
  createModelPreviewData,
  getInitialVersionData,
} from "../utils/modelUtils";
import {
  DEFAULT_PAGE_TITLE,
  ERROR_MESSAGE_AUTH,
  ERROR_MESSAGE_MODEL_LOAD,
} from "../variables/constants";
import ModelInfo from "../components/model/model-info/ModelInfo";
import ModelTags from "../components/model/tags/ModelTags";
import GeneratedImages from "../components/model/generated-images/GeneratedImages";
import TagSets from "../components/model/tag-sets/TagSets";
import Spinner from "../components/ui/Spinner";
import ButtonSquareAdd from "../components/general-elements/button-square-add/ButtonSquareAdd";
import ErrorMessage from "../components/ui/ErrorMessage";
import AddModelToSidePanelGuide from "../components/general-elements/guide/model/AddModelToSidePanelGuide";
import ModelDefImages from "../components/model/model-def-images/ModelDefImages";
import ModelVersionDescription from "../components/model/model-version-description/ModelVersionDescription";
import ModelNavigationPanel from "../components/model/model-navigation-panel/ModelNavigationPanel";
import Hashtags from "../components/general-elements/hashtags/Hashtags";
import ModelDescription from "../components/model/model-description/ModelDescription";
import ModelVersionsList from "../components/model/model-versions-list/ModelVersionsList";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { handleErrors, normalizeError } from "../utils/generalUtils";

interface ModelPageProps {
  title: string;
}

/**
 * Model page.
 *
 * High-level route responsible for displaying a model and its versions.
 *
 * Responsibilities:
 * - Loads model and user-specific model data from Firestore.
 * - Synchronizes active model version with the `versionId` URL parameter.
 * - Selects a default version when no version is specified.
 * - Coordinates version switching without leaving the page.
 * - Manages page-level loading, error, and empty states.
 * - Integrates onboarding/guide flow side effects.
 * - Updates the document title based on the active model.
 *
 * Side effects:
 * - Fetches model data on route change.
 * - Updates Redux model and guide state.
 * - Sets and restores `document.title`.
 *
 * @component
 *
 * @param props
 * @param props.title - Fallback page title used before model data is loaded.
 *
 * @returns Model page.
 */
const Model = ({ title }: ModelPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { modelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const versionIdParam = searchParams.get("versionId");
  const model = useAppSelector((state) => state.model.model);
  const nsfwLevel = useAppSelector((state) => state.general.nsfwLevel);
  const curVersion = useAppSelector((state) => state.model.curVersion);
  const isAuth = useAppSelector((state) => state.auth.user.uid);
  const guideHomeActive = useAppSelector((state) => state.guide.home.active);
  const guideIsActive = useAppSelector((state) => state.guide.active);
  const dispatch = useAppDispatch();
  const hashtags = model?.hashtags?.length
    ? model?.hashtags
    : model?.data?.tags;

  const curCustomVersionData = useMemo(() => {
    if (model?.id && curVersion?.id && model?.modelVersionsCustomData) {
      return model?.modelVersionsCustomData[curVersion.id];
    }
    return null;
  }, [model, curVersion]);

  const modelPreview = useMemo(() => {
    return createModelPreviewData(
      model,
      curVersion,
      curCustomVersionData,
      nsfwLevel,
    );
  }, [model, curVersion, curCustomVersionData]);

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

        if (!modelId) return;

        const modelData = await fetchModelData(modelId);

        dispatch(modelActions.setModelData(modelData));

        document.title = modelData?.name || title;
        setIsLoading(false);
      } catch (error) {
        setErrorMessage(ERROR_MESSAGE_MODEL_LOAD);
        const errorMessage = handleErrors(normalizeError(error));
        dispatch(modelActions.setErrorMessage(errorMessage));
        setIsLoading(false);
      }
    };
    getModelData();

    return () => {
      setErrorMessage("");
      dispatch(modelActions.setActiveCarouselData(null));
      dispatch(modelActions.resetModelData());
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [modelId, isAuth, dispatch, title]);

  const modelIsChanged = model && model.id !== curVersion?.modelId;
  const versionIsChanged =
    model && versionIdParam && curVersion?.modelId !== +versionIdParam;

  useEffect(() => {
    if (modelIsChanged || versionIsChanged) {
      // Selects the initial version data
      const curVersionData = getInitialVersionData(model, versionIdParam);

      if (curVersionData && model) {
        if (!versionIdParam) {
          setSearchParams(() => {
            return {
              versionId: curVersionData.id + "",
            };
          });
        }

        dispatch(
          modelActions.setCurVersion({ ...curVersionData, modelId: model.id }),
        );
      }
    }
  }, [model, dispatch, modelIsChanged, versionIsChanged, versionIdParam]);

  const openVersionHandler = (e: React.MouseEvent<HTMLElement>) => {
    const id = +(e.target as HTMLElement).id;
    const curVer = model?.data?.modelVersions.find(
      (version) => version.id === id,
    );

    if (curVer && model) {
      dispatch(modelActions.setCurVersion({ ...curVer, modelId: model.id }));
    }
  };

  return (
    <div>
      {!isLoading && !errorMessage && model?.id && curVersion && (
        <div className={classes.model}>
          <ModelNavigationPanel />
          <div className={classes["title-container"]}>
            <h1 className={classes.title}>
              {model?.name || model?.data?.name}
            </h1>
            {modelPreview && (
              <ButtonSquareAdd
                resourceType="model"
                previewData={modelPreview}
              />
            )}
            {guideIsActive && <AddModelToSidePanelGuide />}
          </div>
          <ModelVersionsList
            onClick={openVersionHandler}
            itemComponent={Link}
            versionsCustomData={model?.modelVersionsCustomData}
            curVersionId={curVersion?.id}
            modelVersions={model.data?.modelVersions}
          />
          <ModelDefImages />
          {!!hashtags?.length && <Hashtags hashtags={hashtags} />}
          <div className={classes["info-container"]}>
            <ModelInfo customData={curCustomVersionData} />
            {modelPreview && (
              <ModelTags
                customData={curCustomVersionData}
                modelPreview={modelPreview}
              />
            )}
          </div>
          <TagSets
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
