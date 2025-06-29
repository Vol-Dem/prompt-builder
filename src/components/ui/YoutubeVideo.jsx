import classes from "./YoutubeVideo.module.scss";

const YoutubeVideo = ({
  src,
  title,
  className,
  controls = 1,
  autoplay = 0,
  loop = 0,
  disablekb = 0,
}) => {
  const at = autoplay ? 1 : 0;
  const url = `${src}&controls=0&autoPlay=1`;
  // const url = `${src}&amp;controls=${
  //   controls ? 1 : 0
  // }&amp;autoplay=${at}&amp;loop=${loop ? 1 : 0}&amp;disablekb=${
  //   disablekb ? 1 : 0
  // }&amp;iv_load_policy=3`;

  return (
    <div className={`${classes["video-container"]} ${className || ""}`}>
      <iframe
        className={classes["video"]}
        src={`${src}&amp;controls=0&amp;autoPlay=1`}
        title={title || "YouTube video player"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YoutubeVideo;
