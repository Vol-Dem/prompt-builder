import {
  FolderArrowDownIcon,
  FolderPlusIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import Video from "../../Video";
import classes from "./InfoGeneratedImages.module.scss";
import NotificationMessage from "../../NotificationMessage";
import InfoPostId from "./InfoPostId";
import TextHighlight from "../../text/TextHighlight";
import TextButton from "../../text/text-buttons/TextButton";
import TextButtonSquare from "../../text/text-buttons/TextButtonSquare";
import TextImageMenu from "../../text/text-buttons/TextImageMenu";
import Image from "../../image/Image";
import TextButtonSaved from "../../text/text-buttons/TextButtonSaved";
import faqImagesPoster from "../../../../assets/guide/2-faq-images-2.jpg";
import faqImagesMp4 from "../../../../assets/guide/2-faq-images-lite.mp4";
import imageSelect from "../../../../assets/guide/image-select.png";
import menu from "../../../../assets/guide/menu.png";

const InfoGeneratedImages = () => {
  return (
    <>
      <div className={classes.info}>
        <Video
          width={1920}
          height={1080}
          playsInline
          loop
          disablePictureInPicture
          preload="none"
          muted
          controls
          poster={faqImagesPoster}
          className={classes.video}
        >
          <source src={faqImagesMp4} type="video/mp4" />
        </Video>
        <p>
          <TextImageMenu /> – Click the button to open the image menu. Here you
          can set the image as the model preview or tag set preview, or remove
          it from a collection.
        </p>
        <p>
          <TextButtonSquare>
            <FolderArrowDownIcon />
          </TextButtonSquare>{" "}
          <TextHighlight>Save to model</TextHighlight> – Click to save the image
          to the current model. Saved images will appear in the "Saved" tab.
        </p>
        <p>
          <TextButtonSquare>
            <FolderPlusIcon />
          </TextButtonSquare>{" "}
          <TextHighlight>Save to collection</TextHighlight> – Click to save the
          image to a separate collection not linked to any model. You can find
          your collections in the "IMAGES" menu.
        </p>
        <p>
          <TextButtonSquare>
            <PlusIcon />
          </TextButtonSquare>{" "}
          – Click to add the image to the sidebar for quick access. Clicking
          again will remove the image from the sidebar.
        </p>
        <p>
          <TextButtonSquare>
            <Squares2X2Icon />
          </TextButtonSquare>{" "}
          – Click to quickly view all images in the post.
        </p>
        <h3 className={classes.h2}>Save images</h3>
        <p>
          You can <TextHighlight>save images</TextHighlight> from the generated
          list either <TextHighlight>to the current model page</TextHighlight>{" "}
          or <TextHighlight>to a separate collection</TextHighlight>, so you can
          use them as references later.
        </p>
        <h3 className={classes.h3}>To the current model page:</h3>
        <NotificationMessage>
          Use the{" "}
          <TextButtonSquare>
            <FolderArrowDownIcon />
          </TextButtonSquare>{" "}
          <TextHighlight>"Save to Model"</TextHighlight> button at the top left
          of an image. Then you can select the images from the post that you
          want to save. Click <TextButton>Save All</TextButton> or{" "}
          <TextButton>Save Selected</TextButton> to add it to the{" "}
          <TextButtonSaved /> tab of the current model.
          <Image
            width={897}
            height={375}
            className={`${classes["image"]}`}
            src={imageSelect}
            alt="Image select"
          />
        </NotificationMessage>
        <h3 className={classes.h3}>To a separate collection:</h3>
        <NotificationMessage>
          <p className={classes.text}>
            Hover over the{" "}
            <TextButtonSquare>
              <FolderArrowDownIcon />
            </TextButtonSquare>{" "}
            button and select{" "}
            <TextButtonSquare>
              <FolderPlusIcon />
            </TextButtonSquare>{" "}
            <TextHighlight>Save to Collection</TextHighlight> button. Then you
            can select the images from the post that you want to save. Click{" "}
            <TextButton>Save All</TextButton> or{" "}
            <TextButton>Save Selected</TextButton> to add images to a separate
            collection that is not linked to the current model.
          </p>
          <p className={classes.text}>
            You can find your collections in the{" "}
            <TextHighlight>IMAGES</TextHighlight> menu.
          </p>
          <Image
            width={644}
            height={78}
            className={`${classes["image"]}`}
            src={menu}
            alt="Menu"
          />
        </NotificationMessage>
        <h3 className={classes.h3}>Add image by ID:</h3>
        <p>
          Use the <TextButton>Add image by ID</TextButton> button to save an
          image by the post ID from Civitai.
        </p>
        <div>
          <InfoPostId className={classes.block} />
        </div>
        <h3 className={classes.h2}>Model preview</h3>
        <p>You can set any of the generated images as the model preview. </p>
        <NotificationMessage>
          <p className={classes.text}>
            Click the <TextImageMenu /> button in the top-right corner of the
            image and select <TextHighlight>Set as Preview</TextHighlight>
          </p>
        </NotificationMessage>
        <p>
          {" "}
          If NSFW Mode is enabled, you’ll also have the option to set a separate
          NSFW preview — it will only be displayed in that mode.
        </p>
        <NotificationMessage>
          <p className={classes.text}>
            To do this, click the <TextImageMenu /> button on the image and
            choose <TextHighlight>Set as NSFW preview</TextHighlight>
          </p>
        </NotificationMessage>
        <p>You can also set any generated image as the tag set preview.</p>
        <NotificationMessage>
          <p className={classes.text}>
            Click the <TextImageMenu /> button in the top-right corner of the
            image and select{" "}
            <TextHighlight>Set as tag set preview</TextHighlight>
          </p>
        </NotificationMessage>
      </div>
    </>
  );
};

export default InfoGeneratedImages;
