import classes from "./ModelInfo.module.scss";
import LinkA from "../../ui/LinkA";
import ResourceTypeLabel from "../../ui/text/ResourceTypeLabel";
import type { ModelVersionCustomData } from "../../../../shared/types/model";
import { useAppSelector } from "../../../store/hooks/hooks";

type ModelInfoProps = { customData?: ModelVersionCustomData | null };

/**
 * Content for the model info section.
 *
 * Displays model information with link to Civitai.
 *
 * @component
 * @returns The model info content.
 */
const ModelInfo = ({ customData }: ModelInfoProps) => {
  const model = useAppSelector((state) => state.model.model);
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const curVersion = useAppSelector((state) => state.model.curVersion);
  const viersionVAE = curVersion?.files?.find(
    (file) => file.type === "VAE",
  )?.name;
  const size = customData?.size || model?.defaultCustomData?.size;
  const minWeight =
    customData?.minWeight || model?.defaultCustomData?.minWeight || null;
  const maxWeight =
    customData?.maxWeight || model?.defaultCustomData?.maxWeight || null;
  const weightRange = `${minWeight?.toFixed(1)} - ${maxWeight?.toFixed(1)}`;
  const weight = customData?.weight || model?.defaultCustomData?.weight;
  const versionFileName =
    curVersion &&
    Object.hasOwn(curVersion, "files") &&
    curVersion?.files.find((file) => file?.primary)?.name;
  const fileName =
    customData?.fileName ||
    model?.defaultCustomData?.fileName ||
    versionFileName;

  return (
    <div className={classes?.info}>
      <ResourceTypeLabel type={model?.data?.type} className={classes.type}>
        {model?.data?.type}
      </ResourceTypeLabel>
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
            href={`https://${nsfwMode ? "civitai.red" : "civitai.com"}/models/${model?.id}?modelVersionId=${curVersion?.id}`}
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
    </div>
  );
};

export default ModelInfo;
