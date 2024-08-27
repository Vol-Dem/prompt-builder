import React, { useEffect, useState } from "react";
import classes from "./About.module.scss";
import ImageFullView from "../ui/ImageFullView";
import Image1 from "../../assets/about/1-start-1.webp";
import Image2 from "../../assets/about/1-start-2.webp";
import LinkA from "../ui/LinkA";
import PlusSvg from "../../assets/PlusSvg";
import EditSvg from "../../assets/EditSvg";
import FolderSvg from "../../assets/FolderSvg";
import DotsSvg from "../../assets/DotsSvg";
import CheckUp from "../../assets/CheckSvg";
import CrossSvg from "../../assets/CrossSvg";
import Bars2Svg from "../../assets/Bars2Svg";
import Bars4Svg from "../../assets/Bars4Svg";
import ExclamationCircleSvg from "../../assets/ExclamationCircleSvg";

const About = ({ title }) => {
  const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
  const [currImageUrl, setCurrImageUrl] = useState("#");
  useEffect(() => {
    document.title = title;
  }, [title]);

  const openFullVeiwHandler = (e) => {
    setCurrImageUrl(e.target?.src);
    setFullViewIsOpen(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={classes.about}>
      <h1 className={classes["about__h1"]}>About</h1>
      <p className={classes["about__text"]}>
        This platform offers a variety of features, such as the using trigger
        words from models and images as tags for quick and easy modification of
        prompts, adding current models and image references to the sidebar for
        quick access, and extended configuration options, etc.
      </p>
      <p className={classes["about__text"]}>
        AIDE-TOOLS provides a centralized solution for storing and managing
        collections. It is versatile and independent of popular web interfaces,
        so, you can use the generated prompt in any web interface or for online
        generation on Civitai.
      </p>

      <div className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}>
        <img
          onClick={openFullVeiwHandler}
          className={classes["img"]}
          src={Image1}
          data-url={Image1}
          alt=""
        />

        <img
          onClick={openFullVeiwHandler}
          className={classes["img"]}
          src={Image2}
          alt=""
        />
      </div>
      <p className={classes["about__text"]}>
        With the help of the AIde-tools platform you can create your own
        collection of your favorite models and easily work with them:
      </p>
      <ul className={classes["about__list"]}>
        <li className={classes["about__list-item"]}>
          the tag system allows you to add and remove trigger words in the
          prompt in one click, easily compare your prompt with the prompt of the
          generated reference image seeing which trigger words are already in
          the prompt and which need to be added,
        </li>
        <li className={classes["about__list-item"]}>
          add current models and image references to the side panel for quick
          access,
        </li>
        <li className={classes["about__list-item"]}>
          edit any model data and create tag sets (for outfits, appearance,
          etc.) to quickly add and remove their trigger words from the prompt,
        </li>
        <li className={classes["about__list-item"]}>
          mark which versions of models have already been downloaded,
        </li>
        <li className={classes["about__list-item"]}>
          get access to images generated with the model, easily see its prompt
          and used resources and versions, see which of them have already been
          downloaded and track new versions in this way,
        </li>
        <li className={classes["about__list-item"]}>
          create presets of positive and negative trigger words,
        </li>
        <li className={classes["about__list-item"]}>
          edit model information and add additional information such as best
          weight or weight range, activation tag and others,
        </li>
        <li className={classes["about__list-item"]}>
          view images generated with the model and save information of
          generation to have quick access to it,
        </li>
        <li className={classes["about__list-item"]}>
          set preview images for models and tag sets, etc.
        </li>
      </ul>

      <h2 className={classes["about__h2"]}>Guide</h2>
      <div className={classes["about__content-block"]}>
        <ul className={classes["about__list"]}>
          <li className={classes["about__list-item"]}>
            <LinkA href="#start" smoothScroll>
              Start: Adding Models
            </LinkA>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#prompt" smoothScroll>
              Working with Prompts
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#preset" smoothScroll>
                  Adding Presets
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#settings" smoothScroll>
              Model Settings
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#gsettings" smoothScroll>
                  General Settings
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#vsettings" smoothScroll>
                  Version Settings
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#sets" smoothScroll>
                  Tag Sets
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#model" smoothScroll>
              Model Page
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#images" smoothScroll>
                  Generated Images
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#top" smo>
              Top Bar
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#queue" smoothScroll>
                  Download Queue
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#nsfw" smoothScroll>
                  SFW and NSFW Modes
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#search" smoothScroll>
                  Search
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#sidebar" smoothScroll>
              Sidebar
            </LinkA>
          </li>
          <li
            className={`${classes["about__list-item"]} ${classes["about__list-item--sub"]}`}
          >
            <ul className={classes["about__sub-list"]}>
              <li className={classes["about__list-item"]}>
                <LinkA href="#references" smoothScroll>
                  Adding References
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#addmodels" smoothScroll>
                  Adding Models
                </LinkA>
              </li>
              <li className={classes["about__list-item"]}>
                <LinkA href="#expanded" smoothScroll>
                  Expanded and Compact View
                </LinkA>
              </li>
            </ul>
          </li>

          <li className={classes["about__list-item"]}>
            <LinkA href="#category" smoothScroll>
              Category edit
            </LinkA>
          </li>
        </ul>
      </div>
      <h2 id="start" className={classes["about__h2"]}>
        Start: Adding Models
      </h2>
      <div className={classes["about__content-block"]}>
        <p className={classes["about__text"]}>
          To get started with the platform, add a model using the "New Resource"
          button in the quick access panel.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/3-new-resource.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/3-new-resource.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          Select the model type in the "Type" field, enter the model ID or URL
          hosted on the{" "}
          <LinkA external href="https://civitai.com">
            Civitai
          </LinkA>{" "}
          website, and enter the main category and subcategory where you want to
          add the model. You can add multiple subcategories to which the model
          will be linked.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/4-add-model.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/4-add-model.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          After saving, the platform will automatically gather all the
          information about the model, and a list of added categories,
          subcategories, and the models within them will appear on the main
          page.
        </p>
        <p className={classes["about__text"]}>
          You will gain access to tags (trigger words) and other data related to
          the model, be able{" "}
          <LinkA className={classes.link} href="#gsettings" smoothScroll>
            to edit them
          </LinkA>{" "}
          and add additional information. You also can view all images generated
          by users with this model, and add to your collection those you want to
          use as references in the future.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/5-added-models.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/5-added-models.jpg")}
              alt=""
            />
          </picture>
        </div>
      </div>
      <h2 id="prompt" className={classes["about__h2"]}>
        Working with Prompts
      </h2>
      <div className={classes["about__content-block"]}>
        <p className={classes["about__text"]}>
          Prompt input is available in two modes: tag mode and text mode.
        </p>
        <p className={classes["about__text"]}>
          Trigger words of each model, as well as generation prompt of all
          images, are displayed as tags. The tag system allows you to add and
          remove trigger words from the prompt with one click, easily match your
          prompt with the prompt of a generated reference image by seeing which
          trigger words are already used and which need to be added. Tags that
          are already added will be highlighted.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/6-prompt.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/6-prompt.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          Trigger words received with the model can be divided into groups:
          trigger words, helper words, negative words, and tag sets (custom
          presets for outfits, appearances, etc.).
        </p>
        <p className={classes["about__text"]}>
          The "Add All" button next to the trigger word group will add all tags
          to the current prompt, avoiding duplicates. The "Remove All" button
          will only remove the set of tags specified in the corresponding group,
          leaving the rest of the prompt unchanged.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/7-tags.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/7-tags.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          This way, you can easily manage the prompt by adding the necessary
          details.
        </p>
        <p className={classes["about__text"]}>
          Text mode allows you to enter the prompt manually. When switching from
          text mode to tag mode, the entered text is also converted into tags.
        </p>
        <p className={classes["about__text"]}>
          The "Clear" button will clear all prompt input fields.
        </p>
        <h3 id="preset" className={classes["about__h3"]}>
          Adding Presets
        </h3>
        <p className={classes["about__text"]}>
          You can add commonly used trigger words into presets (for example,
          quality tags or a standard set of negative words). To do this, use the
          "Presets" button next to the prompt field. You can create presets for
          both positive and negative words. Created presets can be edited or
          deleted as needed.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-3"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/8-presets-1.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/8-presets-1.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/8-presets-2.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/8-presets-2.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/8-presets-3.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/8-presets-3.jpg")}
              alt=""
            />
          </picture>
        </div>
      </div>
      <h2 id="settings" className={classes["about__h2"]}>
        Model Settings
      </h2>
      <div className={classes["about__content-block"]}>
        <h3 id="gsettings" className={classes["about__h3"]}>
          General Settings
        </h3>
        <p className={classes["about__text"]}>
          General settings for the uploaded model are accessible via the "Edit"
          button.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/9-model-settings.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/9-model-settings.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          In the "General Settings" tab, you can change the model's name and
          description, mark it as NSFW, change its type, category, or
          subcategories, mark downloaded versions of the model, and set default
          values for activation tag, file name, weight range, image size, helper
          and negative words, and tag sets. These values will be default for all
          versions unless you make changes to the settings of each individual
          version.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/10-general-settings.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/10-general-settings.jpg")}
              alt=""
            />
          </picture>
        </div>
        <h3 id="vsettings" className={classes["about__h3"]}>
          Version Settings
        </h3>
        <p className={classes["about__text"]}>
          In the "Version Settings" tab, you can mark downloaded versions. For
          each marked version, a separate tab with the version's name will
          appear, allowing you to make adjustments to its settings. Here, you
          can specify version-specific activation tags, triggers, helper and
          negative words, file name and weight range, and add tag sets.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/11-versions-settings-1.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/11-versions-settings-1.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/11-versions-settings-2.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/11-versions-settings-2.jpg")}
              alt=""
            />
          </picture>
        </div>
      </div>
      <h2 id="sets" className={classes["about__h2"]}>
        Tag Sets
      </h2>
      <div className={classes["about__content-block"]}>
        <p className={classes["about__text"]}>
          The tag sets feature allows you to create a set of trigger words for
          generating specific outfits, appearances, or other image variations.
          In both "General Settings" and "Version Settings", you can add a tag
          sets by specifying their name and trigger words.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/12-tag-sets-1.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/12-tag-sets-1.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/12-tag-sets-2.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/12-tag-sets-2.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          The "Edit... <EditSvg className={classes["svg"]} />" button in the top
          right corner of the block gives you quick access to editing tag sets
          of the current version.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/12-tag-sets-12.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/12-tag-sets-12.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/12-tag-sets-22.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/12-tag-sets-22.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          When building a prompt, you can add all tags from a set with one click
          using the "Add All" button, or add individual tags from the set. Words
          already present in the prompt will be highlighted. Pressing the
          "Remove All" button will only remove tags from that set in the prompt;
          the rest of the prompt will remain unchanged.
        </p>
        <h3 className={classes["about__h3"]}>Tag Set Preview</h3>
        <p className={classes["about__text"]}>
          To easily understand what the tag set represents, you can add a
          preview image for it. To do this, you can use any image available in
          the list of generated images on the model's page. Each image has a
          menu that allows you to set it as the tag set preview using the "Set
          as Tag Set Preview" button. In the popup that appears, you can set a
          default image for the tag set or set individual previews for each
          version. You can also set separate previews for NSFW if this mode is
          enabled in the Top Bar.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/12-tag-sets-3.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/12-tag-sets-3.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/12-tag-sets-4.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/12-tag-sets-4.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          Directly uploading your own image for a preview is not possible on the
          site, but you can upload it to Civitai as part of a corresponding
          model as a generation example (then it will appear in the list of
          generated images) or upload it as a standalone post and{" "}
          <LinkA className={classes.link} href="#addbyid" smoothScroll>
            add it to saved
          </LinkA>{" "}
          images using the "Add Image by ID" button.
        </p>
      </div>
      <h2 id="model" className={classes["about__h2"]}>
        Model Page
      </h2>
      <div className={classes["about__content-block"]}>
        <p className={classes["about__text"]}>
          Under model's name, there are tabs for model versions. The names of
          versions marked as downloaded in the settings are purple, and those
          not downloaded are white.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/13-model-page-1.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/13-model-page-1.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          Below the model images, there is an information block about the model.
          There will be displayed data you entered in the Settings, as well as a
          block with trigger words where you can see all the added tags.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/13-model-page-2.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/13-model-page-2.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          Clicking on a tag will add it to the prompt, and clicking again on an
          already added tag will remove it from the prompt. If some tags are
          already in the prompt, they will be highlighted. With the "Add All"
          and "Remove All" buttons, you can add or remove the entire group of
          tags from the prompt. When removing a group, the rest of the prompt
          will remain unchanged.
        </p>
        <p className={classes["about__text"]}>
          The "Edit... <EditSvg className={classes["svg"]} />" button in the top
          right corner of the block gives you quick access to editing trigger
          words and tag sets of the current version.
        </p>
        <h3 id="images" className={classes["about__h3"]}>
          Generated Images
        </h3>
        <p className={classes["about__text"]}>
          On the model page, after the basic information and description, you
          will find examples of images generated by users with this model. You
          can save any image to use as a reference later.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/14-img-examples-1.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/14-img-examples-1.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          The{" "}
          <FolderSvg
            className={`${classes["svg"]} ${classes["svg--medium"]}`}
          />{" "}
          button will add the image generation data to "Saved" tab. If there is
          more than one image, a popup window will open where you can select the
          images you want to download or download all of them at once.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/14-img-examples-2.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/14-img-examples-2.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p id="addbyid" className={classes["about__text"]}>
          If you want to add a specific image or post from the Civitai site to
          avoid searching through the general list of examples, click the "Add
          by ID" button. A popup window will appear where you can enter the post
          ID, select the model version, and select images you want to save.
          Saved images will be displayed under the tab corresponding to the
          model version. This way you can build your own collection of examples.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/14-img-examples-5.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/14-img-examples-5.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/14-img-examples-52.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/14-img-examples-52.jpg")}
              alt=""
            />
          </picture>
        </div>
        <div className={classes["notification"]}>
          <ExclamationCircleSvg className={classes["notification__svg"]} />

          <p className={classes["notification__text"]}>
            Saved images are not stored on the server; only generation data is
            stored. If an image is removed from the Civitai site, it will become
            unavailable, but the generation data will be preserved and available
            for use.
          </p>
        </div>

        <p className={classes["about__text"]}>
          In the "Saved" tab, the image menu{" "}
          <DotsSvg className={`${classes["svg"]} ${classes["svg--medium"]}`} />{" "}
          includes an option to delete images. You can delete either selected
          images or all of them at once.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/14-img-examples-3.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/14-img-examples-3.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/14-img-examples-4.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/14-img-examples-4.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          With the{" "}
          <span className={classes["btn-container"]}>
            <PlusSvg />
          </span>{" "}
          button, any image can be added to the sidebar as a reference (no more
          than three images). Clicking the image again will remove it from the
          sidebar.
        </p>
        <p className={classes["about__text"]}>
          Any image on the model page can be set as the model preview. To do
          this, in the image menu{" "}
          <DotsSvg className={`${classes["svg"]} ${classes["svg--medium"]}`} />{" "}
          select "Set as Preview." If the NSFW mode is enabled in the Top Bar,
          the menu will also include the option "Set as NSFW Preview." Each
          model can have two previews: one for SFW and one for NSFW mode.
        </p>
        <p className={classes["about__text"]}>
          You cannot upload your own image directly to the site, but you can
          upload it to Civitai under the corresponding model as a generation
          example or simply as a separate post, and then add it to saved images
          using the "Add Image by ID" button. After this, you can use the image
          as a model preview or tag sets.
        </p>
        <p className={classes["about__text"]}>
          When you click on an image, a popup window will appear where you can
          see its prompt, add necessary tags, and view generation data.
        </p>
        <p className={classes["about__text"]}>
          There you will also find resources used during generation: models,
          their versions, type, weight, and source.
        </p>
        <p className={classes["about__text"]}>
          Saved models are highlighted in blue &mdash; clicking on their name
          will open the page for that model. You can also use the{" "}
          <span className={classes["btn-container"]}>
            <PlusSvg />
          </span>{" "}
          button to add the model to the sidebar for quick access. Unsaved
          models will be white.
        </p>
        <p className={classes["about__text"]}>
          You can also track whether you have the necessary model version:
          downloaded versions are marked with a green checkmark, while
          undownloaded versions are marked with a yellow exclamation mark. This
          will allow you to easily keep track of which versions you already have
          and which ones you need to add.
        </p>
        <p className={classes["about__text"]}>
          If the model is found on Civitai, there also will be a link to the
          source.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/14-img-examples-resources.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/14-img-examples-resources.jpg")}
              alt=""
            />
          </picture>
        </div>
      </div>
      <h2 id="top" className={classes["about__h2"]}>
        Top Bar
      </h2>
      <div className={classes["about__content-block"]}>
        <h3 id="queue" className={classes["about__h3"]}>
          Download Queue
        </h3>
        <p className={classes["about__text"]}>
          When you click the image "Download" button, the image is added to the
          download queue in the Top Bar. If there are any connection issues with
          the server (maintenance on Civitai, etc) or if the internet connection
          is lost during the upload, the image will be moved to "Rejected." When
          the connection is restored, press the "Retry all" button in the
          download window to continue the upload. If the upload does not resume,
          try again after later.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/15-queue.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/15-queue.jpg")}
              alt=""
            />
          </picture>
        </div>
        <h3 id="nsfw" className={classes["about__h3"]}>
          SFW and NSFW Modes
        </h3>
        <p className={classes["about__text"]}>
          You can use the toggle switch to change between SFW and NSFW modes.
          Models marked by the author on Civitai as NSFW will not be displayed
          in SFW mode. You can mark a model as NSFW or remove the mark in
          General Settings.
        </p>
        <p className={classes["about__text"]}>
          For each model or tag set you can set two versions of the preview: SFW
          and NSFW. They will be displayed depending on the current mode. To do
          this, on the Model page use the image menu{" "}
          <DotsSvg className={`${classes["svg"]} ${classes["svg--medium"]}`} />{" "}
          and select "Set as Preview." If the NSFW mode is enabled, the menu
          will also include the option "Set as NSFW Preview."
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/16-nsfw.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/16-nsfw.jpg")}
              alt=""
            />
          </picture>
        </div>
        <div className={classes["notification"]}>
          <ExclamationCircleSvg className={classes["notification__svg"]} />

          <p className={classes["notification__text"]}>
            If you have SFW mode enabled, images marked by the author as NSFW
            will not be displayed among the model images and generation
            examples.
          </p>
        </div>
        <h3 id="search" className={classes["about__h3"]}>
          Search
        </h3>
        <p className={classes["about__text"]}>
          The quick search shows the first five results and allows you to search
          not only for models but also for categories or subcategories, and open
          them by click. By pressing the Enter button or "Show More", you will
          go to the search page where you can see all results for models.
        </p>
        <p className={classes["about__text"]}>
          The sidebar gives you quick access to the models and images you want
          to use right now. You can add up to three reference images and as many
          models as you like.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/17-search.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/17-search.jpg")}
              alt=""
            />
          </picture>
        </div>
      </div>
      <h2 id="sidebar" className={classes["about__h2"]}>
        Sidebar
      </h2>
      <div className={classes["about__content-block"]}>
        <p id="references" className={classes["about__text"]}>
          To add an image as a reference, go to the model page and click the{" "}
          <span className={classes["btn-container"]}>
            <PlusSvg />
          </span>{" "}
          on the desired image. The{" "}
          <span className={classes["btn-container"]}>
            <PlusSvg />
          </span>{" "}
          will turn into a{" "}
          <span className={classes["btn-container"]}>
            <CheckUp />
          </span>
          , you can click it again to remove the image from the sidebar. You can
          also remove an image directly from the sidebar by clicking{" "}
          <CrossSvg className={`${classes["svg"]} ${classes["svg--medium"]}`} />
          . If you've already added three images, the{" "}
          <span className={classes["btn-container"]}>
            <PlusSvg />
          </span>{" "}
          button on other images will be inactive until you remove at least one
          from the sidebar. To view information about an added reference image,
          click on it in the sidebar. A pop-up window will show details about
          the generation, including the prompt, used resources, and more.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/18-sidebar-1.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/18-sidebar-1.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p id="addmodels" className={classes["about__text"]}>
          To add a model to the sidebar, click the{" "}
          <span className={classes["btn-container"]}>
            <PlusSvg />
          </span>{" "}
          on the model card or the{" "}
          <span className={classes["btn-container"]}>
            <PlusSvg />
          </span>{" "}
          next to the name on the model page.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-1"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/18-sidebar-2.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/18-sidebar-2.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p id="expanded" className={classes["about__text"]}>
          You can toggle the model info display in the sidebar between compact
          and expanded views using the{" "}
          <span className={classes["btn-container"]}>
            <Bars2Svg className={classes["svg"]} />
          </span>{" "}
          and{" "}
          <span className={classes["btn-container"]}>
            <Bars4Svg className={classes["svg"]} />
          </span>{" "}
          buttons. In the compact view, you&rsquo;ll see the image, name,
          version, and model type. In the expanded view, you&rsquo;ll also see
          the weight, activation tag, and trigger words. You can add or remove
          trigger words from the prompt by clicking them in the sidebar, just
          like on the model page.
        </p>
        <p className={classes["about__text"]}>
          To clear all references and models from the sidebar, use the "Clear"
          button.
        </p>
      </div>
      <h2 id="category" className={classes["about__h2"]}>
        Category edit
      </h2>
      <div className={classes["about__content-block"]}>
        <p className={classes["about__text"]}>
          You can edit the name of a category or subcategory or delete it if
          needed. To do this, go to the category list and click the{" "}
          <EditSvg className={`${classes["svg"]} ${classes["svg--medium"]}`} />{" "}
          button.
        </p>
        <div
          className={`${classes["img-block"]} ${classes["img-block--col-2"]}`}
        >
          <picture>
            <source
              srcSet={require("../../assets/about/19-category-edit-1.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/19-category-edit-1.jpg")}
              alt=""
            />
          </picture>
          <picture>
            <source
              srcSet={require("../../assets/about/19-category-edit-2.webp")}
              type="image/webp"
            />
            <img
              onClick={openFullVeiwHandler}
              className={classes["img"]}
              src={require("../../assets/about/19-category-edit-2.jpg")}
              alt=""
            />
          </picture>
        </div>
        <p className={classes["about__text"]}>
          If you accidentally delete a category, you can create a new one with
          the same name, and all the models previously linked to it will
          reappear in the new category. This works if you didn't rename it
          before.
        </p>
      </div>
      {fullViewIsOpen && (
        <ImageFullView
          src={currImageUrl}
          onClose={() => {
            setFullViewIsOpen(false);
          }}
        ></ImageFullView>
      )}
    </div>
  );
};

export default About;
