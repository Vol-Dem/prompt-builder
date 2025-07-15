import classes from "./AboutAddImageById.module.scss";
import NotificationMessage from "../ui/NotificationMessage";
import Text from "../ui/text/Text";
import Image from "../ui/image/Image";
import TextHighlight from "../ui/text/TextHighlight";
import TextImageBlock from "../ui/text/TextImageBlock";

const AboutAddImageById = () => {
  return (
    <NotificationMessage className={classes.notification}>
      <Text>
        Open the image on Civitai, then click the{" "}
        <span className={classes["btn-civ"]}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 8h.01"></path>
            <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"></path>
            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"></path>
            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"></path>
          </svg>
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
        src={require("../../assets/guide/url.png")}
        srcSet={require("../../assets/guide/url.webp")}
        alt="Url"
      />
      <p>
        <TextHighlight>Alternatively</TextHighlight>, on the post page, you can
        click{" "}
        <span className={`${classes["btn-civ"]} ${classes["btn-civ--share"]}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 4v4c-6.575 1.028 -9.02 6.788 -10 12c-.037 .206 5.384 -5.962 10 -6v4l8 -7l-8 -7z"></path>
          </svg>
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
          src={require("../../assets/guide/civ-share.jpg")}
          alt="Civ share"
          srcSet={require("../../assets/guide/civ-share.webp")}
          type="image/webp"
        />
      </TextImageBlock>
    </NotificationMessage>
  );
};

export default AboutAddImageById;
