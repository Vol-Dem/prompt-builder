import { useEffect, useRef, useState } from "react";
import ExclamationCircleSvg from "../../assets/ExclamationCircleSvg";
import classes from "./Tooltip.module.scss";

const Tooltip = (props) => {
  const [translateX, setTranslateX] = useState(100);
  const [translateY, setTranslateY] = useState(-100);
  const [borderRadius, setBorderRadius] = useState("10px 10px 10px 0");
  const tooltipRef = useRef();
  const contentRef = useRef();

  const setTranslateHandler = () => {
    const tooltipSize = tooltipRef.current.getBoundingClientRect();
    const contentSize = contentRef.current.getBoundingClientRect();
    const positionDownRule = tooltipSize.top - contentSize.height - 50 < 0;
    const positionLeftRule =
      document.body.offsetWidth - tooltipSize.right - contentSize.width < 0;

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
      className={classes["tooltip"]}
      onMouseEnter={setTranslateHandler}
    >
      <ExclamationCircleSvg />
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
        {props.children}
      </div>
    </div>
  );
};

export default Tooltip;
