import type { ComponentProps } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import classes from "./LinkA.module.scss";

type LinkAProps = ComponentProps<"a"> & {
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  smoothScroll?: boolean;
};

/**
 * Anchor link with support for external targets and smooth scrolling.
 *
 * @param props.href - Link URL or hash target.
 * @param props.className - Optional custom class.
 * @param props.external - Opens link in new tab.
 * @param props.onClick - Optional click handler.
 * @param props.smoothScroll - Enables smooth scroll for hash links.
 * @param props.children - Link content.
 * @param props - Native anchor attributes.
 * @returns Rendered link component.
 */
const LinkA = ({
  href,
  className,
  external,
  onClick,
  smoothScroll,
  children,
  ...props
}: LinkAProps) => {
  const smoothScrollHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!href) return;

    const scrollTarget = document.querySelector(href) as HTMLElement;
    const headerHeight = (document.querySelector("#header") as HTMLDivElement)
      .offsetHeight;
    const distToTop = window.scrollY + scrollTarget.getBoundingClientRect().top;
    window.scrollTo({ top: distToTop - headerHeight - 10, behavior: "smooth" });
  };

  return (
    <a
      className={`${classes.link} ${className || ""}`}
      target={external ? "_blank" : ""}
      rel="noreferrer nofollow"
      href={href}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }
        if (smoothScroll) {
          smoothScrollHandler(e);
        }
      }}
      {...props}
    >
      {children}
      {external && (
        <ArrowTopRightOnSquareIcon className={classes["link__external-icon"]} />
      )}
    </a>
  );
};

export default LinkA;
