import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";

/**
 * Wraps the main routed content and dynamically offsets it from the top
 * based on header and prompt visibility.
 *
 * Calculates and applies top padding to prevent the fixed header and prompt
 * UI from overlapping the page content.
 *
 * @component
 *
 * @param {object} props
 * @param {React.RefObject<HTMLElement>} props.headerRef - Ref to the header element used to calculate layout offset.
 * @param {React.ReactNode} props.children - Routed page content.
 *
 * @returns {JSX.Element} Main content container with dynamic top padding.
 */
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
