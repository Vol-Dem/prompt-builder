import type { ComponentProps, ReactNode } from "react";
import classes from "./UploadingList.module.scss";
import type { OverrideFields } from "../../../../../shared/types/general";

type UploadingListProps = OverrideFields<
  ComponentProps<"div">,
  {
    title: ReactNode;
    buttons: ReactNode;
  }
>;

/**
 * Uploading list container.
 *
 * Renders a titled dropdown panel used by the uploading queue, including
 * a header with control buttons and a content area for list items.
 *
 * @component
 *
 * @param props
 * @param props.title - Dropdown title displayed in the header.
 * @param props.buttons - Optional control buttons rendered in the header.
 * @param props.children - Uploading list content.
 *
 * @returns The uploading list container element.
 */
const UploadingList = ({ children, title, buttons }: UploadingListProps) => {
  return (
    <>
      <div className={classes["panel"]}>
        <div
          className={`${classes["panel__title"]} ${classes["panel__title--rejected"]}`}
        >
          {title}
        </div>
        <div className={classes["btns-container"]}>{buttons}</div>
      </div>
      <ul>{children}</ul>
    </>
  );
};

export default UploadingList;
