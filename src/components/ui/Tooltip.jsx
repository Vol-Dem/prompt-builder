import { useRef, useState } from "react";

import classes from "./Tooltip.module.scss";

const Tooltip = ({ children, content, className, defSide = "right" }) => {
  const [translateX, setTranslateX] = useState(defSide === "right" ? 100 : 0);
  const [translateY, setTranslateY] = useState(-100);
  const [borderRadius, setBorderRadius] = useState("10px 10px 10px 0");
  const tooltipRef = useRef();
  const contentRef = useRef();

  const setTranslateHandler = () => {
    const tooltipSize = tooltipRef.current.getBoundingClientRect();
    const contentSize = contentRef.current.getBoundingClientRect();
    const positionDownRule = tooltipSize.top - contentSize.height - 50 < 0;
    const positionLeftRule =
      document.body.offsetWidth - tooltipSize.right - contentSize.width < 0 ||
      defSide === "left";

    if (positionDownRule) {
      setTranslateY(0);
    } else {
      setTranslateY(-100);
    }

    if (positionLeftRule) {
      setTranslateX(0);
    } else {
      setTranslateX(100);
    }

    if (positionDownRule && positionLeftRule) {
      setBorderRadius("10px 0 10px 10px");
    } else if (positionDownRule && !positionLeftRule) {
      setBorderRadius("0 10px 10px 10px");
    } else if (!positionDownRule && positionLeftRule) {
      setBorderRadius("10px 10px 0 10px");
    } else if (!positionDownRule && !positionLeftRule) {
      setBorderRadius(" 10px 10px 10px 0");
    }
  };

  return (
    <div
      ref={tooltipRef}
      className={`${classes["tooltip"]} ${className || ""}`}
      onMouseEnter={setTranslateHandler}
    >
      {children}
      <div
        ref={contentRef}
        className={classes["tooltip-content"]}
        style={{
          transform: `translate(${translateX}%, ${translateY}%)`,
          top: `${translateY < 0 ? 0 : 100}%`,
          right: `${translateX > 0 ? 0 : 100}%`,
          borderRadius: borderRadius,
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
