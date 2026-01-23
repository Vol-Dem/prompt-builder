import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import classes from "./LinkA.module.scss";

/**
 * Anchor link with support for external targets and smooth scrolling.
 *
 * @param {string} href - Link URL or hash target.
 * @param {string} [className] - Optional custom class.
 * @param {boolean} [external] - Opens link in new tab.
 * @param {function} [onClick] - Optional click handler.
 * @param {boolean} [smoothScroll] - Enables smooth scroll for hash links.
 * @param {React.ReactNode} children - Link content.
 * @param {object} props - Native anchor attributes.
 * @returns {JSX.Element} Rendered link component.
 */
const LinkA = ({
  href,
  className,
  external,
  onClick,
  smoothScroll,
  children,
  ...props
}) => {
  const smoothScrollHandler = (e) => {
    e.preventDefault();

    const scrollTarget = document.querySelector(href);
    const headerHeight = document.querySelector("#header").offsetHeight;
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
