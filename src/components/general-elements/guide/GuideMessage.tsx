import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { motion } from "framer-motion";

import classes from "./GuideMessage.module.scss";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import { guideActions } from "../../../store/guide";
import ExitGuideRequest from "./ExitGuideRequest";
import {
  GUIDE_LAST_STEP,
  GUIDE_LAST_STEP_TYPE,
} from "../../../variables/constants";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type {
  GuideArrowPossition,
  GuideType,
} from "../../../types/guide.types";
import type { AutoScrollTo } from "../../../types/general.types";

type GuideMessageProps = ComponentProps<"div"> & {
  type: GuideType;
  step: number | string | null;
  next?: boolean;
  arrowPosition?: GuideArrowPossition;
  autoScroll?: boolean;
  autoScrollTo?: AutoScrollTo;
};

/**
 * Guide message component.
 *
 * Renders an animated interactive tutorial message with navigation controls.
 * Provides "Next step" / "Finish tutorial" and "Exit" actions and optionally
 * auto-scrolls into view.
 *
 * Behavior:
 * - When `next` is false, the "Next step" button is disabled and its label is
 *   replaced with: "To proceed, perform the action highlighted in yellow".
 * - When the current step is the last one, renders "Finish tutorial" instead
 *   of "Next step".
 * - Renders a pointing arrow according to `arrowPosition`:
 *   0 - disabled
 *   1 - top left
 *   2 - top center
 *   3 - top right
 *   4 - right
 *   5 - bottom right
 *   6 - bottom center
 *   7 - bottom left
 *   8 - left
 *
 * Side effects:
 * - Dispatches `guideNextStep`, `setGuideIsActive`, and `setOutroIsActive`
 *   Redux actions on navigation events.
 *
 * @component
 *
 * @param {object} props
 * @param {('home' | 'model' | 'edit')} props.type - Tutorial type.
 * @param {number} props.step - Current guide step index.
 * @param {boolean} props.next - Whether the "Next step" button is enabled.
 * @param {number} props.arrowPosition - Index of predefined arrow position (0–8).
 * @param {boolean} [props.autoScroll=true] - Whether the message should auto-scroll into view.
 * @param {('start' | 'center' | 'end' | 'nearest')} [props.autoScrollTo="center"] - Vertical alignment when auto-scrolling.
 * @param {string} props.className - Positioning class name.
 * @param {React.ReactNode} props.children - Guide message content.
 *
 * @returns {JSX.Element} Guide message element.
 */
const GuideMessage = ({
  type,
  step,
  next,
  arrowPosition,
  autoScroll = true,
  autoScrollTo = "center",
  className,
  children,
}: GuideMessageProps) => {
  const [exitRequestIsOpen, setExitRequestIsOpen] = useState(false);
  const guideState = useAppSelector((state) => state.guide);
  const guideMessageRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const lastStep = type === GUIDE_LAST_STEP_TYPE && step === GUIDE_LAST_STEP;
  const curGuideIsActive = useMemo(() => {
    if (type && guideState && Object.hasOwn(guideState, type)) {
      return guideState[type].active;
    }
    return null;
  }, [type, guideState]);

  const closeGuideHandler = () => {
    dispatch(guideActions.setGuideIsActive(false));
  };
  const openExitRequestHandler = () => {
    setExitRequestIsOpen(true);
  };

  const nextStepHandler = () => {
    dispatch(guideActions.guideNextStep({ type: type }));
  };

  const finishHandler = () => {
    dispatch(guideActions.setGuideIsActive(false));
    dispatch(guideActions.setOutroIsActive(true));
  };

  useEffect(() => {
    if (autoScroll && guideMessageRef?.current && step) {
      guideMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: autoScrollTo,
      });
    }
  }, [step, autoScroll, autoScrollTo]);

  return (
    <>
      {guideState?.active && curGuideIsActive && (
        <motion.div
          layoutId="guide-message"
          ref={guideMessageRef}
          className={`${classes["guide-container"]} ${
            className ? className : ""
          }`}
        >
          <div className={`${classes.guide} ${classes["guide__content"]}`}>
            <div className={classes["guide__content__item"]}>
              <p className={classes["guide__content__text"]}>{children}</p>
            </div>
            <div className={classes["guide__controls"]}>
              <div className={classes["guide__controls-steps"]}>
                {!lastStep && (
                  <ButtonTertiary
                    type="button"
                    className={`${classes["guide__controls-btn"]} ${
                      next ? classes["guide__controls-btn--next"] : ""
                    }`}
                    onClick={nextStepHandler}
                    title={`${
                      next
                        ? "Next tip"
                        : "To proceed, perform the action highlighted in yellow"
                    }`}
                    disabled={!next}
                  >
                    <span>Next step</span> <ChevronRightIcon />
                  </ButtonTertiary>
                )}
                {lastStep && (
                  <ButtonTertiary
                    type="button"
                    className={`${classes["guide__controls-btn"]} ${
                      next ? classes["guide__controls-btn--next"] : ""
                    }`}
                    onClick={finishHandler}
                    title="Finish"
                  >
                    <span>Finish tutorial</span> <ChevronRightIcon />
                  </ButtonTertiary>
                )}
              </div>
            </div>
            <div
              className={`${classes["guide__arrow-bg"]} ${
                classes[`guide__arrow-bg--${arrowPosition || 0}`]
              }`}
            ></div>
            <button
              title="Exit guide"
              className={classes["guide__close"]}
              onClick={openExitRequestHandler}
            >
              <XMarkIcon />
            </button>
          </div>

          {exitRequestIsOpen && (
            <ExitGuideRequest
              onSubmit={closeGuideHandler}
              onClose={() => {
                setExitRequestIsOpen(false);
              }}
            >
              Are you sure you want to exit tutorial?
            </ExitGuideRequest>
          )}
        </motion.div>
      )}
    </>
  );
};

export default GuideMessage;
