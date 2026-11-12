import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

import classes from "./Tooltip.module.scss";
import type { OverrideFields } from "../../../shared/types/general";

type TooltipProps = OverrideFields<
  ComponentProps<"div">,
  {
    content: string | ReactNode;
    defSide?: "right" | "left" | "center";
    asChild?: boolean;
    label?: string;
  }
>;

type TooltipTriggerProps = {
  disabled?: boolean;
  children?: ReactNode;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

const openTooltips: HTMLElement[] = [];
const mergeDescriptions = (existing?: string, tooltipId?: string) =>
  [
    ...new Set([
      ...(existing?.split(/\s+/).filter(Boolean) || []),
      ...(tooltipId ? [tooltipId] : []),
    ]),
  ].join(" ") || undefined;

/**
 * Adaptive tooltip with automatic edge positioning.
 *
 * Calculates viewport collisions and adjusts direction.
 *
 * @param props
 * @param props.children - Trigger element.
 * @param props.content - Tooltip content.
 * @param props.className - Optional custom class.
 * @param props.defSide - Preferred opening side.
 * @returns Rendered tooltip.
 */
const Tooltip = ({
  children,
  content,
  className,
  defSide = "right",
  asChild = false,
  label,
  ...props
}: TooltipProps) => {
  const tooltipId = useId();
  const [interaction, setInteraction] = useState({
    hovered: false,
    focused: false,
    dismissed: false,
  });
  const hasContent = Boolean(content);
  const isOpen =
    hasContent &&
    (interaction.hovered || interaction.focused) &&
    !interaction.dismissed;
  const trigger =
    asChild && isValidElement<TooltipTriggerProps>(children) ? children : null;
  const disabled = !!trigger?.props.disabled;
  const useWrapperFocus = !trigger || disabled;
  const fallbackLabel =
    label ??
    trigger?.props["aria-label"] ??
    (typeof trigger?.props.children === "string"
      ? trigger.props.children
      : "More information");
  const [translateX, setTranslateX] = useState(defSide === "right" ? 100 : 0);
  const [translateY, setTranslateY] = useState(-100);
  const [borderRadius, setBorderRadius] = useState("10px 10px 10px 0");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateInteraction = (key: "hovered" | "focused", value: boolean) => {
    setInteraction((previous) => {
      const next = { ...previous, [key]: value };
      if (!next.hovered && !next.focused) next.dismissed = false;
      return next;
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (!tooltipRef.current || !contentRef.current) return;
    const tooltipSize = tooltipRef.current.getBoundingClientRect();
    const contentSize = contentRef.current.getBoundingClientRect();
    const positionDownRule = tooltipSize.top - contentSize.height - 70 < 0;
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

    if (defSide === "center") {
      setTranslateX(1);
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

    if (defSide === "center") {
      setBorderRadius("10px");
    }
  }, [isOpen, content, defSide]);

  useEffect(() => {
    const root = tooltipRef.current;
    if (!isOpen || !root) return;
    openTooltips.push(root);
    const onEscape = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        openTooltips.at(-1) !== root
      )
        return;
      const layer =
        event.target instanceof Element
          ? event.target.closest(
              '[role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"]',
            )
          : null;
      // Let a popup opened over this tooltip handle its own Escape first.
      if (layer && !layer.contains(root)) return;
      event.preventDefault();
      event.stopPropagation();
      setInteraction((previous) => ({ ...previous, dismissed: true }));
    };
    const doc = root.ownerDocument;
    doc.addEventListener("keydown", onEscape, true);
    return () => {
      doc.removeEventListener("keydown", onEscape, true);
      const index = openTooltips.indexOf(root);
      if (index !== -1) openTooltips.splice(index, 1);
    };
  }, [isOpen]);

  return (
    <div
      {...props}
      ref={tooltipRef}
      className={`${classes["tooltip"]} ${isOpen ? classes["tooltip--open"] : ""} ${className || ""}`}
      role={hasContent && useWrapperFocus ? "group" : props.role}
      tabIndex={
        hasContent && useWrapperFocus ? (props.tabIndex ?? 0) : props.tabIndex
      }
      aria-label={
        hasContent && useWrapperFocus ? fallbackLabel : props["aria-label"]
      }
      aria-disabled={hasContent && disabled ? true : props["aria-disabled"]}
      aria-describedby={mergeDescriptions(
        props["aria-describedby"],
        hasContent && useWrapperFocus ? tooltipId : undefined,
      )}
      onMouseEnter={(event) => {
        updateInteraction("hovered", true);
        props.onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        updateInteraction("hovered", false);
        props.onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        updateInteraction("focused", true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          updateInteraction("focused", false);
        props.onBlur?.(event);
      }}
    >
      {trigger
        ? cloneElement(trigger, {
            "aria-describedby": mergeDescriptions(
              trigger.props["aria-describedby"],
              hasContent ? tooltipId : undefined,
            ),
          })
        : children}
      {hasContent && (
        <div
          id={tooltipId}
          role="tooltip"
          hidden={!isOpen}
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
      )}
    </div>
  );
};

export default Tooltip;
