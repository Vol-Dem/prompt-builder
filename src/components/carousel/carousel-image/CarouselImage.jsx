import React, { useCallback, useEffect, useState } from "react";
import classes from "./CarouselImage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteImgPost,
  setPreviewImg,
  setTagSetPreviewImg,
} from "../../../store/model";
import ButttonTertiary from "../../ui/ButtonTertiary";
import Modal from "../../ui/Modal";
import Image from "../../ui/image/Image";
import DeleteRequest from "../../ui/DeleteRequest";
import ButtonAdd from "../../ui/ButtonSquareAdd";
import ImageSvg from "../../../assets/ImageSvg";
import DotsSvg from "../../../assets/DotsSvg";
import { AnimatePresence, motion } from "framer-motion";
import {
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  ANIMATIONS_FM_ZOOM_IN,
  ANIMATIONS_FM_ZOOM_IN_INITIAL,
  SETTINGS_IMAGE_PREVIEW_WIDTH_BIG,
  SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM,
} from "../../../variables/constants";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";
import TagSetsForm from "../../forms/tag-sets-form/TagSetsForm";
import Buttton from "../../ui/Button";
import SetTagSetPreview from "../set-tagset-preview/SetTagSetPreview";
import { transformSrcPreview } from "../../../utils/generalUtils";

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
}) => {
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const [imgIsLoaded, setImgIsLoaded] = useState(false);
  const [imgIsSaved, setImgIsSaved] = useState(!!saved);
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
  const [tagSetsFormIsOpen, setTagSetsFormIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState("#");
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [tagSetMenuIsOpen, settagSetMenuIsOpen] = useState(false);
  const [showNsfwPreview, setShowNsfwPreview] = useState(false);
  const [curTagSetVersionId, setCurTagSetVersionId] = useState("tsv-def");
  const dispatch = useDispatch();
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  // console.log(id);
  useEffect(() => {
    if (src && !imgIsLoaded && !imgError) {
      const previewSrc = transformSrcPreview(
        src,
        SETTINGS_IMAGE_PREVIEW_WIDTH_BIG
      );
      setImgSrc(previewSrc);
      setImgIsLoading(true);
    }
  }, [src, imgIsLoaded, imgError]);

  const imgLoadHandler = () => {
    setImgIsLoading(false);
    setImgIsLoaded(true);
  };

  const imgErrorHandler = () => {
    setImgError(true);
    setImgIsLoading(false);
  };

  const setPreviwImgHandler = (e) => {
    dispatch(setPreviewImg(src, false));
    setMenuIsOpen(false);
  };
  const setNsfwPreviwImgHandler = (e) => {
    dispatch(setPreviewImg(src, true));
    setMenuIsOpen(false);
  };

  const openMenuHandler = () => {
    if (!!model?.modelVersionsCustomData[curVersion.id]?.tagSetsData?.length) {
      setCurTagSetVersionId(`${curVersion.id}`);
    }
    setMenuIsOpen((prevState) => !prevState);
  };

  const setTagSetPreviwImgHandler = (e) => {
    let curtagSet;
    if (curTagSetVersionId === "tsv-def") {
      curtagSet = model.defaultCustomData.tagSetsData;
    } else {
      curtagSet = model.modelVersionsCustomData[curTagSetVersionId].tagSetsData;
    }

    const imgKey = e.target.dataset.nsfw === "nsfw" ? "nsfwImgUrl" : "imgUrl";

    const updatedTagSet = curtagSet.map((tagSet, i) => {
      if (i === +e.target.dataset.id) {
        return {
          ...tagSet,
          [imgKey]: src,
        };
      }
      return tagSet;
    });

    dispatch(setTagSetPreviewImg(curTagSetVersionId, updatedTagSet));
  };

  const openTagSetVersionHandler = (e) => {
    setCurTagSetVersionId(e.target.id);
  };

  const openTagSetMenuHandler = () => {
    settagSetMenuIsOpen(true);
    setMenuIsOpen(false);
  };

  const closeTagSetMenuHandler = () => {
    settagSetMenuIsOpen(false);
    setTagSetsFormIsOpen(false);
  };

  const tagSetVersionsHtml =
    model?.modelVersionsCustomData &&
    Object.values(model?.modelVersionsCustomData)
      ?.sort((a, b) => a?.index - b?.index)
      .flatMap((version, i) => {
        if (!version?.tagSetsData?.length) return [];
        return (
          <li
            key={i}
            id={`${version.versionId}`}
            className={`${classes["tag-sets-versions__item"]} ${
              curTagSetVersionId === `${version.versionId}`
                ? classes["tag-sets-versions__item--active"]
                : ""
            }`}
            onClick={openTagSetVersionHandler}
          >
            {version.name}
          </li>
        );
      });

  const defTagSetsHtml = model?.defaultCustomData?.tagSetsData?.map(
    (tagSet, i) => {
      return (
        <motion.li
          key={i}
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          data-id={i}
          className={classes["tag-sets__item"]}
        >
          <div className={classes["tag-sets__img"]}>
            <Image
              src={showNsfwPreview ? tagSet.nsfwImgUrl : tagSet.imgUrl}
              imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM}
            />
          </div>
          <div className={classes["tag-sets__info"]}>
            <h3 className={classes["tag-sets__name"]}>{tagSet.name}</h3>
            <div className={classes["tag-sets__btn-container"]}>
              <ButttonTertiary
                type="button"
                onClick={setTagSetPreviwImgHandler}
                button={{ "data-id": i, "data-nsfw": "safe" }}
              >
                Set as preview
              </ButttonTertiary>
              {nsfwMode && (
                <ButttonTertiary
                  type="button"
                  onClick={setTagSetPreviwImgHandler}
                  button={{ "data-id": i, "data-nsfw": "nsfw" }}
                >
                  Set as NSFW preview
                </ButttonTertiary>
              )}
            </div>
          </div>
        </motion.li>
      );
    }
  );

  const versionTagsetsHtml =
    model?.modelVersionsCustomData &&
    model?.modelVersionsCustomData[curTagSetVersionId]?.tagSetsData.map(
      (tagSet, i) => {
        return (
          <motion.li
            key={i}
            initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
            animate={ANIMATIONS_FM_SLIDEIN}
            data-id={i}
            className={classes["tag-sets__item"]}
          >
            <div className={classes["tag-sets__img"]}>
              <Image
                src={showNsfwPreview ? tagSet.nsfwImgUrl : tagSet.imgUrl}
                imageWidth={SETTINGS_IMAGE_PREVIEW_WIDTH_MEDIUM}
              />
            </div>
            <div className={classes["tag-sets__info"]}>
              <h3 className={classes["tag-sets__name"]}>{tagSet.name}</h3>
              <div className={classes["tag-sets__btn-container"]}>
                <ButttonTertiary
                  type="button"
                  onClick={setTagSetPreviwImgHandler}
                  button={{ "data-id": i, "data-nsfw": "safe" }}
                >
                  Set as preview
                </ButttonTertiary>
                {nsfwMode && (
                  <ButttonTertiary
                    type="button"
                    onClick={setTagSetPreviwImgHandler}
                    button={{ "data-id": i, "data-nsfw": "nsfw" }}
                  >
                    Set as NSFW preview
                  </ButttonTertiary>
                )}
              </div>
            </div>
          </motion.li>
        );
      }
    );

  const nsfwSwitchHandler = () => {
    setShowNsfwPreview((prevState) => !prevState);
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
    onDelete();
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

  const openTagSetsForm = () => {
    setTagSetsFormIsOpen(true);
  };
  const closeTagSetsForm = () => {
    setTagSetsFormIsOpen(false);
  };

  return (
    <motion.div
      // layoutId={id}
      className={`${classes.container} ${
        active && !imgIsLoading && !imgError && imgSrc !== "#"
          ? classes["container--shadow"]
          : ""
      }`}
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
                  <li
                    className={classes["menu__item"]}
                    onClick={openTagSetMenuHandler}
                  >
                    Set as tag set preview
                  </li>
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
          <motion.img
            // layoutId={active ? src : null}
            className={`${classes.image} ${
              imageData?.width - imageData?.height < 0
                ? classes["image--portrait"]
                : ""
            } ${imgIsLoading && !imgIsLoaded ? classes["image--hidden"] : ""} ${
              !nsfwMode && nsfw ? classes["image--nsfw"] : ""
            }`}
            draggable={false}
            onClick={onClick}
            onLoad={imgLoadHandler}
            onError={imgErrorHandler}
            data-position={dataset}
            id={id}
            src={imgSrc}
            alt={alt}
          />
        </>
      )}
      <AnimatePresence>
        {tagSetMenuIsOpen && (
          <Modal
            className={classes["tag-sets__modal"]}
            onClose={closeTagSetMenuHandler}
          >
            <SetTagSetPreview src={src} />
            {/* <>
              <div className={classes["tag-sets-head"]}>
                <div className={classes["tag-sets-title"]}>Tag sets</div>

                {!tagSetsFormIsOpen && (
                  <Buttton onClick={openTagSetsForm}>Add tag set</Buttton>
                )}
                {nsfwMode && (
                  <div className={classes["mode-switch"]}>
                    <button
                      type="button"
                      onClick={nsfwSwitchHandler}
                      className={`${classes["btn-mode"]} ${
                        !showNsfwPreview ? classes["btn-mode--active"] : ""
                      }`}
                    >
                      SFW
                    </button>
                    <button
                      type="button"
                      onClick={nsfwSwitchHandler}
                      className={`${classes["btn-mode"]} ${
                        showNsfwPreview ? classes["btn-mode--active"] : ""
                      }`}
                    >
                      NSFW
                    </button>
                  </div>
                )}
              </div>
              <ul className={classes["tag-sets-versions"]}>
                {!!model.defaultCustomData?.tagSetsData?.length && (
                  <li
                    id={`tsv-def`}
                    className={`${classes["tag-sets-versions__item"]} ${
                      curTagSetVersionId === "tsv-def"
                        ? classes["tag-sets-versions__item--active"]
                        : ""
                    }`}
                    onClick={openTagSetVersionHandler}
                  >
                    Default
                  </li>
                )}
                {tagSetVersionsHtml}
                {tagSetsFormIsOpen && (
                  <TagSetsForm
                    modelId={model.id}
                    // versionData={customVersionData}
                    onClose={closeTagSetsForm}
                  />
                )}
              </ul>
              {!model.defaultCustomData?.tagSetsData?.length &&
                !tagSetVersionsHtml?.length && (
                  <div className={classes["notification"]}>
                    <ExclamationCircleSvg
                      className={classes["notification__svg"]}
                    />
                    <p className={classes["notification__text"]}>
                      You don't have any tag sets. <br /> Press "Add tag set" to
                      add new tag set!
                    </p>
                  </div>
                )}
              {curTagSetVersionId === "tsv-def" && (
                <ul className={classes["tag-sets"]}>{defTagSetsHtml}</ul>
              )}
              {curTagSetVersionId !== "tsv-def" && (
                <ul className={classes["tag-sets"]}>{versionTagsetsHtml}</ul>
              )}
            </> */}
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
