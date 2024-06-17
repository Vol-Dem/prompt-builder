import React from "react";
import classes from "./ModelInfo.module.scss";
import { useSelector } from "react-redux";
import LinkA from "../../ui/LinkA";

const ModelInfo = ({ customData }) => {
  const model = useSelector((state) => state.model.model);
  const curVersion = useSelector((state) => state.model.curVersion);
  const viersionVAE = curVersion?.files?.find(
    (file) => file.type === "VAE"
  )?.name;
  const size = customData?.size || model?.defaultCustomData?.size;
  const minWeight =
    customData?.minWeight || model?.defaultCustomData?.minWeight || null;
  const maxWeight =
    customData?.maxWeight || model?.defaultCustomData?.maxWeight || null;
  const weightRange = `${minWeight?.toFixed(1)} - ${maxWeight?.toFixed(1)}`;
  const weight = customData?.weight || model?.defaultCustomData?.weight;

  return (
    <div className={classes?.info}>
      <div className={classes.type}>{model?.data?.type}</div>
      <div>
        <span className={classes["info__name"]}>Version ID:</span>{" "}
        {curVersion.id}
      </div>
      <div>
        <span className={classes["info__name"]}>Base model: </span>
        <span className={classes.model}>{curVersion?.baseModel}</span>
      </div>
      {size && (
        <div>
          <span className={classes["info__name"]}>Size:</span> {size}
        </div>
      )}
      {minWeight && maxWeight && (
        <div>
          {" "}
          <span className={classes["info__name"]}>Weight:</span> {weightRange}
        </div>
      )}
      {weight && (
        <div>
          <span className={classes["info__name"]}>Best weight:</span> {weight}
        </div>
      )}
      <div>
        <span className={classes["info__name"]}>Version:</span>{" "}
        {curVersion?.name}
        {" ("}
        <LinkA
          // target="blank"
          external={true}
          href={`https://${model?.src}/models/${model?.id}?modelVersionId=${curVersion.id}`}
          className={classes.link}
        >
          civitai
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg> */}
        </LinkA>
        {")"}
      </div>
      {customData?.fileName ||
        (curVersion.hasOwnProperty("files") && !!curVersion?.files?.length && (
          <div>
            <span className={classes["info__name"]}>File:</span>{" "}
            {customData?.fileName ||
              (curVersion.hasOwnProperty("files") &&
                curVersion?.files.find((file) => file?.primary)?.name)}
          </div>
        ))}
      {viersionVAE && (
        <div>
          <span className={classes["info__name"]}>VAE:</span> {viersionVAE}
        </div>
      )}
      {model?.clipSkip && (
        <div>
          <span className={classes["info__name"]}>Clip Skip:</span>{" "}
          {model?.clipSkip}
        </div>
      )}
    </div>
  );
};

export default ModelInfo;
