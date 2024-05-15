import React, { useEffect, useState } from "react";
import classes from "./CarouselImage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteImgPost,
  // modelActions,
  setPreviewImg,
  setTagSetPreviewImg,
} from "../../../store/model";
import ButttonTertiary from "../../ui/ButtonTertiary";
import Modal from "../../ui/Modal";
import Image from "../../ui/image/Image";
import DeleteRequest from "../../ui/DeleteRequest";
// import Buttton from "../../ui/Button";

const CarouselImage = ({
  id,
  src,
  alt,
  onClick,
  dataset,
  postId,
  versionId,
  saved,
  nsfw,
}) => {
  const [imgIsLoading, setImgIsLoading] = useState(false);
  const [imgIsLoaded, setImgIsLoaded] = useState(false);
  const [deleteRequestIsOpen, setDeleteRequestIsOpen] = useState(false);
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

  useEffect(() => {
    // if (imgError) setImgIsLoading(true);
    if (src && !imgIsLoaded) {
      setImgSrc(src);
      setImgIsLoading(true);
    }
  }, [src, imgIsLoaded]);

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
    console.log(model.data.type);
    dispatch(setPreviewImg(src, true));
    setMenuIsOpen(false);
  };

  const openMenuHandler = () => {
    console.log(curVersion);
    if (!!model?.modelVersionsCustomData[curVersion.id]?.tagSetsData?.length) {
      console.log("TEST");
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
    // const urlField = isNsfw ? "nsfwPreviewImgUrl" : "customPreviewImgUrl";
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

    // const tagSetData = {
    //   id: e.target.dataset.id,
    //   versionId: curTagSetVersionId,
    // };
    // console.log(tagSetData);

    console.log(updatedTagSet);
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
  };

  const tagSetVersionsHtml = Object.values(
    model.modelVersionsCustomData
  ).flatMap((version, i) => {
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
        {version.versionName}
      </li>
    );
  });

  const defTagSetsHtml = model?.defaultCustomData?.tagSetsData?.map(
    (tagSet, i) => {
      return (
        <li
          key={i}
          data-id={i}
          className={classes["tag-sets__item"]}
          // onClick={setTagSetPreviwImgHandler}
        >
          <div className={classes["tag-sets__img"]}>
            <Image src={showNsfwPreview ? tagSet.nsfwImgUrl : tagSet.imgUrl} />
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
              <ButttonTertiary
                type="button"
                onClick={setTagSetPreviwImgHandler}
                button={{ "data-id": i, "data-nsfw": "nsfw" }}
              >
                Set as NSFW preview
              </ButttonTertiary>
            </div>
          </div>
        </li>
      );
    }
  );

  const versionTagsetsHtml = model?.modelVersionsCustomData[
    curTagSetVersionId
  ]?.tagSetsData.map((tagSet, i) => {
    return (
      <li
        key={i}
        data-id={i}
        className={classes["tag-sets__item"]}
        // onClick={setTagSetPreviwImgHandler}
      >
        <div className={classes["tag-sets__img"]}>
          <Image src={showNsfwPreview ? tagSet.nsfwImgUrl : tagSet.imgUrl} />
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
            <ButttonTertiary
              type="button"
              onClick={setTagSetPreviwImgHandler}
              button={{ "data-id": i, "data-nsfw": "nsfw" }}
            >
              Set as NSFW preview
            </ButttonTertiary>
          </div>
        </div>
      </li>
    );
  });

  const nsfwSwitchHandler = () => {
    setShowNsfwPreview((prevState) => !prevState);
  };
  const deleteImgPostHandler = () => {
    const imgPostId = postId[0].postId;
    const postData = model?.savedImages[versionId]?.find(
      (post) => post.postId === imgPostId
    );
    // console.log(versionId);
    // console.log(postData);
    dispatch(deleteImgPost(versionId, imgPostId, postData));
    setDeleteRequestIsOpen(false);
    setMenuIsOpen(false);
  };

  const showDeleteReqeustHandler = (e) => {
    console.log(id);
    setDeleteRequestIsOpen(true);
  };

  const closeDeleteReqeustHandler = () => {
    setDeleteRequestIsOpen(false);
  };

  const closeMenu = (e) => {
    console.log("CLOSE");
    console.log(classes.menu);
    console.log(e.target.classList);

    if (!e.target.closest(`.${classes.menu}`)) setMenuIsOpen(false);
  };

  useEffect(() => {
    if (menuIsOpen) {
      console.log("MENU");
      document.addEventListener("click", closeMenu);
    } else {
      document.removeEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [menuIsOpen]);

  return (
    <div className={classes.container}>
      {imgIsLoading && <div className={classes.loading}>Loading...</div>}
      {imgError && (
        <div
          className={classes.placeholder}
          onClick={onClick}
          data-position={dataset}
        ></div>
      )}
      {!imgError && imgSrc !== "#" && (
        <>
          <div className={classes.menu}>
            <ButttonTertiary
              type="button"
              className={classes["menu-btn"]}
              onClick={openMenuHandler}
            >
              menu
            </ButttonTertiary>
            {menuIsOpen && (
              <menu className={classes["menu__list"]}>
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
                <li
                  className={classes["menu__item"]}
                  onClick={setNsfwPreviwImgHandler}
                >
                  Set as NSFW preview
                </li>
                {saved && (
                  <li
                    className={`${classes["menu__item"]} ${classes["menu__item--del"]}`}
                    onClick={showDeleteReqeustHandler}
                  >
                    Delete post
                  </li>
                )}
              </menu>
            )}
          </div>
          <img
            className={`${classes.image} ${
              imgIsLoading ? classes["image--hidden"] : ""
            } ${!nsfwMode && nsfw ? classes["image--nsfw"] : ""}`}
            onClick={onClick}
            onLoad={imgLoadHandler}
            onError={imgErrorHandler}
            data-position={dataset}
            id={id}
            src={imgSrc}
            alt={alt}
          />
          {/* <span
            className={`${classes["btn__set"]} ${classes["btn__set--previw"]}`}
            onClick={setPreviwImgHandler}
          >
            Set
          </span>
          <span
            className={`${classes["btn__set"]} ${classes["btn__set--nsfw-previw"]}`}
            onClick={setNsfwPreviwImgHandler}
          >
            Set H
          </span> */}
        </>
      )}
      {tagSetMenuIsOpen && (
        <Modal onClose={closeTagSetMenuHandler}>
          <div className={classes["tag-sets-head"]}>
            <div className={classes["tag-sets-title"]}>Tag sets</div>
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
          </div>
          <ul className={classes["tag-sets-versions"]}>
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
            {tagSetVersionsHtml}
          </ul>
          {curTagSetVersionId === "tsv-def" && (
            <ul className={classes["tag-sets"]}>{defTagSetsHtml}</ul>
          )}
          {curTagSetVersionId !== "tsv-def" && (
            <ul className={classes["tag-sets"]}>{versionTagsetsHtml}</ul>
          )}
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
    </div>
  );
};

export default CarouselImage;
