import { useEffect, useRef, type ComponentProps } from "react";

import classes from "./Video.module.scss";
import useIntersection from "../../hooks/use-intersection";
import { handleErrors, normalizeError } from "../../utils/generalUtils";

type VideoProps = ComponentProps<"video"> & { loading?: "lazy" };

/**
 * Video component.
 *
 * Renders an enhanced video element.
 *
 * Behavior:
 * - lazy loading for poster.
 * - auto play when comes into view.
 * - auto stop when leaves the viewport.
 *
 * @component
 *
 * @param props
 * @param props.playsInline - Indicating that the video is to be played "inline"h.
 * @param props.autoPlay - Whether the video automatically begins to play when comes into view.
 * @param props.disablePictureInPicture - If you want to disable the Picture-In-Picture mode.
 * @param props.preload - What content is loaded before the video is played.
 * @param props.muted - The default audio mute setting.
 * @param props.poster - A URL for an image to be shown while the video is downloading.
 * @param props.className - Optional class name.
 * @param props.controls - Whether to offer controls to allow the user to control video playback.
 * @param props.width - Rendered video width.
 * @param props.height - Rendered video height.
 * @param props.loop - Loop.
 * @param props.loading - Whether to use lazy loading for poster.
 * @param props.children - source element.
 *
 * @returns Video element.
 */
const Video = ({
  playsInline,
  autoPlay,
  loop,
  disablePictureInPicture,
  preload = "none",
  muted,
  poster,
  className,
  controls,
  width,
  height,
  loading,
  children,
  ...video
}: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isIntersecting = useIntersection(autoPlay ? videoRef : null, false);
  const isIntersectingPoster = useIntersection(
    loading === "lazy" ? videoRef : null,
    true,
    500,
  );

  useEffect(() => {
    const playVideo = async () => {
      try {
        if (videoRef.current) {
          await videoRef.current.play();
        }
      } catch (err) {
        console.log(err);
      }
    };
    const pauseVideo = async () => {
      try {
        if (videoRef.current) {
          await videoRef.current.pause();
        }
      } catch (error) {
        handleErrors(normalizeError(error));
      }
    };

    if (isIntersecting && autoPlay) {
      playVideo();
    }

    if (!isIntersecting && autoPlay) {
      pauseVideo();
    }
  }, [isIntersecting, autoPlay]);

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      playsInline={!!playsInline}
      loop={!!loop}
      disablePictureInPicture={!!disablePictureInPicture}
      preload={preload}
      muted={!!muted}
      poster={loading === "lazy" && !isIntersectingPoster ? "#" : poster}
      controls={controls}
      className={`${classes["video"]} ${className || ""}`}
      {...video}
    >
      {children}
    </video>
  );
};

export default Video;
