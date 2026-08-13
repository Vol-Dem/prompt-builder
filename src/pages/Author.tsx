import { useEffect } from "react";
import classes from "./Author.module.scss";
import { useParams } from "react-router-dom";
import ExternalImages from "../components/model/generated-images/external-images/ExternalImages";
import {
  DEFAULT_PAGE_TITLE,
  URL_CIV_DEF,
  URL_CIV_RED,
} from "../variables/constants";
import H1 from "../components/ui/text/H1";
import LinkA from "../components/ui/LinkA";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { modelActions } from "../store/model";

const Author = () => {
  const nsfwMode = useAppSelector((state) => state.general.nsfwMode);
  const { authorName } = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (authorName) document.title = authorName;

    return () => {
      dispatch(modelActions.setActiveCarouselData(null));
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, []);

  return (
    <div>
      <H1>{authorName}</H1>
      <LinkA
        external
        href={`${!nsfwMode ? URL_CIV_DEF : URL_CIV_RED}/user/${authorName}`}
        className={classes.link}
      >
        Civitai
      </LinkA>
      <div className={classes.images}>
        <ExternalImages username={authorName} sortBy="Newest" />
      </div>
    </div>
  );
};

export default Author;
