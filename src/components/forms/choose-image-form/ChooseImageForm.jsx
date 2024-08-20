import { useEffect, useState } from "react";
import Buttton from "../../ui/Button";
import Image from "../../ui/image/Image";
import classes from "./ChooseImageForm.module.scss";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import { useSelector } from "react-redux";
import Spinner from "../../ui/Spinner";
import CheckSvg from "../../../assets/CheckSvg";
import { useOnlineStatus } from "../../../hooks/use-online-status";
import ErrorMessage from "../../ui/ErrorMessage";
import { OFFLINE_ERROR_MESSAGE } from "../../../variables/constants";

const firestore = getFirestore(firebaseApp);

const ChooseImageForm = ({
  type,
  images,
  modelId,
  activeImageIndex,
  existedImgsAmount,
  onSave,
  isDeleting,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [savedImagesIds, setSavedImagesIds] = useState([]);
  const [imagesInputs, setImagesInputs] = useState([]);
  const uid = useSelector((state) => state.auth.user.uid);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!images.length) return;

    const loadSavedPost = async () => {
      try {
        let savedIds = [];
        if (existedImgsAmount && type === "save") {
          setIsLoading(true);
          const postRef = doc(
            firestore,
            "users",
            uid,
            "models",
            modelId + "",
            "images",
            images[0].postId + ""
          );

          const postDataSnap = await getDoc(postRef);
          if (postDataSnap.exists()) {
            const postData = postDataSnap.data();
            // console.log(postData);
            savedIds = postData.items.map((image) => image?.id);
            setSavedImagesIds(savedIds);
          }
          setIsLoading(false);
        }

        const versionStatusInputData = images?.map((image, i) => {
          let checked;
          let saved;
          if (savedIds?.length && type === "save") {
            saved = savedIds.includes(image?.id);
          }
          checked = activeImageIndex === i ? true : false;

          return {
            type: "checkbox",
            id: image.id,
            name: image.id,
            label: image.url,
            value: saved || checked || false,
            saved: saved || false,
          };
        });

        setImagesInputs(versionStatusInputData || []);
      } catch (err) {
        setIsLoading(false);
        seteErrorMessage(err.message);
      }
    };
    loadSavedPost();
  }, [images, activeImageIndex, existedImgsAmount, modelId, type, uid]);

  const imageStatusChangeHandler = (e) => {
    setImagesInputs((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex(
        (version) => version.id === +e.target.id
      );
      if (!newState[curIndex].saved) {
        newState[curIndex].value = e.target.checked;
      }
      return newState;
    });
  };

  const imagesListHtml = imagesInputs?.map((image, i) => {
    return (
      <li key={i} className={classes["images-list__item"]}>
        {image?.saved && (
          <div className={classes["images-list__icon"]}>
            <CheckSvg />
          </div>
        )}
        <label htmlFor={image.id}>
          <Image
            className={`${classes["image"]} ${
              image?.value ? classes["image--active"] : ""
            } ${image?.saved ? classes["image--saved"] : ""} ${
              type === "del" ? classes["image--del"] : ""
            }`}
            src={image.label}
            alt={`Image-${i}`}
          />
        </label>
        <input
          type="checkbox"
          className={classes["checkbox"]}
          id={image.id}
          name={image.name}
          checked={image.value}
          onChange={imageStatusChangeHandler}
          readOnly={!!image?.saved}
        />
      </li>
    );
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const imagesId = imagesInputs
          .filter((input) => !!input.value)
          .map((input) => input.id);

        if (!!imagesId?.filter((id) => !savedImagesIds.includes(id))?.length) {
          onSave(e, imagesId);
        } else {
          seteErrorMessage("Select at least one image");
        }
      }}
    >
      {!isLoading && isOnline && (
        <ul className={classes["images-list"]}>{imagesListHtml}</ul>
      )}
      {isLoading && (
        <div className={classes["spiner-container"]}>
          <Spinner size="medium" />
        </div>
      )}
      {!!errorMessage && isOnline && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      {!isOnline && <ErrorMessage>{OFFLINE_ERROR_MESSAGE}</ErrorMessage>}
      <div className={classes["btns"]}>
        <Buttton
          className={`${type === "del" ? classes["btn-del"] : ""}`}
          type="button"
          onClick={(e) => {
            onSave(e);
          }}
          disabled={!!isDeleting || !isOnline}
        >
          {type === "save" ? "Save all" : "Delete all"}
        </Buttton>
        <Buttton
          className={`${type === "del" ? classes["btn-del"] : ""}`}
          type="submit"
          disabled={isLoading || !!isDeleting || !isOnline}
        >
          {type === "save" ? "Save selected" : ""}
          {type === "del" && !isLoading && !isDeleting ? "Delete selected" : ""}
          {!!isDeleting && <Spinner size="small" />}
        </Buttton>
      </div>
    </form>
  );
};

export default ChooseImageForm;
