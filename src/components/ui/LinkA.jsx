import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import classes from "./LinkA.module.scss";

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
