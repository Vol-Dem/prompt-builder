import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  EllipsisHorizontalIcon,
  MagnifyingGlassPlusIcon,
  PhotoIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

import classes from "./CarouselImage.module.scss";
import { setPreviewImg } from "../../../../store/model";
import ButttonTertiary from "../../../ui/buttons/ButtonTertiary";
import Modal from "../../../ui/Modal";
import ButtonAdd from "../../button-square-add/ButtonSquareAdd";
import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
} from "../../../../variables/constants";
import SetTagSetPreview from "../set-tagset-preview/SetTagSetPreview";
import { transformSrcPreview } from "../../../../utils/imageUtils";
import type { ResourceFirestoreCollection } from "../../../../types/models.types";
import type { Image } from "../../../../../shared/types/image";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";

type CarouselImageProps = {
  id: string;
  src: string;
  alt: string;
  nsfw: boolean;
  position: number;
  saved: boolean;
  active: boolean;
  side: boolean;
  imageData: Image;
  imageWidth?: number;
  location: ResourceFirestoreCollection;
  locationId: number | null;
  onClick: (position: number | null) => void;
  onOpen: () => void;
  onDelete: () => void;
};

/**
 * Carousel image component.
 *
 * Renders a single image or video inside the carousel with contextual controls.
 * Supports adding/removing the image to the sidebar, setting previews, and handling
 * save/delete flows for posts.
 * Stores image `src` in local state and updates it only when a valid source
 * is provided (not "#"), ensuring each image is loaded only once during carousel
 * navigation.
 *
 * Video handling:
 * - If the image has video sources and the carousel is open, renders the video player.
 * - If the carousel is closed, renders an image preview with a video indicator icon.
 *
 * Behavior:
 * - Clicking the image opens the carousel.
 * - When rendered inside `ActiveCarousel`, clicking opens the full-screen image viewer instead.
 * - If the carousel contains only one image, delete is executed immediately;
 *   otherwise the ChooseImageForm is opened.
 *
 * Lazy-loading behavior:
 * - Receives `"#"` for non-visible images and ignores it.
 * - Updates internal `src` state only when a valid URL is received.
 *
 * Responsibilities:
 * - Manages loading state and displays a preloader.
 * - Generates optimized media URLs for requested image width and video formats.
 * - Displays context menu actions (save, delete, set preview / NSFW preview).
 * - Triggers save and delete flows for post images.
 *
 * @component
 *
 * @param props
 * @param props.id - Image ID.
 * @param props.src - Base image source URL.
 * @param props.alt - Image alt text.
 * @param props.nsfw - Whether the image is marked as NSFW.
 * @param props.postId - Parent post ID.
 * @param props.position - Image index inside the carousel.
 * @param props.active - Whether the carousel is currently open.
 * @param props.saved - Whether images were loaded from the application database.
 * @param props.side - Whether the carousel is opened from the sidebar.
 * @param props.imageData - Full image metadata object.
 * @param props.versionId - Model version ID associated with the image.
 * @param props.imageWidth - Requested carousel image width.
 * @param props.location - Firestore collection name where images belong.
 * @param props.locationId - Firestore document ID of the current model or collection.
 * @param props.onClick - Callback triggered when the image is clicked.
 * @param props.onOpen - Callback triggered when the image is opened.
 * @param props.onDelete - Callback triggered when images are deleted.
 *
 * @returns {JSX.Element} Carousel image.
 */
const CarouselImage = ({
  id,
  src,
  alt,
  nsfw,
  position,
  saved,
  active,
  side,
  imageData,
  imageWidth,
  location,
  locationId,
  onClick,
  onOpen,
  onDelete,
}: CarouselImageProps) => {
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const [imgIsLoaded, setImgIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState("#");
  const [videoSrc, setVideoSrc] = useState({ mp4: "#", webm: "#" });
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [tagSetMenuIsOpen, settagSetMenuIsOpen] = useState(false);
  const curVersion = useAppSelector((state) => state.model.curVersion);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const dispatch = useAppDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (src && !imgIsLoaded && !imgError) {
      const { previewSrc, previewVideoWebmSrc, previewVideoMp4Src } =
        transformSrcPreview(
          src,
          SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
          imageData.type,
        );
      setImgSrc(previewSrc);
      setVideoSrc({
        mp4: previewVideoMp4Src || "#",
        webm: previewVideoWebmSrc || "#",
      });
      if (imageData.type !== "video") setImgIsLoading(true);
    }
  }, [src, imgIsLoaded, imgError, imageData?.type]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
    setImgIsLoaded(true);
  };

  const imgErrorHandler = () => {
    setImgError(true);
    setImgIsLoading(false);
  };

  const setPreviwImgHandler = (nsfw: boolean) => {
    if (!locationId) return;

    dispatch(setPreviewImg(imgSrc, nsfw, location, locationId, imageData.type));
    setMenuIsOpen(false);
  };

  const openMenuHandler = () => {
    setMenuIsOpen((prevState) => !prevState);
  };

  const openTagSetMenuHandler = () => {
    settagSetMenuIsOpen(true);
    setMenuIsOpen(false);
  };

  const closeTagSetMenuHandler = () => {
    settagSetMenuIsOpen(false);
  };

  const showDeleteReqeustHandler = () => {
    onDelete();
  };

  const openFullViewHandler = () => {
    onOpen();
  };

  useEffect(() => {
    const closeMenuHandler = (e: PointerEvent) => {
      if (!(e.target instanceof HTMLElement)) return;

      if (!e.target.closest(`.${classes.menu}`)) setMenuIsOpen(false);
    };

    if (menuIsOpen) {
      document.removeEventListener("click", closeMenuHandler);
      document.addEventListener("click", closeMenuHandler);
    } else {
      document.removeEventListener("click", closeMenuHandler);
    }

    return () => {
      document.removeEventListener("click", closeMenuHandler);
    };
  }, [menuIsOpen]);

  return (
    <motion.div
      // layoutId={id}
      className={`${classes.container} ${
        active && !imgIsLoading && !imgError && imgSrc !== "#"
          ? classes["container--shadow"]
          : ""
      }`}
      style={{ width: imageWidth }}
    >
      {imgIsLoading && imgSrc !== "#" && (
        <div className={classes.loading}></div>
      )}
      {imgError && (
        <div
          className={classes.placeholder}
          onClick={() => onClick(position)}
          data-position={position}
        ></div>
      )}
      <div className={classes["image-svg"]} onClick={() => onClick(position)}>
        <PhotoIcon />
      </div>
      {!imgIsLoading && !side && imgSrc !== "#" && (
        <>
          <div className={classes.menu}>
            <ButttonTertiary
              type="button"
              className={classes["menu-btn"]}
              onClick={openMenuHandler}
              title="Image settings"
            >
              <EllipsisHorizontalIcon />
            </ButttonTertiary>
            <AnimatePresence>
              {menuIsOpen && (
                <motion.menu
                  initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                  animate={ANIMATIONS_FM_ZOOM_IN}
                  exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                  className={classes["menu__list"]}
                >
                  <motion.li
                    className={classes["menu__item"]}
                    onClick={() => setPreviwImgHandler(false)}
                  >
                    Set as preview
                  </motion.li>
                  {curVersion?.id && (
                    <motion.li
                      className={classes["menu__item"]}
                      onClick={openTagSetMenuHandler}
                    >
                      Set as tag set preview
                    </motion.li>
                  )}
                  {nsfwMode && (
                    <motion.li
                      className={classes["menu__item"]}
                      onClick={() => setPreviwImgHandler(true)}
                    >
                      Set as NSFW preview
                    </motion.li>
                  )}
                  {!!saved && (
                    <motion.li
                      className={`${classes["menu__item"]} ${classes["menu__item--del"]}`}
                      onClick={showDeleteReqeustHandler}
                    >
                      Delete
                    </motion.li>
                  )}
                </motion.menu>
              )}
            </AnimatePresence>
          </div>
          <ButtonAdd
            resourceType="image"
            previewData={imageData}
            className={classes["btn-add"]}
          />
        </>
      )}
      {active && !imgIsLoading && !imgError && imgSrc !== "#" && (
        <span className={classes["btn-full"]} onClick={openFullViewHandler}>
          <MagnifyingGlassPlusIcon />
        </span>
      )}
      {!imgError && imgSrc !== "#" && (
        <>
          {(imageData.type !== "video" || !active) && (
            <motion.img
              className={`${classes.image} ${
                imageData?.width - imageData?.height < 0
                  ? classes["image--portrait"]
                  : ""
              } ${
                imgIsLoading && !imgIsLoaded ? classes["image--hidden"] : ""
              } ${!nsfwMode && nsfw ? classes["image--nsfw"] : ""}`}
              draggable={false}
              onClick={() => onClick(position)}
              onLoad={imgLoadHandler}
              onError={imgErrorHandler}
              data-position={position}
              id={id}
              src={imgSrc}
              alt={alt}
            />
          )}
          {imageData.type === "video" && (
            <div
              className={classes["play-icon"]}
              onClick={() => onClick(position)}
              data-position={position}
            >
              <PlayIcon
                className={classes["play-icon__svg"]}
                data-position={position}
              />
            </div>
          )}
          {imageData.type === "video" && active && (
            <video
              ref={videoRef}
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              poster={imgSrc}
              onClick={() => onClick(position)}
              className={`${classes.image} ${
                imageData?.width - imageData?.height < 0
                  ? classes["image--portrait"]
                  : ""
              } ${!nsfwMode && nsfw ? classes["image--nsfw"] : ""}`}
            >
              <source src={videoSrc?.webm} type="video/webm" />
              <source src={videoSrc?.mp4} type="video/mp4" />
            </video>
          )}
        </>
      )}
      <AnimatePresence>
        {tagSetMenuIsOpen && (
          <Modal
            className={classes["tag-sets__modal"]}
            onClose={closeTagSetMenuHandler}
          >
            <SetTagSetPreview src={src} />
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CarouselImage;
