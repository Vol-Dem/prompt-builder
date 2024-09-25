import { useParams } from "react-router-dom";
import ModelSettings from "../model/model-settings/ModelSettings";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import {
  DEF_ERROR_MESSAGE,
  GUIDE_STEP_MODEL_EDIT,
} from "../../variables/constants";
import { guideActions } from "../../store/guide";
import Modal from "../ui/Modal";
import OutroGuide from "../ui/guide/OutroGuide";
import classes from "./Edit.module.scss";

const firestore = getFirestore(firebaseApp);

const Edit = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const model = useSelector((state) => state.model.model);
  const isAuth = useSelector((state) => state.auth.user.uid);
  const uid = useSelector((state) => state.auth.user.uid);
  const modelGuideState = useSelector((state) => state.guide.model);
  const guideOutroIsActive = useSelector((state) => state.guide.outroIsActive);
  const dispatch = useDispatch();

  const { modelId } = useParams();

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
    document.title = `Edit - ${model?.name}` || title;
    return () => {
      document.title = "Prompt builder";
    };
  }, [title, model?.name]);

  useEffect(() => {
    if (!isAuth) return;
    let unsub;
    try {
      setIsLoading(true);

      unsub = onSnapshot(
        doc(firestore, "users", uid, "models", modelId),
        (doc) => {
          setErrorMessage("");
          // const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
          // console.log(source);
          const data = doc.data();

          // console.log(data);
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
      dispatch(modelActions.setErrorMessage(DEF_ERROR_MESSAGE));
      setIsLoading(false);
    }
    return () => {
      setErrorMessage("");
      dispatch(modelActions.setCurVersion({}));
      dispatch(modelActions.setModelData({}));
      dispatch(modelActions.setActiveCarouselData({}));
      if (unsub) {
        unsub();
      }
    };
  }, [modelId, isAuth, dispatch, uid]);

  useEffect(() => {
    if (!modelId) return;
    try {
      const getDefModelData = async () => {
        const modelDefDataRef = doc(firestore, "models", `${modelId}`);

        const docSnap = await getDoc(modelDefDataRef);

        if (docSnap.exists()) {
          const modelDefData = docSnap.data();
          // console.log(modelDefData);

          dispatch(
            modelActions.setModelData({
              data: modelDefData,
            })
          );
        }
      };

      getDefModelData();
    } catch (err) {
      setErrorMessage(DEF_ERROR_MESSAGE);
    }
  }, [model?.id, dispatch, modelId]);

  return (
    <div>
      {!isLoading && !errorMessage && model?.id && <ModelSettings />}
      {!isLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {isLoading && <Spinner />}
      {guideOutroIsActive && (
        <Modal
          onClose={() => {
            dispatch(guideActions.setOutroIsActive(false));
          }}
          disableClass={classes["guide-outro"]}
        >
          <OutroGuide />
        </Modal>
      )}
    </div>
  );
};

export default Edit;
