import Carousel3d from "../carousel3d/Carousel3d";
import Buttton from "../ui/Button";
import classes from "./Landing.module.scss";
import carouselImage1 from "../../assets/about/1-start-1.png";

const Landing = () => {
  return (
    <div className={classes["landing"]}>
      <section className={`${classes["section"]} ${classes["section--hero"]}`}>
        <Carousel3d />
        <div className={classes["section--hero__content"]}>
          <div className={classes.logo}>
            <img src={require("../../assets/logo5.png")} alt="Logo" />
          </div>
          <div>
            <p className={classes["section--hero__text"]}>
              Welcome to <strong>AI</strong>DE-TOOLS – a platform where you can
              create your own collection of models from{" "}
              <a className={classes.link} href="#">
                Civitai
              </a>
              , take advantage of advanced customization and data management,
              and use a variety of tools that simplify the prompt building
              process.
            </p>
            {/* <p className={classes["section--hero__text"]}>
              Welcome to <strong>AI</strong>DE-TOOLS – a dynamic platform where
              you can create your own collection of image generation models and
              seamlessly build and manage prompts.
            </p> */}
            {/* <p className={classes["section--hero__text"]}>
      This platform offers a variety of features, such as the using
      trigger words from models and images as tags for quick and easy
      modification of prompts, adding current models and image
      references to the sidebar for quick access, and extended
      configuration options, etc. //////////////////////////////// I
      created this project for personal use to make prompt building fast
      and convenient, developed and added here many features that create
      a comfortable space for working with models, references and images
      and greatly simplify the work of building prompts for generating
      images. And now I am sharing this convenient tool with you.
    </p> */}
            {/* <p className={classes["section--hero__text"]}>
              <strong>AI</strong>DE-TOOLS provides a centralized solution for
              storing and managing collections. It is versatile and independent
              of popular web interfaces, so, you can use the generated prompt in
              any web interface or for online generation on Civitai.
            </p> */}
            {/* <p className={classes["section--hero__text"]}>
        You can learn about the capabilities of the service in the{" "}
        <Link className={classes.link} to="about">
          "About"
        </Link>{" "}
        section.
      </p> */}
            {/* <p className={classes["section--hero__text"]}>
        If you like using this platform, support it on{" "}
        <a
          className={classes.link}
          href="https://www.patreon.com/aidetools"
          target="_blank"
          rel="noreferrer nofollow"
        >
          Patreon
        </a>{" "}
        and{" "}
        <a
          className={classes.link}
          href="https://ko-fi.com/J3J31052RE"
          target="_blank"
          rel="noreferrer nofollow"
        >
          Ko-fi
        </a>
        . There you can also leave your suggestions for this project.
      </p> */}
          </div>
          <Buttton className={classes["btn-hero"]}>Get started</Buttton>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>
              Keep it safe and in one place
            </h2>
            <p className={classes["section__content__text"]}>
              AIDE-TOOLS lets you store all information about your models in one
              place and use the builded prompts in any web interface of your
              choice.
            </p>
            <p className={classes["section__content__text"]}>
              Protect important data: even if a model is removed from Civitai,
              important generation settings and trigger words will remain with
              you, as well as ability to view images generated with that model.
            </p>
          </div>
          <div className={classes["section__img-wrap"]}>
            <img
              className={classes["section__img"]}
              src={carouselImage1}
              alt=""
            />
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div className={classes["section__img-wrap"]}>
            <img
              className={classes["section__img"]}
              src={carouselImage1}
              alt=""
            />
          </div>
          <div>
            <h2 className={classes["section__title"]}>
              Tag system for prompt building
            </h2>

            <p className={classes["section__content__text"]}>
              Make your prompt building fast and simple: built-in tag system
              allows you to add and remove trigger words from prompt with just
              one click.
            </p>
            <p className={classes["section__content__text"]}>
              Easily track which trigger words are already in the prompt: each
              trigger word present in the prompt is highlighted, making it
              simple to manage them. It allows you to see if any words from the
              current prompt are present in the prompts of images or model's
              trigger words, helping you avoid adding duplicates.
            </p>
            <p className={classes["section__content__text"]}>
              Switch between text and tag modes to add new trigger words and
              edit prompt.
            </p>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>
              Edit and organize model information
            </h2>
            {/* <h2 className={classes["section__title"]}>Resource management</h2> */}

            <p className={classes["section__content__text"]}>
              Split trigger words by related groups (positive, negative, helper,
              sets) to easily work with them. Add or remove an entire group of
              trigger words with ease and a single click, without worrying about
              duplicates or affecting the rest of the prompt content.
            </p>
            <p className={classes["section__content__text"]}>
              Mark versions as downloaded to easily track on the model page and
              in image resources which ones you already have.
            </p>
          </div>
          <div className={classes["section__img-wrap"]}>
            <img
              className={classes["section__img"]}
              src={carouselImage1}
              alt=""
            />
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div className={classes["section__img-wrap"]}>
            <img
              className={classes["section__img"]}
              src={carouselImage1}
              alt=""
            />
          </div>
          <div>
            <h2 className={classes["section__title"]}>
              Sidebar for quick access to models and references
            </h2>

            <p className={classes["section__content__text"]}>
              Add used models and image references to the sidebar with a single
              click. The sidebar provides quick access to generation data,
              allowing you to easily switch between resources, view necessary
              information, and add or remove tags from the prompt.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
