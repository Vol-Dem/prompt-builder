import {
  ArrowDownTrayIcon,
  FolderArrowDownIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";

import Image from "../../components/ui/image/Image";
import TextButton from "../../components/ui/text/text-buttons/TextButton";
import TextHighlight from "../../components/ui/text/TextHighlight";
import classes from "./AboutImageCollections.module.scss";
import Text from "../../components/ui/text/Text";
import TextImageBlock from "../../components/ui/text/TextImageBlock";
import TextContentBlock from "../../components/ui/text/TextContentBlock";
import TextButtonCreate from "../../components/ui/text/text-buttons/TextButtonCreate";
import H3 from "../../components/ui/text/H3";
import TextImageMenu from "../../components/ui/text/text-buttons/TextImageMenu";
import TextButtonSquare from "../../components/ui/text/text-buttons/TextButtonSquare";
import TextButtonCollection from "../../components/ui/text/text-buttons/TextButtonCollection";
import AboutAddImageById from "../../components/about/AboutAddImageById";
import H1 from "../../components/ui/text/H1";
import AboutContentWrap from "../../components/about/layout/AboutContentWrap";
import AboutSection from "../../components/about/layout/AboutSection";
import collectionsModel from "../../assets/about/20-collections-model-1.jpg";
import collectionsModelWebm from "../../assets/about/20-collections-model-1.webp";
import collectionsModel2 from "../../assets/about/20-collections-model-2.jpg";
import collectionsModel2Webm from "../../assets/about/20-collections-model-2.webp";
import collectionsModel3 from "../../assets/about/20-collections-model-3.jpg";
import collectionsModel3Webm from "../../assets/about/20-collections-model-3.webp";
import collectionsModel4 from "../../assets/about/20-collections-model-4.jpg";
import collectionsModel4Webm from "../../assets/about/20-collections-model-4.webp";
import collectionsSidebar from "../../assets/about/21-collections-sidebar.jpg";
import collectionsSidebarWebm from "../../assets/about/21-collections-sidebar.webp";
import collectionsPrev from "../../assets/about/20-collections-prev.jpg";
import collectionsPrevWebm from "../../assets/about/20-collections-prev.webp";

/**
 * Content for the About page "Image collections" section.
 *
 * @component
 * @returns The "Image collections" section content.
 */
const AboutImageCollections = () => {
  return (
    <AboutContentWrap>
      <H1 id="collection">Image collections</H1>
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
        <AboutSection id="coll-model">
          <H3>From a model page</H3>
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
              src={collectionsModel}
              alt="Collections model 1"
              srcSet={collectionsModelWebm}
              type="image/webp"
            />
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={collectionsModel2}
              alt="Collections model 2"
              srcSet={collectionsModel2Webm}
              type="image/webp"
            />
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={collectionsModel3}
              alt="Collections model 3"
              srcSet={collectionsModel3Webm}
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
              src={collectionsModel4}
              alt="Collections model 4"
              srcSet={collectionsModel4Webm}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
        <AboutSection id="coll-sidebar">
          <H3>Through the sidebar</H3>
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
              src={collectionsSidebar}
              alt="Collections model 5"
              srcSet={collectionsSidebarWebm}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
        <AboutSection id="coll-post">
          <H3>Add image by post ID</H3>
          <Text>
            Use the <TextButton>Add image by ID</TextButton> button to save an
            image by the post ID from Civitai. To add an image, use the{" "}
            <TextHighlight>Post ID</TextHighlight> from Civitai (not the image
            ID).{" "}
          </Text>
          <AboutAddImageById />
          <Text>
            {" "}
            Paste the <TextHighlight>post ID</TextHighlight> into the
            appropriate field and click <TextButton>Select images</TextButton>.
            Choose the ones you want to add and click{" "}
            <TextButton>Save selected</TextButton> or{" "}
            <TextButton>Save all</TextButton>.
          </Text>
        </AboutSection>
        <AboutSection id="coll-preview">
          <H3>Collection preview</H3>
          <Text>
            Any image in a collection can be set as its preview. To do this,
            click <TextImageMenu /> in the upper-right corner of the image and
            select <TextHighlight>Set as preview</TextHighlight>. If you’re
            using NSFW mode, there will also be an option{" "}
            <TextHighlight>Set as NSFW preview</TextHighlight> — in that case,
            the selected preview will only be shown when NSFW mode is enabled.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={collectionsPrev}
              alt="Collections model 6"
              srcSet={collectionsPrevWebm}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
      </TextContentBlock>
    </AboutContentWrap>
  );
};

export default AboutImageCollections;
