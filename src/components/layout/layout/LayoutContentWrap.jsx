import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";

const LayoutContentWrap = ({ headerRef, children }) => {
  const promptIsOpen = useSelector((state) => state.prompt.promptIsOpen);
  const promptBtnHeight = useSelector((state) => state.prompt.promptBtnHeight);
  const promptHeight = useSelector((state) => state.prompt.promptHeight);
  const headerIsFixed = useSelector((state) => state.general.headerIsFixed);
  const mainRef = useRef(null);

  const paddingMain = useMemo(() => {
    if (
      headerIsFixed &&
      headerRef?.current?.offsetHeight &&
      promptHeight &&
      promptIsOpen
    ) {
      return headerRef.current.offsetHeight + promptHeight + promptBtnHeight;
    } else if (
      headerIsFixed &&
      headerRef?.current?.offsetHeight &&
      promptHeight &&
      !promptIsOpen
    ) {
      return headerRef.current.offsetHeight + promptBtnHeight;
    } else {
      return null;
    }
  }, [headerIsFixed, headerRef, promptHeight, promptIsOpen, promptBtnHeight]);

  return (
    <main ref={mainRef} style={{ paddingTop: paddingMain }}>
      <div className="wrapper">{children}</div>
    </main>
  );
};

export default LayoutContentWrap;
