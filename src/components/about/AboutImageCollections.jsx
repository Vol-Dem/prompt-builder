import {
  ArrowDownTrayIcon,
  FolderArrowDownIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import Image from "../ui/image/Image";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextHighlight from "../ui/text/TextHighlight";
import classes from "./AboutImageCollections.module.scss";
import H2 from "../ui/text/H2";
import Text from "../ui/text/Text";
import TextImageBlock from "../ui/text/TextImageBlock";
import TextContentBlock from "../ui/text/TextContentBlock";
import TextButtonCreate from "../ui/text/text-buttons/TextButtonCreate";
import H3 from "../ui/text/H3";
import TextImageMenu from "../ui/text/text-buttons/TextImageMenu";
import TextButtonSquare from "../ui/text/text-buttons/TextButtonSquare";
import TextButtonCollection from "../ui/text/text-buttons/TextButtonCollection";
import AboutAddImageById from "./AboutAddImageById";

const AboutImageCollections = () => {
  return (
    <>
      <H2 id="collection">Image collections</H2>
      <TextContentBlock>
        <Text>
          You can save images into collections for easy access,{" "}
          <TextHighlight>organize</TextHighlight> by topic or purpose,{" "}
          <TextHighlight>store your favorite references</TextHighlight>, keep
          everything neatly arranged, and quickly{" "}
          <TextHighlight>add them to the sidebar</TextHighlight> for even more
          convenient use.
        </Text>
        <Text>
          There are two ways to create collections: directly while saving an
          image from a <TextHighlight>model’s page</TextHighlight> or through
          the <TextHighlight>sidebar</TextHighlight>.{" "}
        </Text>
        <H3 id="coll-model">From a model page</H3>
        <Text>
          Hover over the{" "}
          <TextButtonSquare>
            <FolderArrowDownIcon />
          </TextButtonSquare>{" "}
          button and click{" "}
          <TextButtonSquare>
            <FolderPlusIcon />
          </TextButtonSquare>{" "}
          Save to collection. Enter the name of a category and click{" "}
          <TextButtonCreate />
        </Text>
        <Text>
          {" "}
          — later you'll be able to select categories from a dropdown list. In
          the same way, add subcategories and the collection name. Click{" "}
          <TextButton>Choose images</TextButton> to select the images from the
          post that you want to add to the collection — you can select several
          or all of them at once.
        </Text>
        <TextImageBlock col={3}>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/20-collections-model-1.jpg")}
            alt="Collections model 1"
            srcSet={require("../../assets/about/20-collections-model-1.webp")}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/20-collections-model-2.jpg")}
            alt="Collections model 2"
            srcSet={require("../../assets/about/20-collections-model-2.webp")}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/20-collections-model-3.jpg")}
            alt="Collections model 3"
            srcSet={require("../../assets/about/20-collections-model-3.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          After saving the images, the collection will appear on the{" "}
          <TextHighlight>IMAGES</TextHighlight> page, which you can access
          through the top menu. Saved posts are also shown in the upload queue{" "}
          <ArrowDownTrayIcon className={classes.svg} /> , so you can use it to
          quickly navigate to your collection.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/20-collections-model-4.jpg")}
            alt="Collections model 4"
            srcSet={require("../../assets/about/20-collections-model-4.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <H3 id="coll-sidebar">Through the sidebar</H3>
        <Text>
          Click the <TextButton>New resource</TextButton> button and select{" "}
          <TextButtonCollection />. Then enter and click <TextButtonCreate />{" "}
          for the category, subcategories, and the collection name. In this
          case, an empty collection will appear on the{" "}
          <TextHighlight>IMAGES</TextHighlight> page, and it will be available
          in the dropdown list when saving images later.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/21-collections-sidebar.jpg")}
            alt="Collections model 5"
            srcSet={require("../../assets/about/21-collections-sidebar.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <H3 id="coll-post">Add image by post ID</H3>
        <Text>
          Use the <TextButton>Add image by ID</TextButton> button to save an
          image by the post ID from Civitai. To add an image, use the{" "}
          <TextHighlight>Post ID</TextHighlight> from Civitai (not the image
          ID).{" "}
        </Text>
        <AboutAddImageById />
        <Text>
          {" "}
          Paste the <TextHighlight>post ID</TextHighlight> into the appropriate
          field and click <TextButton>Select images</TextButton>. Choose the
          ones you want to add and click <TextButton>Save selected</TextButton>{" "}
          or <TextButton>Save all</TextButton>.
        </Text>
        <H3 id="coll-preview">Collection preview</H3>
        <Text>
          Any image in a collection can be set as its preview. To do this, click{" "}
          <TextImageMenu /> in the upper-right corner of the image and select{" "}
          <TextHighlight>Set as preview</TextHighlight>. If you’re using NSFW
          mode, there will also be an option{" "}
          <TextHighlight>Set as NSFW preview</TextHighlight> — in that case, the
          selected preview will only be shown when NSFW mode is enabled.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/20-collections-prev.jpg")}
            alt="Collections model 6"
            srcSet={require("../../assets/about/20-collections-prev.webp")}
            type="image/webp"
          />
        </TextImageBlock>
      </TextContentBlock>
    </>
  );
};

export default AboutImageCollections;
