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
  const versionFileName =
    curVersion?.hasOwnProperty("files") &&
    curVersion?.files.find((file) => file?.primary)?.name;
  const fileName =
    customData?.fileName ||
    model?.defaultCustomData?.fileName ||
    versionFileName;

  return (
    <div className={classes?.info}>
      <div className={classes.type}>{model?.data?.type}</div>
      <div>
        <span className={classes["info__name"]}>Version ID:</span>{" "}
        {curVersion?.id}
      </div>
      <div>
        <span className={classes["info__name"]}>Base model: </span>
        <span className={classes.model}>{curVersion?.baseModel}</span>
      </div>
      {!!size && (
        <div>
          <span className={classes["info__name"]}>Size:</span> {size}
        </div>
      )}
      {!!minWeight && !!maxWeight && (
        <div>
          {" "}
          <span className={classes["info__name"]}>Weight:</span> {weightRange}
        </div>
      )}
      {!!weight && (
        <div>
          <span className={classes["info__name"]}>Best weight:</span> {weight}
        </div>
      )}
      <div>
        <span className={classes["info__name"]}>Version:</span>{" "}
        {customData?.name || curVersion?.name}
        <div>
          {" "}
          {" ("}
          <LinkA
            external={true}
            href={`https://${model?.src}/models/${model?.id}?modelVersionId=${curVersion?.id}`}
          >
            civitai
          </LinkA>
          {")"}
        </div>
      </div>
      {fileName && (
        <div>
          <span className={classes["info__name"]}>File:</span> {fileName}
        </div>
      )}
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
