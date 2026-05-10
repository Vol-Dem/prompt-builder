import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

import Image from "../../components/ui/image/Image";
import LinkA from "../../components/ui/LinkA";
import TextButton from "../../components/ui/text/text-buttons/TextButton";
import TextHighlight from "../../components/ui/text/TextHighlight";
import classes from "./AboutStartAddingModels.module.scss";
import Text from "../../components/ui/text/Text";
import TextImageBlock from "../../components/ui/text/TextImageBlock";
import TextContentBlock from "../../components/ui/text/TextContentBlock";
import TextButtonCreate from "../../components/ui/text/text-buttons/TextButtonCreate";
import AboutContentWrap from "../../components/about/layout/AboutContentWrap";
import H1 from "../../components/ui/text/H1";
import newResource from "../../assets/about/3-new-resource.jpg";
import newResourceWebp from "../../assets/about/3-new-resource.webp";
import addModel from "../../assets/about/4-add-model.jpg";
import addModelWebp from "../../assets/about/4-add-model.webp";
import addedModels from "../../assets/about/5-added-models.jpg";
import addedModelsWebp from "../../assets/about/5-added-models.webp";

/**
 * Content for the About page "Start: Adding Models" section.
 *
 * @component
 * @returns The "Start: Adding Models" section content.
 */
const AboutStartAddingModels = () => {
  return (
    <AboutContentWrap>
      <H1 id="start">Start: Adding Models</H1>
      <TextContentBlock>
        <Text>
          To get started with the platform, add a model using the{" "}
          <TextButton>
            <DocumentArrowDownIcon /> New Resource
          </TextButton>{" "}
          button in the quick access panel.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={newResource}
            alt="New resource"
            srcSet={newResourceWebp}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          Select the model type in the "Type" field, enter the{" "}
          <TextHighlight>model ID</TextHighlight> or{" "}
          <TextHighlight>URL</TextHighlight> hosted on the{" "}
          <LinkA external href="https://civitai.com">
            Civitai
          </LinkA>{" "}
          website. Enter the name of a category and click <TextButtonCreate /> —
          later you’ll be able to select categories from a dropdown list. In the
          same way, add subcategories. You can add multiple subcategories to
          which the model will be linked.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={addModel}
            srcSet={addModelWebp}
            type="image/webp"
            alt="Add model"
          />
        </TextImageBlock>
        <Text>
          After saving, the platform will automatically gather all the
          information about the model, and a list of added categories,
          subcategories, and the models within them will appear on the main
          page.
        </Text>
        <Text>
          You will gain access to tags (trigger words) and other data related to
          the model, be able{" "}
          <Link
            className={classes.link}
            to={{
              pathname: `/about/model-settings`,
              hash: "gsettings",
            }}
          >
            to edit them
          </Link>{" "}
          and add additional information. You also can view all images generated
          by users with this model, and add to your collection those you want to
          use as references in the future.
        </Text>
        <TextImageBlock>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={addedModels}
            alt="Added models"
            srcSet={addedModelsWebp}
            type="image/webp"
          />
        </TextImageBlock>
      </TextContentBlock>
    </AboutContentWrap>
  );
};

export default AboutStartAddingModels;
