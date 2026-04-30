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
 * @param {object} props
 * @param {string} [props.className] - Optional class name.
 * @param {React.ReactNode} props.children - Content.
 *
 * @returns {JSX.Element} Content comment element.
 */
const ContentComment = ({ children, className }: ContentCommentProps) => {
  return (
    <span className={`${classes.comment} ${className || ""}`}>{children}</span>
  );
};

export default ContentComment;
