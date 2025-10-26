import { useParams } from "react-router-dom";
import ModelSettings from "../model/model-settings/ModelSettings";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
import { useEffect, useState } from "react";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import {
  ERROR_MESSAGE_DEFAULT,
  GUIDE_STEP_MODEL_EDIT,
} from "../../variables/constants";
import { guideActions } from "../../store/guide";
import Modal from "../ui/Modal";
import OutroGuide from "../ui/guide/OutroGuide";
import { AnimatePresence } from "framer-motion";
import { fetchDataFromFirestore } from "../../utils/fetch/fetchUtils";

const firestore = getFirestore(firebaseApp);

const Edit = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // const model = useSelector((state) => state.model.model);
  const isAuth = useSelector((state) => state.auth.user.uid);
  const uid = useSelector((state) => state.auth.user.uid);
  const modelGuideState = useSelector((state) => state.guide.model);
  const guideOutroIsActive = useSelector((state) => state.guide.outroIsActive);
  const { modelId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      modelGuideState?.active &&
      modelGuideState?.step === GUIDE_STEP_MODEL_EDIT
    ) {
      dispatch(guideActions.setGuideActive({ type: "model", value: false }));
      dispatch(guideActions.setGuideActive({ type: "edit", value: true }));
    }
  }, [modelGuideState, dispatch]);

  // useEffect(() => {
  //   document.title = `Edit - ${model?.name}` || title;
  //   return () => {
  //     document.title = "Prompt builder";
  //   };
  // }, [title, model?.name]);

  // const getDefModelData = useCallback(async () => {
  //   try {
  //     const modelDefDataRef = doc(firestore, "models", `${modelId}`);

  //     const docSnap = await getDoc(modelDefDataRef);

  //     if (docSnap.exists()) {
  //       const modelDefData = docSnap.data();

  //       dispatch(
  //         modelActions.setModelData({
  //           data: modelDefData,
  //         })
  //       );
  //     } else {
  //       const updateModel = httpsCallable(functions, "updateModelCalldev");
  //       const response = await updateModel({ id: modelId });

  //       if (response?.modelData) {
  //         dispatch(
  //           modelActions.setModelData({
  //             data: response.modelData,
  //           })
  //         );
  //       } else {
  //         throw new Error(ERROR_MESSAGE_UPLOAD_MODEL);
  //       }
  //     }
  //   } catch (err) {
  //     handleErrors(err);
  //   }
  // }, [modelId, dispatch]);

  useEffect(() => {
    if (!isAuth) return;

    let unsub;

    const getModelData = async () => {
      try {
        setIsLoading(true);

        unsub = onSnapshot(
          doc(firestore, "users", uid, "models", modelId),
          (doc) => {
            setErrorMessage("");
            const data = doc.data();

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

        const defModelData = await fetchDataFromFirestore("models", modelId);

        dispatch(
          modelActions.setModelData({
            data: defModelData,
          })
        );
        document.title = `Edit - ${defModelData?.name}` || title;
        // await getDefModelData();
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
      dispatch(modelActions.setCurVersion({}));
      dispatch(modelActions.setModelData({}));
      dispatch(modelActions.setActiveCarouselData({}));
      if (unsub) {
        unsub();
      }
      document.title = "Prompt builder";
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

export default Edit;
