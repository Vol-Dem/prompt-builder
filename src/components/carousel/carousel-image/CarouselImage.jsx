import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./CarouselImage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { deleteImgPost, setPreviewImg } from "../../../store/model";
import ButttonTertiary from "../../ui/ButtonTertiary";
import Modal from "../../ui/Modal";
import DeleteRequest from "../../ui/DeleteRequest";
import ButtonAdd from "../../ui/ButtonSquareAdd";
import ImageSvg from "../../../assets/ImageSvg";
import DotsSvg from "../../../assets/DotsSvg";
import { AnimatePresence, motion } from "framer-motion";
import {
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
} from "../../../variables/constants";
import SetTagSetPreview from "../set-tagset-preview/SetTagSetPreview";
import { transformSrcPreview } from "../../../utils/generalUtils";
import { PlayIcon } from "@heroicons/react/24/outline";

const CarouselImage = ({
  id,
  src,
  alt,
  onClick,
  onDelete,
  dataset,
  postId,
  versionId,
  saved,
  nsfw,
  imageData,
  onOpen,
  active,
  side,
  imageWidth,
  location,
  locationId,
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
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const videoRef = useRef(null);

  useEffect(() => {
    if (src && !imgIsLoaded && !imgError) {
      const { previewSrc, previewVideoWebmSrc, previewVideoMp4Src } =
        transformSrcPreview(
          src,
          SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
          imageData.type
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

  const setPreviwImgHandler = (e) => {
    dispatch(
      setPreviewImg(imgSrc, false, location, locationId, imageData.type)
    );
    setMenuIsOpen(false);
  };
  const setNsfwPreviwImgHandler = (e) => {
    dispatch(setPreviewImg(imgSrc, true, location, locationId, imageData.type));
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
      (post) => post.postId === imgPostId
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

  const closeMenuHandler = useCallback((e) => {
    if (!e.target.closest(`.${classes.menu}`)) setMenuIsOpen(false);
  }, []);

  const openFullViewHandler = () => {
    onOpen(true);
  };

  useEffect(() => {
    if (menuIsOpen) {
      document.removeEventListener("click", closeMenuHandler);
      document.addEventListener("click", closeMenuHandler);
    } else {
      document.removeEventListener("click", closeMenuHandler);
    }

    return () => {
      document.removeEventListener("click", closeMenuHandler);
    };
  }, [menuIsOpen, closeMenuHandler]);

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
      {imgIsLoading && <div className={classes.loading}>Loading...</div>}
      {imgError && (
        <div
          className={classes.placeholder}
          onClick={onClick}
          data-position={dataset}
        ></div>
      )}
      <ImageSvg className={classes["image-svg"]} />
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
                    onClick={setPreviwImgHandler}
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
                      onClick={setNsfwPreviwImgHandler}
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
            />
          </svg>
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
              onClick={onClick}
              onLoad={imgLoadHandler}
              onError={imgErrorHandler}
              data-position={dataset}
              id={id}
              src={imgSrc}
              alt={alt}
            />
          )}
          {imageData.type === "video" && (
            <div
              className={classes["play-icon"]}
              onClick={onClick}
              data-position={dataset}
            >
              <PlayIcon
                className={classes["play-icon__svg"]}
                data-position={dataset}
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
              onClick={onClick}
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
