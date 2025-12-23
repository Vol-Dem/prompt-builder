import { useEffect, useState } from "react";

import { getClientCoord } from "../utils/generalUtils";

/**
 * Adds a touch event to the provided element and changes the open state on slide.
 * Accepts reference to the element, configuration parameters, function to triger on state chage and initial state.
 * @param {React.MutableRefObject} ref -  The reference to the element
 * @param {('X'|'Y')} axis - Slide axis
 * @param {Boolean} forward - Slide direction
 * @param {Number} thresholdOpen - Distance in pixels to change open state to true
 * @param {Number} thresholdClose - Distance in pixels to change open state to false
 * @param {Function} stateChangeCallback - A function wrapped in a React useCallback hook to be triggered when state changes
 * @param {Boolean} initialState - Initial state
 * @returns {Boolean} Current state
 */
const useTouchOpenState = (
  ref,
  axis = "X",
  forward = true,
  thresholdOpen = 10,
  thresholdClose = 40,
  stateChangeCallback,
  initialState = false
) => {
  const [cursorInitialPoint, setCursorInitialPoint] = useState(null);
  const [cursorCurPoint, setCursorCurPoint] = useState(null);
  const [isOpen, setIsOpen] = useState(initialState);

  useEffect(() => {
    const elementRef = ref?.current;

    const moveElement = (e) => {
      const { clientX, clientY } = getClientCoord(e);

      setCursorCurPoint(axis === "X" ? clientX : clientY);
    };

    const mouseDownHandler = (e) => {
      const { clientX, clientY } = getClientCoord(e);

      setCursorInitialPoint(axis === "X" ? clientX : clientY);
    };

    const mouseUp = (e) => {
      if (!cursorInitialPoint || !cursorCurPoint) return;
      const offcet =
        Math.round(cursorInitialPoint) - Math.round(cursorCurPoint);
      setCursorCurPoint(null);
      setCursorInitialPoint(null);

      const forwardOpen = forward ? offcet > 0 : offcet < 0;
      const forwardClose = forward ? offcet < 0 : offcet > 0;

      if (!!offcet && forwardOpen && Math.abs(offcet) > thresholdOpen) {
        setIsOpen(true);
        if (stateChangeCallback && typeof stateChangeCallback === "function")
          stateChangeCallback(true);
      } else if (
        !!offcet &&
        forwardClose &&
        Math.abs(offcet) > thresholdClose
      ) {
        setIsOpen(false);
        if (stateChangeCallback && typeof stateChangeCallback === "function")
          stateChangeCallback(false);
      }
    };

    if (elementRef) {
      elementRef.addEventListener("touchstart", mouseDownHandler);
      elementRef.addEventListener("touchend", mouseUp);
      elementRef.addEventListener("touchmove", moveElement);
    }

    return () => {
      if (elementRef) {
        elementRef.removeEventListener("touchstart", mouseDownHandler);
        elementRef.removeEventListener("touchend", mouseUp);
        elementRef.removeEventListener("touchmove", moveElement);
      }
    };
  }, [
    ref,
    axis,
    forward,
    cursorCurPoint,
    cursorInitialPoint,
    thresholdOpen,
    thresholdClose,
    stateChangeCallback,
  ]);

  return isOpen;
};

export default useTouchOpenState;
