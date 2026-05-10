import { useMemo, useRef, type ComponentProps } from "react";
import { useAppSelector } from "../../../store/hooks/hooks";

type LayoutContentWrapProps = ComponentProps<"main"> & {
  offsetHeight?: number | null;
};

/**
 * Wraps the main routed content and dynamically offsets it from the top
 * based on header and prompt visibility.
 *
 * Calculates and applies top padding to prevent the fixed header and prompt
 * UI from overlapping the page content.
 *
 * @component
 *
 * @param props
 * @param props.ref - Ref to the header element used to calculate layout offset.
 * @param props.children - Routed page content.
 *
 * @returns {JSX.Element} Main content container with dynamic top padding.
 */
const LayoutContentWrap = ({
  offsetHeight,
  children,
}: LayoutContentWrapProps) => {
  const promptIsOpen = useAppSelector((state) => state.prompt.promptIsOpen);
  const promptBtnHeight = useAppSelector(
    (state) => state.prompt.promptBtnHeight,
  );
  const promptHeight = useAppSelector((state) => state.prompt.promptHeight);
  const headerIsFixed = useAppSelector((state) => state.general.headerIsFixed);
  const mainRef = useRef<HTMLDivElement>(null);

  const paddingMain = useMemo(() => {
    if (headerIsFixed && offsetHeight && promptHeight && promptBtnHeight) {
      return promptIsOpen
        ? offsetHeight + promptHeight + promptBtnHeight
        : offsetHeight + promptBtnHeight;
    } else {
      return undefined;
    }
  }, [
    headerIsFixed,
    offsetHeight,
    promptHeight,
    promptIsOpen,
    promptBtnHeight,
  ]);

  return (
    <main ref={mainRef} style={{ paddingTop: paddingMain }}>
      <div className="wrapper">{children}</div>
    </main>
  );
};

export default LayoutContentWrap;
