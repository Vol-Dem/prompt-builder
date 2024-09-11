import { useParams } from "react-router-dom";
import ModelSettings from "../model/model-settings/ModelSettings";
import { useDispatch, useSelector } from "react-redux";
import { modelActions } from "../../store/model";
import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../../firebase-config";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import { DEF_ERROR_MESSAGE } from "../../variables/constants";

const firestore = getFirestore(firebaseApp);

const Edit = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const model = useSelector((state) => state.model.model);
  const isAuth = useSelector((state) => state.auth.user.uid);
  const uid = useSelector((state) => state.auth.user.uid);
  const dispatch = useDispatch();

  const { modelId } = useParams();

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
    </div>
  );
};

export default Edit;
