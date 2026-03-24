import { ExclamationCircleIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import classes from "./Landing.module.scss";
import { authActions } from "../store/auth";
import { checkIsMobile } from "../utils/generalUtils";
import Carousel3d from "../components/ui/carousel3d/Carousel3d";
import Buttton from "../components/ui/buttons/Button";
import LinkA from "../components/ui/LinkA";
import TextHighlight from "../components/ui/text/TextHighlight";
import Modal from "../components/ui/Modal";
import Video from "../components/ui/Video";
import logo from "../assets/logo-730.webp";
import mainPromptWebm from "../assets/home/1-main-prompt.webp";
import mainPromptMp4 from "../assets/home/1-main-prompt.mp4";
import mainStoreWebm from "../assets/home/2-main-store.webp";
import mainStoreMp4 from "../assets/home/2-main-store.mp4";
import mainTagsystemWebm from "../assets/home/3-main-tagsystem.webp";
import mainTagsystemMp4 from "../assets/home/3-main-tagsystem.mp4";
import mainImagesWebm from "../assets/home/4-main-images.webp";
import mainImagesMp4 from "../assets/home/4-main-images.mp4";
import mainOraganizeWebm from "../assets/home/5-main-oraganize.webp";
import mainOraganizeMp4 from "../assets/home/5-main-oraganize.mp4";
import mainQuickWebm from "../assets/home/6-main-quick.webp";
import mainQuickMp4 from "../assets/home/6-main-quick.mp4";
import mainSearchWebm from "../assets/home/7-main-search.webp";
import mainSearchMp4 from "../assets/home/7-main-search.mp4";
import mainIntroWebm from "../assets/home/intro-s.webp";
import mainIntroMp4 from "../assets/home/intro.mp4";
import carouselImage1 from "../assets/3dcarousel/slide-1.webp";
import carouselImage2 from "../assets/3dcarousel/slide-2.webp";
import carouselImage3 from "../assets/3dcarousel/slide-3.webp";
import { useAppDispatch } from "../store/hooks/hooks";

const carouselImages = [
  { url: carouselImage1, width: 700, height: 336 },
  { url: carouselImage2, width: 700, height: 336 },
  { url: carouselImage3, width: 700, height: 336 },
];

/**
 * Landing page.
 *
 * @component
 * @returns {JSX.Element} The Landing page content.
 */
const Landing = () => {
  const [showVideo, setShowVideo] = useState(false);
  const dispatch = useAppDispatch();
  const openAuthFormHandler = () => {
    dispatch(authActions.openAuthForm());
  };
  const isMobile = checkIsMobile();

  return (
    <div className={classes["landing"]}>
      <section className={`${classes["section"]} ${classes["section--hero"]}`}>
        {!isMobile && (
          <Carousel3d images={carouselImages} className={classes.carousel} />
        )}
        {isMobile && (
          <img
            className={classes["section--hero__img"]}
            width={700}
            height={336}
            alt="Application main screen"
            src={carouselImage1}
          />
        )}
        <div className={classes["section--hero__content"]}>
          <div className={classes.logo}>
            <img width={730} height={126} src={logo} alt="Logo" />
          </div>
          <div>
            <p className={classes["section--hero__text"]}>
              Welcome to <strong>AI</strong>DE-TOOLS – a platform where you can
              create your own collection of models from{" "}
              <LinkA external href="https://civitai.com">
                Civitai
              </LinkA>
              , take advantage of advanced customization and data management,
              and use a variety of tools that simplify the prompt building
              process.
            </p>
          </div>
          <div className={classes["btn-container"]}>
            <Buttton
              className={classes["btn-hero"]}
              onClick={openAuthFormHandler}
            >
              Get started
            </Buttton>
            <Buttton
              onClick={() => {
                setShowVideo(true);
              }}
              className={classes["btn-yt"]}
              title="Video"
            >
              <PlayIcon />
            </Buttton>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>
              Advanced prompt building
            </h2>
            <p className={classes["section__content__text"]}>
              Make your prompt building clear and effortless: the system
              automatically splits your prompt into tags with the option to
              switch between modes at any moment.{" "}
              <span className={classes["section__subtext"]}>
                There should be a transition to the bullet points, so pretend
                it's here:
              </span>
            </p>
            <ul className={classes["section__list"]}>
              <li>
                <TextHighlight>Track and remove duplicates:</TextHighlight> each
                of them has a unique highlighted color that makes it easy to
                manage.
              </li>
              <li>
                <TextHighlight>Easily insert BREAKs</TextHighlight> using a
                separate button to organize your prompt and improve its logic
                and readability.
              </li>
              <li>
                <TextHighlight>Use drag and drop</TextHighlight> to quickly
                adjust the position of trigger words.
              </li>
              <li>
                <TextHighlight>Adjust the weight and content</TextHighlight> of
                trigger words by simply clicking on a tag.
              </li>
            </ul>
          </div>
          <div className={classes["section__img-wrap"]}>
            <Video
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              // loading="lazy"
              poster={mainPromptWebm}
              className={classes["section__video"]}
            >
              <source src={mainPromptMp4} type="video/mp4" />
            </Video>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>
              Store data in one place
            </h2>
            <p className={classes["section__content__text"]}>
              AIDE-TOOLS lets you <TextHighlight>store</TextHighlight> all
              information about your <TextHighlight>models</TextHighlight> in
              one place and use the builded prompts in any web interface of your
              choice.
            </p>
            <p className={classes["section__content__text"]}>
              Even if the model has been removed from Civitai, you will{" "}
              <TextHighlight>retain</TextHighlight> information about the
              generation <TextHighlight>settings and</TextHighlight>{" "}
              <TextHighlight>trigger words</TextHighlight>, as well as{" "}
              <TextHighlight>ability to view images</TextHighlight> generated
              with that model. This way, you can continue working with the model
              if you have downloaded its file.
            </p>
            <div className={classes["notification"]}>
              <ExclamationCircleIcon className={classes["notification__svg"]} />
              <p className={classes["notification__text"]}>
                The service stores only the text-based prompts and model
                generation settings, and does not store any files or images.
              </p>
            </div>
          </div>
          <div className={classes["section__img-wrap"]}>
            <Video
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              poster={mainStoreWebm}
              className={classes["section__video"]}
            >
              <source src={mainStoreMp4} type="video/mp4" />
            </Video>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>
              Tag system for prompt building
            </h2>

            <p className={classes["section__content__text"]}>
              Make your prompt building fast and simple: built-in tag system
              allows you to{" "}
              <TextHighlight>
                add trigger words to prompt with just one click
              </TextHighlight>{" "}
              from models and prompt of generated images.
            </p>
            <p className={classes["section__content__text"]}>
              Easily{" "}
              <TextHighlight>
                track which trigger words are already in the prompt
              </TextHighlight>
              : each trigger word present in the prompt is highlighted, making
              it simple to manage them. It allows you to see if any words from
              the current prompt are present in the prompts of images or model's
              trigger words, helping you to{" "}
              <TextHighlight> avoid duplicates</TextHighlight>.
            </p>
            <p className={classes["section__content__text"]}>
              Switch between text and tag modes to add new trigger words or edit
              prompt.
            </p>
          </div>
          <div className={classes["section__img-wrap"]}>
            <Video
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              loading="lazy"
              poster={mainTagsystemWebm}
              className={classes["section__video"]}
            >
              <source src={mainTagsystemMp4} type="video/mp4" />
            </Video>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>
              {" "}
              Save images for future reference
            </h2>
            <p className={classes["section__content__text"]}>
              AIDE-TOOLS offers two options for saving and using images with
              speed and simplicity:
            </p>
            <ul className={classes["section__list"]}>
              <li>
                <TextHighlight>
                  Save images directly to the model,
                </TextHighlight>{" "}
                and they’ll always be linked to that specific model, keeping
                your collection of reference images organized and easily
                accessible.
              </li>
              <li>
                <TextHighlight>Create a separate collection</TextHighlight> to
                categorize your images by theme, and assign any image as a
                collection preview. This way, you can easily navigate and
                structure your image collections for even more efficient use.
              </li>
            </ul>
          </div>
          <div className={classes["section__img-wrap"]}>
            <Video
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              loading="lazy"
              poster={mainImagesWebm}
              className={classes["section__video"]}
            >
              <source src={mainImagesMp4} type="video/mp4" />
            </Video>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>Edit and organize</h2>
            <p className={classes["section__content__text"]}>
              Organize information about the model:{" "}
              <TextHighlight>edit existing model information</TextHighlight> and
              add additional, set the weight and image size, and{" "}
              <TextHighlight>choose a preview</TextHighlight> from the generated
              images.
            </p>
            <p className={classes["section__content__text"]}>
              <TextHighlight>
                Split trigger words by related groups
              </TextHighlight>{" "}
              (positive, negative, helper, sets) to easily work with them.{" "}
              <TextHighlight>Add or remove an entire group</TextHighlight> of
              trigger words with ease and a single click, without worrying about
              duplicates or affecting the rest of the prompt content.
            </p>
            <p className={classes["section__content__text"]}>
              <TextHighlight>Mark versions</TextHighlight> as downloaded to
              easily <TextHighlight>track</TextHighlight> on the model page and
              in image resources which ones{" "}
              <TextHighlight>you already have.</TextHighlight>
            </p>
          </div>
          <div className={classes["section__img-wrap"]}>
            <Video
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              loading="lazy"
              poster={mainOraganizeWebm}
              className={classes["section__video"]}
            >
              <source src={mainOraganizeMp4} type="video/mp4" />
            </Video>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>Quick access tools</h2>

            <p className={classes["section__content__text"]}>
              <TextHighlight>
                Add models, collection, and reference images to sidebar,
              </TextHighlight>{" "}
              combine their prompts and quickly switch between them to create
              unique and original content without losing much time.
            </p>
            <p className={classes["section__content__text"]}>
              Switch to extended view to{" "}
              <TextHighlight>
                access the model's base trigger words
              </TextHighlight>{" "}
              and weight directly from the sidebar.
            </p>
            <p className={classes["section__content__text"]}>
              <TextHighlight> Save</TextHighlight> your favorite combinations of{" "}
              <TextHighlight>quality trigger words as presets</TextHighlight>{" "}
              for positive and negative prompts, and easily add them to your
              prompt from the Presets window.
            </p>
          </div>
          <div className={classes["section__img-wrap"]}>
            <Video
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              loading="lazy"
              poster={mainQuickWebm}
              className={classes["section__video"]}
            >
              <source src={mainQuickMp4} type="video/mp4" />
            </Video>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>Quick search</h2>
            <p className={classes["section__content__text"]}>
              Search for <TextHighlight>image collections</TextHighlight> and{" "}
              <TextHighlight>models</TextHighlight> by{" "}
              <TextHighlight>name</TextHighlight>,{" "}
              <TextHighlight>activation tag</TextHighlight>, or{" "}
              <TextHighlight>file name</TextHighlight> and easily add them to
              the sidebar directly from the search results.
            </p>
            <p className={classes["section__content__text"]}>
              Get quick access to desired{" "}
              <TextHighlight>categories</TextHighlight> or{" "}
              <TextHighlight>subcategories</TextHighlight> through quick search
              field — no need to look for them manually.
            </p>
          </div>
          <div className={classes["section__img-wrap"]}>
            <Video
              playsInline
              autoPlay
              loop
              disablePictureInPicture
              preload="none"
              muted
              loading="lazy"
              poster={mainSearchWebm}
              className={classes["section__video"]}
            >
              <source src={mainSearchMp4} type="video/mp4" />
            </Video>
          </div>
        </div>
      </section>
      <section className={`${classes["section"]} ${classes["section--cta"]}`}>
        <div
          className={`${classes["section__content"]} ${classes["section--cta__content"]}`}
        >
          <div>
            <h2 className={classes["section__title"]}>
              Discover the possibilities of the AIDE-TOOLS
            </h2>

            <p
              className={`${classes["section__content__text"]} ${classes["section--cta__text"]}`}
            >
              Create a collection of your favorite models and streamline your
              prompt building with our intuitive tag system. Start creating
              stunning images effortlessly — try <strong>AI</strong>DE-TOOLS
              today!
            </p>
          </div>
          <Buttton
            className={classes["section--cta__btn"]}
            onClick={openAuthFormHandler}
          >
            Get started
          </Buttton>
        </div>
      </section>
      {showVideo && (
        <Modal
          onClose={() => {
            setShowVideo(false);
          }}
        >
          <Video
            playsInline
            disablePictureInPicture
            controls
            width={1280}
            height={720}
            poster={mainIntroWebm}
            className={classes["video"]}
          >
            <source src={mainIntroMp4} type="video/mp4" />
          </Video>
        </Modal>
      )}
    </div>
  );
};

export default Landing;
