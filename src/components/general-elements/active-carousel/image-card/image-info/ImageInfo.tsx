import classes from "./ImageInfo.module.scss";
import LinkA from "../../../../ui/LinkA";
import ImageInfoItem from "../image-info-item/ImageInfoItem";
import ImageSeed from "../image-seed/ImageSeed";
import type { Image } from "../../../../../../shared/types/image";

type ImageInfoProps = { imageData: Image };

/**
 * Image info component.
 *
 * Shows the currently active image generation metadata.
 *
 * @component
 *
 * @param {object} props
 * @param {object} props.imageData - Image data.
 * @returns {JSX.Element} Image info.
 */
const ImageInfo = ({ imageData }: ImageInfoProps) => {
  return (
    <>
      <ul className={classes["config-block"]}>
        {!!imageData?.postId && (
          <ImageInfoItem name="Post ID">{imageData.postId}</ImageInfoItem>
        )}
        {!!imageData?.id && (
          <ImageInfoItem name="Image ID">{imageData.id}</ImageInfoItem>
        )}
        {!!imageData?.meta?.cfgScale && (
          <ImageInfoItem name="CFG scale">
            {imageData.meta.cfgScale}
          </ImageInfoItem>
        )}
        {!!imageData?.meta?.steps && (
          <ImageInfoItem name="Steps">{imageData.meta.steps}</ImageInfoItem>
        )}
        {!!imageData?.meta?.sampler && (
          <ImageInfoItem name="Sampler">{imageData.meta.sampler}</ImageInfoItem>
        )}
        {!!imageData?.meta?.seed && (
          <ImageInfoItem name="Seed">
            <ImageSeed value={imageData.meta.seed} />
          </ImageInfoItem>
        )}
        {!!imageData?.meta?.Model && (
          <ImageInfoItem name="Checkpoint">
            {imageData.meta.Model}
          </ImageInfoItem>
        )}
        {!!imageData?.meta?.Size && (
          <ImageInfoItem name="Size">{imageData.meta.Size}</ImageInfoItem>
        )}
        {!!imageData?.meta?.clipSkip && (
          <ImageInfoItem name="Clip Skip">
            {imageData.meta.clipSkip}
          </ImageInfoItem>
        )}
        {!!imageData?.id && (
          <ImageInfoItem name="Image source">
            <LinkA
              external={true}
              href={`https://civitai.com/images/${imageData.id}`}
            >
              civitai
            </LinkA>
          </ImageInfoItem>
        )}
      </ul>
    </>
  );
};

export default ImageInfo;
