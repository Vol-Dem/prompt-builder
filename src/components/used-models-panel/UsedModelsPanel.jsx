import classes from "./UsedModelsPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import UsedCard from "../used-card/UsedCard";
import {
  removeImageFromPanel,
  usedModelsActions,
} from "../../store/usedModels";
import UpdateModelForm from "../forms/update-model-form/UpdateModelForm";
import ButtonTertiary from "../ui/ButtonTertiary";
import Buttton from "../ui/Button";
import CrossSvg from "../../assets/CrossSvg";
import Image from "../ui/image/Image";
import { modelActions } from "../../store/model";
import ImageSvg from "../../assets/ImageSvg";
import { authActions } from "../../store/auth";
import ArrowLeftSvg from "../../assets/ArrowLeft";
import ArrowRightSvg from "../../assets/ArrowRight";
import PlusSvg from "../../assets/PlusSvg";
import Bars2Svg from "../../assets/Bars2Svg";
import Bars4Svg from "../../assets/Bars4Svg";
import { useState } from "react";

const UsedModelsPanel = () => {
  const [cursorInitialX, setCursorInitialX] = useState(null);
  const [cursorCurX, setCursorCurX] = useState(null);
  const usedModels = useSelector((state) => state.used.models);
  const nsfwMode = useSelector((state) => state.model.nsfwMode);
  const usedImages = useSelector((state) => state.used.images);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const formIsOpen = useSelector((state) => state.used.formIsOpen);
  const fullCardView = useSelector((state) => state.used.fullCardView);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const emailVerified = useSelector((state) => state.auth.user.emailVerified);
  const dispatch = useDispatch();

  const openPanelHandler = () => {
    dispatch(usedModelsActions.panelState(!panelIsOpen));
  };
  const openFormHandler = () => {
    // if (!isAuth || !emailVerified) {
    if (!isAuth) {
      dispatch(authActions.openAuthForm(true));
    } else {
      dispatch(usedModelsActions.setFormIsOpen(!formIsOpen));
    }
  };

  const chageCardViewHandler = () => {
    dispatch(usedModelsActions.cardViewState());
  };

  const openImageHandler = (e) => {
    const hash = e.target.closest(`.${classes["ref-images__item"]}`).dataset.id;
    const image = usedImages.find((image) => image.hash === hash);

    if (hash) {
      dispatch(
        modelActions.setActiveCarouselData({
          images: [image],
          side: true,
        })
      );
      if (document.body.offsetWidth < 1024) {
        dispatch(usedModelsActions.panelState(false));
      }
    }
  };

  const closeImageHandler = (e) => {
    const hash = e.target.closest(`.${classes["ref-images__item"]}`).dataset.id;

    if (hash) {
      dispatch(removeImageFromPanel(hash));
    }
  };

  const usedModelsHtml = usedModels.map((model, i) => {
    return <UsedCard key={i} previewData={model} fullView={fullCardView} />;
  });

  const usedImagesHtml = [...Array(3).keys()].map((image, i) => {
    const nsfw =
      usedImages[i]?.nsfw === false ||
      usedImages[i]?.nsfw === "None" ||
      usedImages[i]?.nsfwLevel === 1
        ? false
        : true;
    if (!!usedImages[i]?.hash) {
      return (
        <li
          key={`i${i}`}
          className={classes["ref-images__item"]}
          data-id={usedImages[i]?.hash}
        >
          <Image
            src={usedImages[i].url}
            alt={`Reference image ${i++}`}
            onClick={openImageHandler}
            className={`${
              !nsfwMode && nsfw ? classes["ref-images__nsfw"] : ""
            }`}
          />
          <span className={classes.close} onClick={closeImageHandler}>
            <CrossSvg />
          </span>
        </li>
      );
    } else {
      return (
        <li key={`s${i}`} className={classes["ref-images__item--def"]}>
          <ImageSvg />
        </li>
      );
    }
  });

  const clearPanelHandler = () => {
    dispatch(usedModelsActions.clearPanel());
  };

  const moveElement = (e) => {
    const clientX = Math.round(e.clientX || e.touches[0].clientX);
    setCursorCurX(clientX);
  };

  const mouseDownHandler = (e) => {
    const clientX = Math.round(e.clientX || e.touches[0].clientX);
    setCursorInitialX(clientX);
  };

  const mouseUp = (e) => {
    if (!cursorInitialX || !cursorCurX) return;
    const offcet = Math.round(cursorInitialX) - Math.round(cursorCurX);
    setCursorCurX(null);
    setCursorInitialX(null);
    // console.log(offcet);
    // console.log(cursorInitialX);
    // console.log(cursorCurX);
    if (!!offcet && offcet > 0 && Math.abs(offcet) > 40) {
      dispatch(usedModelsActions.panelState(true));
    } else if (!!offcet && offcet < 0 && Math.abs(offcet) > 40) {
      dispatch(usedModelsActions.panelState(false));
    }
  };

  return (
    <aside
      className={`${classes.container} ${
        panelIsOpen ? classes["container--open"] : ""
      }`}
      onTouchEnd={mouseUp}
      onTouchStart={mouseDownHandler}
      onTouchMove={moveElement}
    >
      <button
        type="button"
        title={panelIsOpen ? "Close side panel" : "Open side panel"}
        onClick={openPanelHandler}
        className={classes["btn__open"]}
      >
        {!panelIsOpen && <ArrowLeftSvg />}
        {panelIsOpen && <ArrowRightSvg />}
      </button>
      <div
        className={`${classes.panel} ${
          panelIsOpen ? classes["panel--open"] : ""
        }`}
      >
        <div className={classes["options"]}>
          <Buttton className={classes["btn-forms"]} onClick={openFormHandler}>
            {!formIsOpen ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                New resource
              </>
            ) : (
              <>
                <CrossSvg />
                Hide form
              </>
            )}
          </Buttton>
          {/* <UpdateDb /> */}
          {/* {formIsOpen && isAuth && emailVerified && ( */}
          {formIsOpen && isAuth && (
            <div className={classes.forms}>
              <UpdateModelForm id="side-form" />
            </div>
          )}
          <div className={classes["controls"]}>
            <ButtonTertiary type="button" onClick={clearPanelHandler}>
              Clear
            </ButtonTertiary>
            <div>
              <ButtonTertiary
                type="button"
                className={`${classes["controls__btn"]} ${
                  !fullCardView ? classes["controls__btn--active"] : ""
                }`}
                onClick={chageCardViewHandler}
              >
                <Bars2Svg />
              </ButtonTertiary>
              <ButtonTertiary
                type="button"
                className={`${classes["controls__btn"]} ${
                  fullCardView ? classes["controls__btn--active"] : ""
                }`}
                onClick={chageCardViewHandler}
              >
                <Bars4Svg />
              </ButtonTertiary>
            </div>
          </div>
        </div>

        <ul className={classes["model-cards"]}>
          {!!usedImages.length && (
            <li>
              <ul className={classes["ref-images"]}>{usedImagesHtml}</ul>
            </li>
          )}
          {!!usedModelsHtml.length && usedModelsHtml}
          {!usedModelsHtml.length && (
            <div className={classes["model-cards__tip"]}>
              Press{" "}
              <span className={classes.plus}>
                <PlusSvg />
              </span>{" "}
              to add model or image to side panel
            </div>
          )}
        </ul>
        <div className={classes["support"]}>
          Support project:{" "}
          <a
            href="https://www.patreon.com/aidetools"
            target="_blank"
            rel="noreferrer nofollow"
          >
            <img
              height="16"
              src={require("../../assets/patreon-w.png")}
              border="0"
              alt="patreon"
            />
          </a>
          <a
            href="https://ko-fi.com/J3J31052RE"
            target="_blank"
            rel="noreferrer nofollow"
          >
            <img
              height="28"
              src="https://storage.ko-fi.com/cdn/brandasset/kofi_bg_tag_dark.png"
              border="0"
              alt="ko-fi"
            />
          </a>
        </div>
      </div>
    </aside>
  );
};

export default UsedModelsPanel;
