import type { ComponentProps, ElementType, ReactNode } from "react";

import useCopyFeedback from "../../hooks/use-copy-feedback";

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
  const { copied, copy } = useCopyFeedback(text);

  return (
    <Component
      {...props}
      className={[className, copied && copiedClassName].filter(Boolean).join(" ")}
      onClick={copy}
    >
      {children}
      {copied ? copiedIcon : idleIcon}
    </Component>
  );
};

export default CopyControl;
