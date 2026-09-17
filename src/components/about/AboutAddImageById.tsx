import CivitaiPostIcon from "../../assets/icons/CivitaiPostIcon";
import CivitaiShareIcon from "../../assets/icons/CivitaiShareIcon";
import classes from "./AboutAddImageById.module.scss";
import NotificationMessage from "../ui/NotificationMessage";
import Text from "../ui/text/Text";
import Image from "../ui/image/Image";
import TextHighlight from "../ui/text/TextHighlight";
import TextImageBlock from "../ui/text/TextImageBlock";
import urlImg from "../../assets/guide/url.png";
import urlImgWebm from "../../assets/guide/url.webp";
import civShare from "../../assets/guide/civ-share.jpg";
import civShareWebm from "../../assets/guide/civ-share.webp";

/**
 * Content for the About page "Add image by post ID" section.
 *
 * @component
 * @returns The "Add image by post ID" section content.
 */
const AboutAddImageById = () => {
  return (
    <NotificationMessage className={classes.notification}>
      <Text>
        Open the image on Civitai, then click the{" "}
        <span className={classes["btn-civ"]}>
          <CivitaiPostIcon />
          View Post
        </span>{" "}
        button at the top left, and{" "}
        <TextHighlight>copy the post URL</TextHighlight> or just the{" "}
        <TextHighlight>ID</TextHighlight> (it comes after{" "}
        <TextHighlight>/posts/</TextHighlight> in the URL).
      </Text>
      <Image
        loading="lazy"
        width={471}
        height={69}
        className={classes["img-short"]}
        src={urlImg}
        srcSet={urlImgWebm}
        alt="Url"
      />
      <p>
        <TextHighlight>Alternatively</TextHighlight>, on the post page, you can
        click{" "}
        <span className={`${classes["btn-civ"]} ${classes["btn-civ--share"]}`}>
          <CivitaiShareIcon />
          Share
        </span>{" "}
        and then "Copy Url".
      </p>
      <TextImageBlock>
        <Image
          loading="lazy"
          width={1424}
          height={695}
          fullView={true}
          className={classes["img"]}
          src={civShare}
          alt="Civ share"
          srcSet={civShareWebm}
          type="image/webp"
        />
      </TextImageBlock>
    </NotificationMessage>
  );
};

export default AboutAddImageById;
