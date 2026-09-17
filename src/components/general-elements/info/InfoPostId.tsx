import Image from "../../ui/image/Image";
import NotificationMessage from "../../ui/NotificationMessage";
import TextHighlight from "../../ui/text/TextHighlight";
import CivitaiPostIcon from "../../../assets/icons/CivitaiPostIcon";
import CivitaiShareIcon from "../../../assets/icons/CivitaiShareIcon";
import classes from "./InfoPostId.module.scss";
import url from "../../../assets/guide/url.png";
import urlWebp from "../../../assets/guide/url.webp";
import civShare from "../../../assets/guide/civ-share.png";
import civShareWebp from "../../../assets/guide/civ-share.webp";
import type { ComponentProps } from "react";

type InfoPostIdProps = ComponentProps<"div">;

/**
 * Content for the post ID hint.
 *
 * @component
 * @returns The post ID hint.
 */
const InfoPostId = ({ className }: InfoPostIdProps) => {
  return (
    <div className={`${classes.info} ${className || ""}`}>
      <p>
        To add an image, use the <TextHighlight>Post ID</TextHighlight> from
        Civitai (not the image ID).{" "}
      </p>
      <NotificationMessage>
        <p>
          Open the image on Civitai, then click the{" "}
          <span className={classes["btn-civ"]}>
            <CivitaiPostIcon />
            View Post
          </span>{" "}
          button at the top left, and{" "}
          <TextHighlight>copy the post URL</TextHighlight> or just the{" "}
          <TextHighlight>ID</TextHighlight> (it comes after{" "}
          <TextHighlight>/posts/</TextHighlight> in the URL).
        </p>
        <Image
          width={256}
          height={35}
          className={`${classes["image"]} ${classes["image--short"]}`}
          src={url}
          srcSet={urlWebp}
          alt="Url"
        />
      </NotificationMessage>
      <NotificationMessage>
        <p>
          Alternatively, on the post page, you can click{" "}
          <span
            className={`${classes["btn-civ"]} ${classes["btn-civ--share"]}`}
          >
            <CivitaiShareIcon />
            Share
          </span>{" "}
          and then "Copy Url".
        </p>
        <Image
          width={1424}
          height={695}
          className={classes["image"]}
          src={civShare}
          srcSet={civShareWebp}
          alt="Civ share"
        />
      </NotificationMessage>
    </div>
  );
};

export default InfoPostId;
