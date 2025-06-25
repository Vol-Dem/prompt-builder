import classes from "./Video.module.scss";
import useIntersection from "../../hooks/use-intersection";
import { useEffect, useRef } from "react";

const Video = ({
  playsInline,
  autoPlay,
  loop,
  disablePictureInPicture,
  preload = "none",
  muted,
  poster,
  mainSrc,
  secondarySrc,
  className,
  controls,
  width,
  height,
  children,
  loading,
  ...video
  //   type,
}) => {
  // console.log(playsInline);
  const videoRef = useRef(null);
  const isIntersecting = useIntersection(autoPlay ? videoRef : null, false);
  const isIntersectingPoster = useIntersection(
    loading === "lazy" ? videoRef : null,
    true,
    500
  );

  useEffect(() => {
    // console.log(isIntersecting);
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
      } catch (err) {
        // console.log(err);
      }
    };

    if (isIntersecting && autoPlay) {
      // console.log("PLAY");
      playVideo();
    }

    if (!isIntersecting && autoPlay) {
      // console.log("Pause");
      pauseVideo();
    }
  }, [isIntersecting, autoPlay]);

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      playsInline={!!playsInline}
      // autoPlay={!!autoPlay}
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
      {/* <source
        src={mainSrc?.internal ? require(mainSrc.src) : mainSrc.src}
        type={mainSrc.type}
      />
      {secondarySrc && (
        <source
          src={
            secondarySrc?.internal
              ? require(secondarySrc.src)
              : secondarySrc.src
          }
          type={secondarySrc.type}
        />
      )} */}
    </video>
  );
};

export default Video;
