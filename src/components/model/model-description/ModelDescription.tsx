import { useEffect, useRef, useState } from "react";

import classes from "./ModelDescription.module.scss";
import { useAppSelector } from "../../../store/hooks/hooks";

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
 * @returns Model description content.
 */
const ModelDescription = () => {
  const [descHeight, setDescHeight] = useState<number | null>(null);
  const [descriptionIsOpen, setDescriptionIsOpen] = useState(false);
  const model = useAppSelector((state) => state.model.model);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const openDescriptionHandler = () => {
    setDescriptionIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    if (descriptionRef?.current)
      setDescHeight(descriptionRef.current.offsetHeight);
  }, [descriptionRef?.current?.offsetHeight]);

  return (
    <>
      <div
        className={`${classes.description} ${
          descriptionIsOpen ? classes["description--open"] : ""
        } ${
          descHeight &&
          descHeight > minDescriptionHeight &&
          !descriptionIsOpen &&
          descHeight
            ? classes["description--hidden"]
            : ""
        }`}
        style={{
          maxHeight: `${
            descriptionIsOpen && descHeight
              ? descHeight + 100
              : minDescriptionHeight
          }px`,
        }}
      >
        {model?.defaultCustomData?.description ||
          (model?.data?.description && (
            <div
              ref={descriptionRef}
              dangerouslySetInnerHTML={{
                __html:
                  model?.defaultCustomData?.description ||
                  model?.data?.description,
              }}
            />
          ))}
      </div>
      {descHeight && descHeight > minDescriptionHeight && (
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
