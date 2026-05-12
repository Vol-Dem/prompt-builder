import { useEffect, useState, type RefObject } from "react";

import { getClientCoord } from "../utils/generalUtils";

type Axis = "X" | "Y";

/**
 * Adds a touch event to the provided element and changes the open state on slide.
 * Accepts reference to the element, configuration parameters, function to triger on state chage and initial state.
 * @param ref -  The reference to the element
 * @param axis - Slide axis
 * @param forward - Slide direction
 * @param thresholdOpen - Distance in pixels to change open state to true
 * @param thresholdClose - Distance in pixels to change open state to false
 * @param stateChangeCallback - A function wrapped in a React useCallback hook to be triggered when state changes
 * @param initialState - Initial state
 * @returns Current state
 */
const useTouchOpenState = (
  ref: RefObject<HTMLElement | null>,
  axis: Axis = "X",
  forward: boolean = true,
  thresholdOpen: number = 10,
  thresholdClose: number = 40,
  stateChangeCallback: (state: boolean) => void,
  initialState: boolean = false,
): boolean => {
  const [cursorInitialPoint, setCursorInitialPoint] = useState<number | null>(
    null,
  );
  const [cursorCurPoint, setCursorCurPoint] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(initialState);

  useEffect(() => {
    const elementRef = ref?.current;

    const moveElement = (e: TouchEvent) => {
      const { clientX, clientY } = getClientCoord(e);

      setCursorCurPoint(axis === "X" ? clientX : clientY);
    };

    const mouseDownHandler = (e: TouchEvent) => {
      const { clientX, clientY } = getClientCoord(e);

      setCursorInitialPoint(axis === "X" ? clientX : clientY);
    };

    const mouseUp = () => {
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
