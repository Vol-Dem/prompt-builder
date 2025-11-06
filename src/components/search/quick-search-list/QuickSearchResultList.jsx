import { useSelector } from "react-redux";
import QuickSearchItem from "../quick-search-item/QuickSearchItem";
import classes from "./QuickSearchResultList.module.scss";

const QuickSearchResultList = () => {
  const searchResult = useSelector((state) => state.search.quickSerchResult);

  const searchResultHtml = searchResult?.result?.map((modelPreveiw, i) => {
    return (
      <QuickSearchItem key={modelPreveiw.id} modelPreveiw={modelPreveiw} />
    );
  });

  return <ul className={classes["list"]}>{searchResultHtml}</ul>;
};

export default QuickSearchResultList;
