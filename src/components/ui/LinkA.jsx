import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import classes from "./LinkA.module.scss";

const LinkA = (props) => {
  const smoothScroll = (e) => {
    e.preventDefault();

    const scrollTarget = document.querySelector(props.href);
    const headerHeight = document.querySelector("#header").offsetHeight;
    const distToTop = window.scrollY + scrollTarget.getBoundingClientRect().top;
    window.scrollTo({ top: distToTop - headerHeight - 10, behavior: "smooth" });
  };

  return (
    <a
      className={`${classes.link} ${props.className || ""}`}
      target={props.external ? "_blank" : ""}
      rel="noreferrer nofollow"
      href={props.href}
      onClick={(e) => {
        if (props?.onClick) {
          props.onClick(e);
        }
        if (props?.smoothScroll) {
          smoothScroll(e);
        }
      }}
    >
      {props.children}
      {props.external && (
        <ArrowTopRightOnSquareIcon className={classes["link__external-icon"]} />
      )}
    </a>
  );
};

export default LinkA;
