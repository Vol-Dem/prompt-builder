import type { ComponentProps } from "react";
import classes from "./ContentComment.module.scss";
type ContentCommentProps = ComponentProps<"span">;

/**
 * Content comment container.
 *
 * Renders content comment
 *
 * @component
 *
 * @param props
 * @param props.className - Optional class name.
 * @param props.children - Content.
 *
 * @returns Content comment element.
 */
const ContentComment = ({ children, className }: ContentCommentProps) => {
  return (
    <span className={`${classes.comment} ${className || ""}`}>{children}</span>
  );
};

export default ContentComment;
