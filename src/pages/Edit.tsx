import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { modelActions } from "../store/model";
import { guideActions } from "../store/guide";
import {
  fetchPublicModel,
  subscribeToUserModel,
} from "../utils/fetch/fetchModelReads";
import {
  ERROR_MESSAGE_DEFAULT,
  ERROR_MESSAGE_MODEL_LOAD,
  GUIDE_STEP_MODEL_EDIT,
} from "../variables/constants";
import ModelSettings from "../components/model/model-settings/ModelSettings";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import Modal from "../components/ui/Modal";
import OutroGuide from "../components/general-elements/guide/OutroGuide";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import type { CivitaiModelDoc } from "../../shared/types/firestore";
import usePageTitle from "../hooks/use-page-title";
import { handleErrors, normalizeError } from "../utils/generalUtils";

interface ModelEditProps {
  title: string;
}

/**
 * Model edit page.
 *
 * High-level route responsible for displaying a model editing forms.
 *
 * Responsibilities:
 * - Loads model data from Firestore.
 * - Keeps user model data in sync across browser tabs.
 * - Manages page-level loading and error states.
 * - Updates the document title based on the active collection.
 * - Integrates onboarding and guide flows.
 *
 * Data synchronization:
 * - Subscribes to the user's model document using `onSnapshot` to reflect
 *   live changes from other tabs and prevent overwriting.
 * - Fetches the base model data separately from the public `models` collection
 *   and merges it with user-specific edits.
 *
 * Side effects:
 * - Subscribes to Firestore on mount and cleans up on unmount.
 * - Updates Redux model state.
 * - Sets and restores `document.title`.
 *
 * @component
 *
 * @param props
 * @param props.title - Fallback page title used before model data is loaded.
 *
 * @returns Model edit page.
 */
const ModelEdit = ({ title }: ModelEditProps) => {
  const [pageTitle, setPageTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isAuth = useAppSelector((state) => state.auth.user.uid);
  const uid = useAppSelector((state) => state.auth.user.uid);
  const modelGuideState = useAppSelector((state) => state.guide.model);
  const guideOutroIsActive = useAppSelector(
    (state) => state.guide.outroIsActive,
  );
  const { modelId } = useParams();
  const dispatch = useAppDispatch();
  usePageTitle(pageTitle);

  useEffect(() => {
    if (
      modelGuideState?.active &&
      modelGuideState?.step === GUIDE_STEP_MODEL_EDIT
    ) {
      dispatch(guideActions.setGuideActive({ type: "model", value: false }));
      dispatch(guideActions.setGuideActive({ type: "edit", value: true }));
    }
  }, [modelGuideState, dispatch]);

  useEffect(() => {
    setPageTitle(title);
    if (!isAuth || !modelId) return;

    let isCurrent = true;
    let unsub: () => void;

    const handleModelError = (error: unknown) => {
      if (!isCurrent) return;
      handleErrors(normalizeError(error));
      setErrorMessage(ERROR_MESSAGE_MODEL_LOAD);
      dispatch(modelActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
      setIsLoading(false);
    };

    const getModelData = async () => {
      try {
        setIsLoading(true);
        unsub = subscribeToUserModel(uid, modelId, (data) => {
          if (!isCurrent) return;
          setErrorMessage("");

          if (!data) {
            setErrorMessage(ERROR_MESSAGE_MODEL_LOAD);
            setIsLoading(false);
            unsub();
            return;
          }

          dispatch(modelActions.setModelData(data));
          dispatch(modelActions.setModelPreview([]));
          setIsLoading(false);
        }, handleModelError);

        if (!modelId) return;

        const defModelData = (await fetchPublicModel(modelId)) as CivitaiModelDoc;
        if (!isCurrent) return;

        dispatch(
          modelActions.updateModelDataField({
            data: defModelData,
          }),
        );
        setPageTitle(defModelData?.name ? `Edit - ${defModelData.name}` : title);
      } catch (err) {
        handleModelError(err);
      }
    };
    getModelData();

    return () => {
      isCurrent = false;
      setErrorMessage("");
      dispatch(modelActions.setCurVersion(null));
      dispatch(modelActions.setModelData(null));
      dispatch(modelActions.setActiveCarouselData(null));
      if (unsub) {
        unsub();
      }
    };
  }, [modelId, isAuth, dispatch, uid, title]);

  return (
    <div>
      {!isLoading && !errorMessage && modelId && <ModelSettings />}
      {!isLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {isLoading && <Spinner />}
      <AnimatePresence>
        {guideOutroIsActive && (
          <Modal
            onClose={() => {
              dispatch(guideActions.setOutroIsActive(false));
            }}
          >
            <OutroGuide />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelEdit;
