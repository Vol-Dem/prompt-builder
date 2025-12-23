import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { doc, getDoc, getFirestore } from "firebase/firestore";

import Carousel from "../../carousel/Carousel";
import classes from "./ModelDefImages.module.scss";
import Spinner from "../../ui/Spinner";
import CarouselGuide from "../../ui/guide/model/CarouselGuide";
import firebaseApp from "../../../firebase-config";
import { GUIDE_STEP_OPEN_IMAGE } from "../../../variables/constants";
import { filterNsfwImages } from "../../../utils/imageUtils";
import { getVersionImagesFromCiv } from "../../../utils/fetch/fetchImages";
import { handleErrors } from "../../../utils/generalUtils";

const firestore = getFirestore(firebaseApp);

const ModelDefImages = () => {
  const [curVersionImages, setCurVersionImages] = useState([]);
  const [curVersionImagesIsLoading, setCurVersionImagesIsLoading] =
    useState(false);
  const uid = useSelector((state) => state.auth.user.uid);
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const guideModelIsActive = useSelector((state) => state.guide.model.active);
  const guideIsActive = useSelector((state) => state.guide.active);
  const guideStep = useSelector((state) => state.guide.model.step);
  const filteredModelImages = filterNsfwImages(curVersionImages, nsfwLevel);

  //Resets curVersionImages when the current version changes
  useEffect(() => {
    setCurVersionImages([]);
  }, [curVersion]);

  useEffect(() => {
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

        const defImagesSnap = await getDoc(modelDefImagesRef);

        let curImages;

        if (defImagesSnap.exists()) {
          const versionImages = defImagesSnap.data()?.items;

          if (!versionImages?.length) {
            curImages = model?.data?.modelVersions.find(
              (version) => version?.id === curVersion?.id
            )?.images;
          } else {
            curImages = versionImages;
          }
        } else {
          ///LOAD DEFAULT IMAGES FROM MODEL
          curImages = await getVersionImagesFromCiv(
            model.id,
            model?.data?.creator?.username,
            curVersion
          );
        }

        if (curImages?.length) setCurVersionImages(curImages);
      } catch (err) {
        handleErrors(err);
      } finally {
        setCurVersionImagesIsLoading(false);
      }
    };

    if (
      !!model?.id &&
      !!curVersion?.id &&
      !!model?.data &&
      !curVersionImages?.length
    ) {
      getCurVersionImages();
    }
  }, [model, curVersion, uid, curVersionImages]);

  return (
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
        {!!filteredModelImages?.length && !curVersionImagesIsLoading && (
          <Carousel
            key={nsfwLevel}
            imagesData={filteredModelImages}
            versionId={curVersion?.id}
            saved={false}
            modelId={model.id}
            postId={filteredModelImages[0].postId}
            location="models"
            locationId={model.id}
          />
        )}
        {!filteredModelImages?.length && !curVersionImagesIsLoading && (
          <div className={classes["img-container__placeholder"]}>
            <PhotoIcon className={classes["img-container__svg"]} />
            <span>Images not found</span>
          </div>
        )}
      </AnimatePresence>
      {curVersionImagesIsLoading && <Spinner />}
      {guideIsActive && <CarouselGuide />}
    </div>
  );
};

export default ModelDefImages;
