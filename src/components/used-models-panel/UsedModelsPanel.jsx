import classes from "./UsedModelsPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import UsedCard from "../used-card/UsedCard";
import {
  removeImageFromPanel,
  switchSidePanelfullView,
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
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SETTINGS_REF_IMAGE_ROW_LENGTH } from "../../variables/constants";
import ErrorMessage from "../ui/ErrorMessage";
import SidePanelGuide from "../ui/guide/model/SidePanelGuide";
import OpenSidePanelGuide from "../ui/guide/model/OpenSidePanelGuide";
import { useLocation } from "react-router-dom";
import ReferenceImageList from "./reference-image-list/ReferenceImageList";
import { AnimatePresence, motion } from "framer-motion";
import { guideActions } from "../../store/guide";
import { Bars2Icon, Bars4Icon, TrashIcon } from "@heroicons/react/24/outline";
import SaveToCollectionForm from "../forms/save-to-collection-form/SaveToCollectionForm";

const UsedModelsPanel = memo(() => {
  const [cursorInitialX, setCursorInitialX] = useState(null);
  const [resourceType, setResourceType] = useState("model");
  const [cursorCurX, setCursorCurX] = useState(null);
  // const [formIsOpen, setFormIsOpen] = useState(false);
  const usedModels = useSelector((state) => state.used.models);
  const usedImages = useSelector((state) => state.used.images);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);
  const formIsOpen = useSelector((state) => state.used.formIsOpen);
  const fullCardView = useSelector((state) => state.used.fullCardView);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const sidePanelRef = useRef({ offsetWidth: 0 });
  const openPanelBtnRef = useRef({ offsetWidth: 20 });
  // const location = useLocation();
  // const location = false;
  const userDataIsLoading = useSelector(
    (state) => state.auth.userDataIsLoading
  );
  const userDataLoadError = useSelector(
    (state) => state.auth.userDataLoadError
  );
  // const emailVerified = useSelector((state) => state.auth.user.emailVerified);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (location?.pathname) {
  //     dispatch(usedModelsActions.setFormIsOpen(false));
  //   }
  // }, [location?.pathname, dispatch]);

  useEffect(() => {
    // console.log(
    //   "SIDE",
    //   sidePanelRef.current.offsetWidth,
    //   openPanelBtnRef.current.offsetWidth
    // );
    if (sidePanelRef?.current && openPanelBtnRef?.current) {
      dispatch(
        usedModelsActions.setSidePanelWidth(
          sidePanelRef.current.offsetWidth + openPanelBtnRef.current.offsetWidth
        )
      );
    }
  }, [panelIsOpen, dispatch]);

  const openPanelHandler = () => {
    dispatch(usedModelsActions.panelState(!panelIsOpen));
  };
  const openFormHandler = () => {
    // setFormIsOpen((prevState) => !prevState);
    // if (!isAuth || !emailVerified) {
    if (!isAuth) {
      dispatch(authActions.openAuthForm(true));
    } else {
      setResourceType("model");
      dispatch(usedModelsActions.setFormIsOpen(!formIsOpen));
    }
  };

  // const chageCardViewHandler = () => {
  //   dispatch(usedModelsActions.cardViewState());
  // };

  // const closeFormHandler = useCallback((value) => {
  //   // setFormIsOpen(value);
  // }, []);

  const usedModelsHtml = useMemo(() => {
    return usedModels.map((model, i) => {
      return (
        <div key={`side-card-${model.id}`} style={{ position: "relative" }}>
          <UsedCard
            layoutId={model.id}
            previewData={model}
            fullView={fullCardView}
            // onClick={closeFormHandler}
          />
          <UsedCard
            previewData={model}
            fullView={fullCardView}
            // onClick={closeFormHandler}
          />
        </div>
      );
    });
  }, [usedModels, fullCardView]);

  const usedImagesHtml = <ReferenceImageList usedImages={usedImages} />;

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

  const nextStepHandler = () => {
    dispatch(guideActions.guideNextStep({ type: "model" }));
  };

  const prevStepHandler = () => {
    dispatch(guideActions.guidePrevStep({ type: "model" }));
  };

  const resourceTypeHandler = (e) => {
    const type = e.target.dataset.value;
    if (type) {
      setResourceType(type);
    }
  };

  return (
    <motion.aside
      // layout
      className={`${classes.container} ${
        panelIsOpen ? classes["container--open"] : ""
      }`}
      onTouchEnd={mouseUp}
      onTouchStart={mouseDownHandler}
      onTouchMove={moveElement}
      animate={{
        // transform: `translateX(${
        //   !panelIsOpen ? sidePanelRef?.current?.offsetWidth : 0
        // }px)`,
        width: panelIsOpen
          ? sidePanelRef?.current?.offsetWidth +
            openPanelBtnRef?.current?.offsetWidth
          : openPanelBtnRef?.current?.offsetWidth,
      }}
      // style={{
      //   transform: `translateX(${sidePanelRef?.current?.offsetWidth || 0}px)`,
      //   // transform: `translateX(100% - ${
      //   //   openPanelBtnRef?.current?.offsetWidth || 0
      //   // }px)`,
      // }}
    >
      <>
        <button
          ref={openPanelBtnRef}
          type="button"
          title={panelIsOpen ? "Close side panel" : "Open side panel"}
          onClick={openPanelHandler}
          className={classes["btn__open"]}
        >
          {!panelIsOpen && <ArrowLeftSvg />}
          {panelIsOpen && <ArrowRightSvg />}
        </button>
        <OpenSidePanelGuide />
        <motion.div
          ref={sidePanelRef}
          // layout
          className={`${classes.panel} ${
            panelIsOpen ? classes["panel--open"] : ""
          }`}
        >
          <div className={classes["options"]}>
            <div className={classes["options__btns"]}>
              {formIsOpen && (
                <div className={classes["options__type"]}>
                  <button
                    className={`${classes["options__type-btn"]} ${
                      resourceType === "model"
                        ? classes["options__type-btn--active"]
                        : ""
                    }`}
                    onClick={resourceTypeHandler}
                    data-value="model"
                  >
                    Model
                  </button>
                  <button
                    className={`${classes["options__type-btn"]} ${
                      resourceType === "collection"
                        ? classes["options__type-btn--active"]
                        : ""
                    }`}
                    onClick={resourceTypeHandler}
                    data-value="collection"
                  >
                    Collection
                  </button>
                </div>
              )}
              <Buttton
                title="Hide form"
                className={`${classes["btn-forms"]} ${
                  formIsOpen ? classes["btn-forms--close"] : ""
                }`}
                onClick={openFormHandler}
                disabled={!!userDataLoadError || userDataIsLoading}
              >
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
                    {/* Hide form */}
                  </>
                )}
              </Buttton>
            </div>

            <div>
              {/* <button onClick={prevStepHandler}>prev</button>
              <button onClick={nextStepHandler}>next</button> */}
            </div>
            {userDataLoadError && (
              <ErrorMessage>{userDataLoadError}</ErrorMessage>
            )}
            {/* <UpdateDb /> */}
            {/* {formIsOpen && isAuth && emailVerified && ( */}
            <AnimatePresence>
              {formIsOpen && isAuth && (
                <div className={classes.forms}>
                  {resourceType === "model" && (
                    <UpdateModelForm id="side-form" />
                  )}
                  {resourceType === "collection" && (
                    <SaveToCollectionForm id="side-form" />
                  )}
                </div>
              )}
            </AnimatePresence>
            <div className={classes["controls"]}>
              <ButtonTertiary
                className={classes["controls__clear"]}
                type="button"
                onClick={clearPanelHandler}
              >
                <TrashIcon className={classes["controls__svg"]} /> Clear
              </ButtonTertiary>
              <div>
                <ButtonTertiary
                  type="button"
                  className={`${classes["controls__btn"]} ${
                    !fullCardView ? classes["controls__btn--active"] : ""
                  }`}
                  onClick={() => {
                    dispatch(switchSidePanelfullView(false));
                  }}
                  title="Short view"
                >
                  <Bars2Icon />
                </ButtonTertiary>
                <ButtonTertiary
                  type="button"
                  className={`${classes["controls__btn"]} ${
                    fullCardView ? classes["controls__btn--active"] : ""
                  }`}
                  onClick={() => {
                    dispatch(switchSidePanelfullView(true));
                  }}
                  title="Expanded view"
                >
                  <Bars4Icon />
                </ButtonTertiary>
              </div>
            </div>
            <SidePanelGuide />
          </div>

          <div className={classes["model-cards"]}>
            <AnimatePresence>
              {!!usedImages.length && usedImagesHtml}
              {!!usedModelsHtml.length && usedModelsHtml}
            </AnimatePresence>
            {!usedModelsHtml.length && !usedImages.length && (
              <div className={classes["model-cards__tip"]}>
                Press{" "}
                <span className={classes.plus}>
                  <PlusSvg />
                </span>{" "}
                to add model or image to side panel
              </div>
            )}
          </div>
          <div className={classes["support"]}>
            <span className={classes["support__title"]}>Support project:</span>{" "}
            <a
              href="https://www.patreon.com/aidetools"
              target="_blank"
              rel="noreferrer nofollow"
            >
              <img
                width={520}
                height={108}
                loading="lazy"
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
                width={341}
                height={129}
                loading="lazy"
                src={require("../../assets/kofi_bg_tag_dark.webp")}
                // src="https://storage.ko-fi.com/cdn/brandasset/kofi_bg_tag_dark.png"
                border="0"
                alt="ko-fi"
              />
            </a>
          </div>
        </motion.div>
      </>
    </motion.aside>
  );
});

export default UsedModelsPanel;
