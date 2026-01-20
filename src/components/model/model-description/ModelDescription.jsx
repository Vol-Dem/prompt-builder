import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import classes from "./ModelDescription.module.scss";

const minDescriptionHeight = 300;

/**
 * Content for the model description section.
 *
 * Renders the model description with a fixed-height container and a
 * "Read more" / "Hide" toggle.
 *
 * Implementation notes:
 * - Uses `dangerouslySetInnerHTML` to render HTML descriptions provided by the model.
 * - The HTML content is assumed to be sanitized or trusted at the data source level.
 *
 * @component
 * @returns {JSX.Element} Model description content.
 */
const ModelDescription = () => {
  const [descHeight, setDescHeight] = useState(null);
  const [descriptionIsOpen, setDescriptionIsOpen] = useState(false);
  const model = useSelector((state) => state.model.model);
  const descriptionRef = useRef();

  const openDescriptionHandler = () => {
    setDescriptionIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    setDescHeight(descriptionRef?.current?.offsetHeight);
  }, [descriptionRef?.current?.offsetHeight]);

  return (
    <>
      <div
        className={`${classes.description} ${
          descriptionIsOpen ? classes["description--open"] : ""
        } ${
          descHeight > minDescriptionHeight && !descriptionIsOpen && descHeight
            ? classes["description--hidden"]
            : ""
        }`}
        style={{
          maxHeight: `${
            descriptionIsOpen ? descHeight + 100 : minDescriptionHeight
          }px`,
        }}
      >
        <div
          ref={descriptionRef}
          dangerouslySetInnerHTML={{
            __html:
              model?.defaultCustomData?.description || model?.data?.description,
          }}
        />
      </div>
      {descHeight > minDescriptionHeight && (
        <span
          className={classes["description__btn-show"]}
          onClick={openDescriptionHandler}
        >
          {!descriptionIsOpen ? "Read more" : "Hide"}
        </span>
      )}
    </>
  );
};

export default ModelDescription;
