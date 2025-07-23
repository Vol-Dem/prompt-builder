import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Image from "../ui/image/Image";
import TextButton from "../ui/text/text-buttons/TextButton";
import TextHighlight from "../ui/text/TextHighlight";
import classes from "./AboutModelSettings.module.scss";
import Text from "../ui/text/Text";
import TextImageBlock from "../ui/text/TextImageBlock";
import TextContentBlock from "../ui/text/TextContentBlock";
import H3 from "../ui/text/H3";
import AboutContentWrap from "./layout/AboutContentWrap";
import H1 from "../ui/text/H1";
import AboutSection from "./layout/AboutSection";

const AboutModelSettings = () => {
  return (
    <AboutContentWrap>
      {" "}
      <H1 id="settings" className={classes["about__h2"]}>
        Model Settings
      </H1>
      <TextContentBlock>
        <AboutSection id="gsettings">
          <H3>General Settings</H3>
          <Text>
            General settings for the uploaded model are accessible via the{" "}
            <TextButton>
              <Cog6ToothIcon /> Edit
            </TextButton>{" "}
            button.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1909}
              height={918}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/9-model-settings.jpg")}
              alt="Model settings"
              srcSet={require("../../assets/about/9-model-settings.webp")}
              type="image/webp"
            />
          </TextImageBlock>
          <Text>
            In the <TextHighlight>"General Settings"</TextHighlight> tab, you
            can change the model's name and description, flag it as NSFW, change
            its type, category, or subcategories, mark downloaded versions of
            the model.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1477}
              height={864}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/10-general-settings.jpg")}
              alt="General settings"
              srcSet={require("../../assets/about/10-general-settings.webp")}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
        <AboutSection id="vsettings">
          <H3>Version Settings</H3>
          <Text>
            In the <TextHighlight>Version Settings</TextHighlight> tab, you can
            mark downloaded versions. For each marked version, a separate tab
            with the version's name will appear, allowing you to make
            adjustments to its settings. Here, you can specify version-specific
            activation tags, triggers, helper and negative words, file name and
            weight range, and add tag sets.
          </Text>
          <TextImageBlock col={2}>
            <Image
              loading="lazy"
              width={1476}
              height={796}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/11-versions-settings-1.jpg")}
              alt="Versions settings 1"
              srcSet={require("../../assets/about/11-versions-settings-1.webp")}
              type="image/webp"
            />
            <Image
              loading="lazy"
              width={1476}
              height={796}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/11-versions-settings-2.jpg")}
              alt="Versions settings 2"
              srcSet={require("../../assets/about/11-versions-settings-2.webp")}
              type="image/webp"
            />
          </TextImageBlock>
          <Text>
            In the <TextHighlight>Default for all</TextHighlight> tab you can
            set default values for activation tag, file name, weight range,
            image size, helper and negative words, and tag sets. These values
            will be default for all versions unless you make changes to the
            settings of each individual version.
          </Text>
          <TextImageBlock>
            <Image
              loading="lazy"
              width={1476}
              height={796}
              fullView={true}
              className={classes["img"]}
              src={require("../../assets/about/11-versions-settings-3.jpg")}
              alt="Versions settings 3"
              srcSet={require("../../assets/about/11-versions-settings-3.webp")}
              type="image/webp"
            />
          </TextImageBlock>
        </AboutSection>
      </TextContentBlock>
    </AboutContentWrap>
  );
};

export default AboutModelSettings;
