import type { ComponentProps, ElementType, ReactNode } from "react";

import useCopyFeedback from "../../hooks/use-copy-feedback";
import Notification from "./Notification";

type CopyControlProps<T extends ElementType> = {
  as?: T;
  text: string;
  idleIcon: ReactNode;
  copiedIcon: ReactNode;
  className?: string;
  copiedClassName?: string;
  children?: ReactNode;
} & Omit<ComponentProps<T>, "as" | "children" | "className" | "onClick">;

const CopyControl = <T extends ElementType = "button">({
  as,
  text,
  idleIcon,
  copiedIcon,
  className,
  copiedClassName,
  children,
  ...props
}: CopyControlProps<T>) => {
  const Component: ElementType = as || "button";
  const { copied, copying, errorMessage, copy, clearError } = useCopyFeedback(text);

  return (
    <>
      <Component
        {...props}
        className={[className, copied && copiedClassName].filter(Boolean).join(" ")}
        onClick={copy}
        aria-busy={copying}
      >
        {children}
        {copied ? copiedIcon : idleIcon}
      </Component>
      {errorMessage && (
        <Notification type="warning" title="Copy failed" onClick={clearError}>
          {errorMessage}
        </Notification>
      )}
    </>
  );
};

export default CopyControl;
