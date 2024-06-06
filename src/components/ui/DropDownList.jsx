import { useEffect } from "react";
import classes from "./DropDownList.module.scss";
const DropDownList = (props) => {
  // useEffect(() => {
  //   const closeResultHandler = (e) => {
  //     const uploading = e.target.closest(`.${classes["search__dropdown"]}`);
  //     if (!uploading) {
  //       console.log(uploading);
  //       // setUploadingLIstIsOpen(false);
  //       props.onClose();
  //     }
  //   };
  //   if (true) {
  //     console.log("DROPPPPP");
  //     document.addEventListener("click", closeResultHandler);
  //   } else {
  //     document.removeEventListener("click", closeResultHandler);
  //   }

  //   return () => {
  //     document.removeEventListener("click", closeResultHandler);
  //   };
  // }, []);

  return (
    <div className={`${classes["search__dropdown"]} ${props.className || ""}`}>
      <div className={classes["search__settings"]}>
        <button
          className={classes["search__btn-close"]}
          onClick={() => {
            props.onClose();
          }}
        >
          <span className={classes["search__cross"]}></span>
        </button>
      </div>
      <div className={classes["search__result"]}>
        {/* {!!subcategoriesSearchResult.length && (
      <ul className={classes["search__categories"]}>
        {categoriesSearchResultHtml}
      </ul>
    )} */}
        {/* {searchIsLoading && (
      <div className={classes["spiner-container"]}>
        <Spinner size="small" />
      </div>
    )}
    {!searchIsLoading && errorMessage && (
      <div className={classes.error}>{errorMessage}</div>
    )} */}
        {/* {!searchIsLoading && !!searchResult.length && (
      <ul className={classes["search__models"]}>
        {searchResultHtml}
      </ul>
    )} */}
        {props.children}
      </div>
    </div>
  );
};

export default DropDownList;
