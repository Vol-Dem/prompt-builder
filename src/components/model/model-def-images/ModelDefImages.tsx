import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { doc, getDoc, getFirestore } from "firebase/firestore";

import Carousel from "../../general-elements/carousel/Carousel";
import classes from "./ModelDefImages.module.scss";
import Spinner from "../../ui/Spinner";
import CarouselGuide from "../../general-elements/guide/model/CarouselGuide";
import firebaseApp from "../../../firebase-config";
import {
  GUIDE_STEP_OPEN_IMAGE,
  SETTINGS_SHOW_ALL_DEF_IMAGES,
} from "../../../variables/constants";
import { filterNsfwImages } from "../../../utils/imageUtils";
import { getVersionImagesFromCiv } from "../../../utils/fetch/fetchImages";
import { handleErrors, normalizeError } from "../../../utils/generalUtils";
import { useAppSelector } from "../../../store/hooks/hooks";
import type { Image } from "../../../../shared/types/image";

const firestore = getFirestore(firebaseApp);

/**
 * Displays preview images belonging to the active model version.
 *
 * Fetches previw images of current model version and displays them as carousel.
 *
 * @component
 *
 * @returns Model default images component.
 */
const ModelDefImages = () => {
  const [curVersionImages, setCurVersionImages] = useState<Image[]>([]);
  const [curVersionImagesIsLoading, setCurVersionImagesIsLoading] =
    useState(false);
  const uid = useAppSelector((state) => state.auth.user.uid);
  const model = useAppSelector((state) => state.model.model);
  const curVersion = useAppSelector((state) => state.model.curVersion);
  const nsfwLevel = useAppSelector((state) => state.general.nsfwLevel);
  const guideModelIsActive = useAppSelector(
    (state) => state.guide.model.active,
  );
  const guideIsActive = useAppSelector((state) => state.guide.active);
  const guideStep = useAppSelector((state) => state.guide.model.step);
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
          curVersion?.id + "",
        );

        const defImagesSnap = await getDoc(modelDefImagesRef);

        let curImages: Image[] | null = null;

        const defImagesWithoutPrompt = model?.data?.modelVersions.find(
          (version) => version?.id === curVersion?.id,
        )?.images;

        if (defImagesSnap.exists()) {
          const versionImages = defImagesSnap.data()?.items as Image[];
          if (!versionImages?.length) {
            curImages = defImagesWithoutPrompt || null;
          } else {
            curImages = !SETTINGS_SHOW_ALL_DEF_IMAGES
              ? versionImages
              : defImagesWithoutPrompt?.map((image) => {
                  const imgWithPrompt = versionImages.find(
                    (imageWithPrompt) => imageWithPrompt.hash === image.hash,
                  );

                  return imgWithPrompt || image;
                }) || null;
          }
        } else {
          ///LOAD DEFAULT IMAGES FROM MODEL
          if (model && model?.data?.creator?.username && curVersion) {
            curImages = await getVersionImagesFromCiv(
              model.id,
              model?.data?.creator?.username,
              curVersion,
            );
          }
        }

        if (!curImages?.length) {
          curImages = defImagesWithoutPrompt || null;
        }

        if (curImages?.length) setCurVersionImages(curImages);
      } catch (err) {
        handleErrors(normalizeError(err));
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
            versionId={curVersion?.id || null}
            saved={!model?.modelVersionsCustomData}
            modelId={model?.id}
            postId={filteredModelImages[0].postId}
            location="models"
            locationId={model?.id}
            menu={!!model?.modelVersionsCustomData}
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
