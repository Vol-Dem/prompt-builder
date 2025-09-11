import classes from "./UsedModelsPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import UsedCard from "../used-card/UsedCard";
import {
  switchSidePanelfullView,
  usedModelsActions,
} from "../../store/usedModels";
import ButtonTertiary from "../ui/ButtonTertiary";
import ArrowLeftSvg from "../../assets/ArrowLeft";
import ArrowRightSvg from "../../assets/ArrowRight";
import PlusSvg from "../../assets/PlusSvg";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import SidePanelGuide from "../ui/guide/model/SidePanelGuide";
import OpenSidePanelGuide from "../ui/guide/model/OpenSidePanelGuide";
import ReferenceImageList from "./reference-image-list/ReferenceImageList";
import { AnimatePresence, motion } from "framer-motion";
import { guideActions } from "../../store/guide";
import {
  Bars2Icon,
  Bars4Icon,
  BugAntIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { DEV_GUIDE_TEST } from "../../variables/constants";
import RightSidebarForm from "./right-sidebar-form/RightSidebarForm";
import discordIcon from "../../assets/discord.svg";
import discordWhiteIcon from "../../assets/discord-white.svg";
import LinkA from "../ui/LinkA";

const UsedModelsPanel = memo(() => {
  const [cursorInitialX, setCursorInitialX] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [cursorCurX, setCursorCurX] = useState(null);
  const usedModels = useSelector((state) => state.used.models);
  const usedImages = useSelector((state) => state.used.images);
  const panelIsOpen = useSelector((state) => state.used.panelIsOpen);

  const fullCardView = useSelector((state) => state.used.fullCardView);

  const sidePanelRef = useRef({ offsetWidth: 0 });
  const openPanelBtnRef = useRef({ offsetWidth: 20 });

  const dispatch = useDispatch();

  useEffect(() => {
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

  const usedModelsHtml = useMemo(() => {
    return usedModels.map((model, i) => {
      return (
        <div key={`side-card-${model.id}`} style={{ position: "relative" }}>
          <UsedCard
            layoutId={model.id}
            previewData={model}
            fullView={fullCardView}
          />
          <UsedCard previewData={model} fullView={fullCardView} />
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

    if (!!offcet && offcet > 0 && Math.abs(offcet) > 10) {
      dispatch(usedModelsActions.panelState(true));
    } else if (!!offcet && offcet < 0 && Math.abs(offcet) > 40) {
      dispatch(usedModelsActions.panelState(false));
    }
  };

  const openSupportHandler = () => {
    setShowSupport((prevState) => !prevState);
  };

  const closeSupportHandler = useCallback((e) => {
    if (!e.target.closest(`.${classes["support__contact"]}`)) {
      setShowSupport(false);
    }
  }, []);

  useEffect(() => {
    if (showSupport) {
      document.removeEventListener("click", closeSupportHandler);
      document.addEventListener("click", closeSupportHandler);
    } else {
      document.removeEventListener("click", closeSupportHandler);
    }

    return () => {
      document.removeEventListener("click", closeSupportHandler);
    };
  }, [showSupport, closeSupportHandler]);

  //guide test
  const nextStepHandler = () => {
    dispatch(guideActions.guideNextStep({ type: "model" }));
  };

  const prevStepHandler = () => {
    dispatch(guideActions.guidePrevStep({ type: "model" }));
  };
  //////////////

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
        width: panelIsOpen
          ? sidePanelRef?.current?.offsetWidth +
            openPanelBtnRef?.current?.offsetWidth
          : openPanelBtnRef?.current?.offsetWidth,
      }}
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
            {DEV_GUIDE_TEST && (
              <div>
                <button onClick={prevStepHandler}>prev</button>
                <button onClick={nextStepHandler}>next</button>
              </div>
            )}
            <RightSidebarForm />
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
            {/* <span className={classes["support__title"]}>Support project:</span>{" "} */}
            <div className={classes["support__links"]}>
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
                  alt="Patreon"
                  title="Patreon"
                  className={classes["support__icon"]}
                />
              </a>
              <a
                href="https://ko-fi.com/J3J31052RE"
                target="_blank"
                rel="noreferrer nofollow"
                title="Ko-Fi"
              >
                <img
                  width={341}
                  height={129}
                  loading="lazy"
                  src={require("../../assets/kofi_bg_tag_dark.webp")}
                  border="0"
                  alt="Ko-Fi"
                  className={classes["support__icon"]}
                />
              </a>
              <a
                href="https://discord.gg/ES2JbdMk"
                target="_blank"
                rel="noreferrer nofollow"
                title="Discord"
              >
                <img
                  width={528}
                  height={400}
                  loading="lazy"
                  src={discordIcon}
                  border="0"
                  alt="Discord"
                  className={classes["support__icon"]}
                />
              </a>
              <div className={classes["support__contact"]} title="Support">
                <div
                  className={classes["support__btn"]}
                  onClick={openSupportHandler}
                >
                  {/* <BugAntIcon /> */}
                  {/* <ChatBubbleLeftRightIcon /> */}
                  <ChatBubbleBottomCenterTextIcon />
                  {/* <WrenchScrewdriverIcon /> */}
                  {/* <QuestionMarkCircleIcon /> */}
                </div>
                {showSupport && (
                  <div className={classes["support__message"]}>
                    <h3>Support</h3>
                    <p>
                      If you need support, join us on Discord and write your
                      request in our{" "}
                      <a href="https://discord.com/channels/1411682549599830058/1411683748696821910">
                        #support
                      </a>{" "}
                      channel.
                    </p>
                    <p>
                      And if you want to leave feedback, you can also do it in
                      the{" "}
                      <a href="https://discord.com/channels/1411682549599830058/1411684242622119977">
                        #feedback
                      </a>{" "}
                      channel.
                    </p>
                    <a
                      href="https://discord.gg/ES2JbdMk"
                      target="_blank"
                      rel="noreferrer nofollow"
                      title="Discord"
                      className={classes["support__discord-join"]}
                    >
                      <img
                        width={528}
                        height={400}
                        src={discordWhiteIcon}
                        alt="Discord"
                      />
                      <span>Join Discord</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </motion.aside>
  );
});

export default UsedModelsPanel;
