import Carousel3d from "../carousel3d/Carousel3d";
import Buttton from "../ui/Button";
import classes from "./Landing.module.scss";
import carouselImage1 from "../../assets/about/1-start-1.png";
import { useDispatch } from "react-redux";
import { authActions } from "../../store/auth";
import LinkA from "../ui/LinkA";

const Landing = () => {
  const dispatch = useDispatch();
  const openAuthFormHandler = () => {
    dispatch(authActions.openAuthForm(true));
  };

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
              <LinkA external href="https://civitai.com">
                Civitai
              </LinkA>
              , take advantage of advanced customization and data management,
              and use a variety of tools that simplify the prompt building
              process.
            </p>
          </div>
          <Buttton
            className={classes["btn-hero"]}
            onClick={openAuthFormHandler}
          >
            Get started
          </Buttton>
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
              Switch between text and tag modes to add new trigger words or edit
              prompt.
            </p>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>Edit and organize</h2>
            {/* <h2 className={classes["section__title"]}>Resource management</h2> */}

            <p className={classes["section__content__text"]}>
              Organize information about the model: edit existing model
              information and add additional, set the weight and image size, and
              choose a preview from the generated images.
            </p>
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
            <h2 className={classes["section__title"]}>Quick access tools</h2>

            <p className={classes["section__content__text"]}>
              Add models and up to three reference images to sidebar, combine
              their prompts and quickly switch between them to create unique and
              original content without losing much time.
            </p>
            <p className={classes["section__content__text"]}>
              Switch to extended view to access the model's base trigger words
              and weight directly from the sidebar.
            </p>
            <p className={classes["section__content__text"]}>
              Save your favorite combinations of quality trigger words as
              presets for positive and negative prompts, and easily add them to
              your prompt from the Presets window.
            </p>
          </div>
        </div>
      </section>
      <section className={classes["section"]}>
        <div className={classes["section__content"]}>
          <div>
            <h2 className={classes["section__title"]}>Quick search</h2>

            <p className={classes["section__content__text"]}>
              Search for models by name, activation tag, or file name and easily
              add them to the sidebar directly from the search results.
            </p>
            <p className={classes["section__content__text"]}>
              Get quick access to desired subcategories through quick search
              field — no need to look for them manually.
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
    </div>
  );
};

export default Landing;
