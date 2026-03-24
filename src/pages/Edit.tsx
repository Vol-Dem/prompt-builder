import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getFirestore,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { AnimatePresence } from "framer-motion";

import { modelActions } from "../store/model";
import { guideActions } from "../store/guide";
import firebaseApp from "../firebase-config";
import { fetchDataFromFirestore } from "../utils/fetch/fetchUtils";
import {
  DEFAULT_PAGE_TITLE,
  ERROR_MESSAGE_DEFAULT,
  GUIDE_STEP_MODEL_EDIT,
} from "../variables/constants";
import ModelSettings from "../components/model/model-settings/ModelSettings";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import Modal from "../components/ui/Modal";
import OutroGuide from "../components/general-elements/guide/OutroGuide";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import type { ModelData } from "../types/models.types";
import type { CivitaiModelDoc } from "../../shared/types/firestore";

const firestore = getFirestore(firebaseApp);

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
 * @param {Object} props
 * @param {string} props.title - Fallback page title used before model data is loaded.
 *
 * @returns {JSX.Element} Model edit page.
 */
const ModelEdit = ({ title }: ModelEditProps) => {
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
    if (!isAuth || !modelId) return;

    let unsub: Unsubscribe;

    const getModelData = async () => {
      try {
        setIsLoading(true);
        unsub = onSnapshot(
          doc(firestore, "users", uid, "models", modelId),
          (doc) => {
            setErrorMessage("");
            const data = doc.data() as ModelData;

            if (!data) {
              setErrorMessage("Failed to load model");
              setIsLoading(false);
              unsub();
              return;
            }

            dispatch(modelActions.setModelData(data));
            dispatch(modelActions.setModelPreview([]));
            setIsLoading(false);
          },
        );

        if (!modelId) return;

        const defModelData = (await fetchDataFromFirestore(
          "models",
          modelId,
        )) as CivitaiModelDoc;

        dispatch(
          modelActions.updateModelDataField({
            data: defModelData,
          }),
        );
        document.title = defModelData?.name
          ? `Edit - ${defModelData?.name}`
          : title;
      } catch (err) {
        setErrorMessage("Failed to load model");
        dispatch(modelActions.setErrorMessage(ERROR_MESSAGE_DEFAULT));
        setIsLoading(false);
        console.log(err);
      }
    };
    getModelData();

    return () => {
      setErrorMessage("");
      dispatch(modelActions.setCurVersion(null));
      dispatch(modelActions.setModelData(null));
      dispatch(modelActions.setActiveCarouselData(null));
      if (unsub) {
        unsub();
      }
      document.title = DEFAULT_PAGE_TITLE;
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
