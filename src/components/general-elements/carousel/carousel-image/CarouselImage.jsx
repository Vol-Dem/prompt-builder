import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlassPlusIcon, PlayIcon } from "@heroicons/react/24/outline";

import classes from "./CarouselImage.module.scss";
import { deleteImgPost, setPreviewImg } from "../../../../store/model";
import ButttonTertiary from "../../../ui/buttons/ButtonTertiary";
import Modal from "../../../ui/Modal";
import DeleteRequest from "../../../ui/DeleteRequest";
import ButtonAdd from "../../button-square-add/ButtonSquareAdd";
import ImageSvg from "../../../../assets/ImageSvg";
import DotsSvg from "../../../../assets/DotsSvg";
import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
} from "../../../../variables/constants";
import SetTagSetPreview from "../set-tagset-preview/SetTagSetPreview";
import { transformSrcPreview } from "../../../../utils/imageUtils";

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
 * @param {object} props
 * @param {string} props.id - Image ID.
 * @param {string} props.src - Base image source URL.
 * @param {string} props.alt - Image alt text.
 * @param {boolean} props.nsfw - Whether the image is marked as NSFW.
 * @param {number} props.postId - Parent post ID.
 * @param {number} props.position - Image index inside the carousel.
 * @param {boolean} props.active - Whether the carousel is currently open.
 * @param {boolean} props.saved - Whether images were loaded from the application database.
 * @param {boolean} props.side - Whether the carousel is opened from the sidebar.
 * @param {object} props.imageData - Full image metadata object.
 * @param {number} props.versionId - Model version ID associated with the image.
 * @param {number} props.imageWidth - Requested carousel image width.
 * @param {'models' | 'collections'} props.location - Firestore collection name where images belong.
 * @param {number} props.locationId - Firestore document ID of the current model or collection.
 * @param {(position: number) => void} props.onClick - Callback triggered when the image is clicked.
 * @param {() => void} props.onOpen - Callback triggered when the image is opened.
 * @param {(ids: number[], postId: number) => void} props.onDelete - Callback triggered when images are deleted.
 *
 * @returns {JSX.Element} Carousel image.
 */
const CarouselImage = ({
  id,
  src,
  alt,
  nsfw,
  postId,
  position,
  saved,
  active,
  side,
  imageData,
  versionId,
  imageWidth,
  location,
  locationId,
  onClick,
  onOpen,
  onDelete,
}) => {
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const [imgIsLoaded, setImgIsLoaded] = useState(false);
  const [imgIsSaved, setImgIsSaved] = useState(!!saved);
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState("#");
  const [videoSrc, setVideoSrc] = useState({ mp4: "#", webm: "#" });
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [tagSetMenuIsOpen, settagSetMenuIsOpen] = useState(false);
  const dispatch = useDispatch();
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const videoRef = useRef(null);

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
        mp4: previewVideoMp4Src,
        webm: previewVideoWebmSrc,
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

  const setPreviwImgHandler = (nsfw) => {
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

  const deleteImgPostHandler = () => {
    const imgPostId = postId[0].postId;
    const postData = model?.savedImages[versionId]?.find(
      (post) => post.postId === imgPostId,
    );

    dispatch(deleteImgPost(versionId, imgPostId, postData));
    setDeleteRequestIsOpen(false);
    setMenuIsOpen(false);
    setImgIsSaved(false);
  };

  const showDeleteReqeustHandler = (e) => {
    onDelete(e);
  };

  const closeDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(false);
  };

  const openFullViewHandler = () => {
    onOpen(true);
  };

  useEffect(() => {
    const closeMenuHandler = (e) => {
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
        <ImageSvg />
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
              <DotsSvg />
            </ButttonTertiary>
            <AnimatePresence>
              {menuIsOpen && (
                <motion.menu
                  initial={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                  animate={ANIMATIONS_FM_ZOOM_IN}
                  exit={ANIMATIONS_FM_ZOOM_IN_INITIAL}
                  className={classes["menu__list"]}
                >
                  <li
                    className={classes["menu__item"]}
                    onClick={() => setPreviwImgHandler(false)}
                  >
                    Set as preview
                  </li>
                  {curVersion?.id && (
                    <li
                      className={classes["menu__item"]}
                      onClick={openTagSetMenuHandler}
                    >
                      Set as tag set preview
                    </li>
                  )}
                  {nsfwMode && (
                    <li
                      className={classes["menu__item"]}
                      onClick={() => setPreviwImgHandler(true)}
                    >
                      Set as NSFW preview
                    </li>
                  )}
                  {imgIsSaved && (
                    <li
                      className={`${classes["menu__item"]} ${classes["menu__item--del"]}`}
                      onClick={showDeleteReqeustHandler}
                    >
                      Delete
                    </li>
                  )}
                </motion.menu>
              )}
            </AnimatePresence>
          </div>
          <ButtonAdd
            className={classes["btn-add"]}
            previewData={imageData}
            type="image"
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
        {deleteRequestIsOpen && (
          <DeleteRequest
            message={`Are you sure that you want to delete this post? This action can't
          be reverted`}
            onSubmit={deleteImgPostHandler}
            onClose={closeDeleteReqeustHandler}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CarouselImage;
