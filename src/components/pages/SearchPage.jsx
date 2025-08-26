import { useEffect, useRef, useState } from "react";
import PreviewCard from "../previewCard/PreviewCard";
import classes from "./SearchPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { liveSearch, searchActions } from "../../store/search";
import Spinner from "../ui/Spinner";
import ErrorMessage from "../ui/ErrorMessage";
import usePageEnd from "../../hooks/use-page-end";
import {
  ERROR_MESSAGE_OFFLINE,
  MODEL_TYPES,
  SETTINGS_SEARCH_RESULT_PER_PAGE,
} from "../../variables/constants";
import { useOnlineStatus } from "../../hooks/use-online-status";
import AddToPanelAnimContainer from "../ui/AddToPanelAnimContainer";
import Checkbox from "../ui/Checkbox";
import LeftSidebar from "../layout/left-sidebar/LeftSidebar";
import ButtonTertiary from "../ui/ButtonTertiary";
import NotificationMessage from "../ui/NotificationMessage";
import { checkArraysIsEqual } from "../../utils/generalUtils";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

const SearchPage = ({ title }) => {
  const [initial, setInitial] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [maxModelTypesAllowed, setMaxModelTypesAllowed] = useState(3);
  const [maxBaseModelsAllowed, setMaxBaseModelsAllowed] = useState(3);
  const [modelTypesChecked, setModelTypesChecked] = useState(0);
  const [baseModelsChecked, setBaseModelsChecked] = useState(0);
  const [modelTypeCheckboxStatus, setModelTypeCheckboxStatus] = useState([]);
  const [baseModelCheckboxStatus, setBaseModelCheckboxStatus] = useState([]);
  const [hashtagCheckboxStatus, setHashtagCheckboxStatus] = useState({
    type: "checkbox",
    id: "hashtag",
    name: "hashtag",
    label: "#hashtag",
    value: false,
  });
  const searchQuery = useSelector((state) => state.search.searchQuery);
  const searchResult = useSelector((state) => state.search.searchResult);
  const searchIsLoading = useSelector((state) => state.search.isLoading);
  const isLastPage = useSelector((state) => state.search.isLastPage);
  const isLastSubPage = useSelector((state) => state.search.isLastSubPage);
  const errorMessage = useSelector((state) => state.search.errorMessage);
  const searchFilter = useSelector((state) => state.search.searchFilter);
  const usedModels = useSelector((state) => state.used.models);
  const baseModels = useSelector((state) => state.tabs.baseModels);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();
  const endPage = useRef(null);
  const isPageEnd = usePageEnd(600);
  const isOnline = useOnlineStatus();
  const timeoutRef = useRef(null);

  useEffect(() => {
    setIsIntersecting(isPageEnd);
  }, [isPageEnd]);

  useEffect(() => {
    window.scroll(0, 0);
    if (!MODEL_TYPES) return;
    const modelTypes = Object.keys(categories)
      .map((categoryId) => {
        const modelTypeInfo = MODEL_TYPES.find(
          (modelType) => modelType.value === categoryId
        );

        return modelTypeInfo;
      })
      .sort((a, b) => a.position - b.position)
      .map((type, i) => {
        return {
          type: "checkbox",
          id: type.value,
          name: type.value,
          label: type.name,
          value: searchFilter.modelType.includes(type.value),
          disabled: false,
        };
      });

    setModelTypeCheckboxStatus([
      {
        type: "checkbox",
        id: "collection",
        name: "collection",
        label: "Image collection",
        value: searchFilter.modelType.includes("collection"),
        disabled: false,
      },
      ...modelTypes,
    ]);

    if (!baseModels.length) return;

    const baseModelsData = baseModels.map((baseModel, i) => {
      return {
        type: "checkbox",
        id: baseModel,
        name: baseModel,
        label: baseModel,
        value: searchFilter.baseModel.includes(baseModel),
      };
    });

    setBaseModelCheckboxStatus(baseModelsData);

    setHashtagCheckboxStatus((prevState) => {
      return { ...prevState, value: !!searchFilter.hashtag };
    });
  }, [baseModels, categories, searchFilter.hashtag, searchFilter]);

  const searchResultHtml = searchResult.result?.map((item, i) => {
    return (
      <AddToPanelAnimContainer key={item.id} usedModels={usedModels}>
        <PreviewCard
          layout={true}
          previewData={item}
          onClick={() => {
            dispatch(searchActions.setSearchQuery(""));
          }}
        />
        <PreviewCard
          layout={false}
          previewData={item}
          onClick={() => {
            dispatch(searchActions.setSearchQuery(""));
          }}
        />
      </AddToPanelAnimContainer>
    );
  });

  useEffect(() => {
    document.title = searchQuery ? `${title} - ${searchQuery}` : title;
  }, [title, searchQuery]);

  useEffect(() => {
    if (
      (!isLastPage || !isLastSubPage) &&
      isIntersecting &&
      !!searchResult?.result?.length &&
      isOnline
    ) {
      setIsIntersecting(false);
      clearTimeout(timeoutRef.current);
      dispatch(searchActions.setSearchIsLoading(true));
      timeoutRef.current = setTimeout(() => {
        dispatch(
          liveSearch(
            searchResult.query,
            searchResult.nsfw,
            SETTINGS_SEARCH_RESULT_PER_PAGE,
            true,
            false,
            !!searchResult?.hashtag,
            searchResult.filter
          )
        );
      }, 1000);
    }
  }, [
    isIntersecting,
    searchResult?.result?.length,
    dispatch,
    isLastPage,
    isLastSubPage,
    searchResult,
    isOnline,
  ]);

  useEffect(() => {
    if (!searchResult?.result?.length) return;
    let filterChanged = false;

    Object.keys(searchFilter).forEach((key) => {
      let isEqual;

      if (Array.isArray(searchFilter[key])) {
        isEqual = checkArraysIsEqual(
          searchFilter[key],
          searchResult.filter[key]
        );
      } else {
        isEqual = searchFilter[key] === searchResult.filter[key];
      }

      if (!isEqual) {
        filterChanged = !isEqual;
      }
    });

    if (
      !searchQuery.length &&
      !!searchResult?.result?.length &&
      filterChanged &&
      isOnline
    ) {
      setIsIntersecting(false);
      clearTimeout(timeoutRef.current);
      dispatch(searchActions.setSearchIsLoading(true));
      timeoutRef.current = setTimeout(() => {
        dispatch(searchActions.setIsLastPage(false));
        dispatch(searchActions.setIsLastSubPage(false));

        dispatch(
          liveSearch(
            searchResult.query,
            searchResult.nsfw,
            SETTINGS_SEARCH_RESULT_PER_PAGE,
            false,
            false,
            searchFilter.hashtag,
            searchFilter
          )
        );
      }, 1000);
    }
  }, [searchResult, dispatch, isOnline, searchFilter, searchQuery]);

  useEffect(() => {
    return () => {
      if (initial) {
        setInitial(false);
      } else if (!initial) {
        dispatch(searchActions.setSearchQuery(""));
      }
    };
  }, [dispatch, initial, isOnline]);

  const typeChangeHandler = (e) => {
    setModelTypeCheckboxStatus((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex((type) => type.id === e.target.id);

      newState[curIndex].value = e.target.checked;

      const checked = newState.filter((item) => item.value).length;
      setModelTypesChecked(checked);

      const modelTypes = newState
        .filter((type) => type.value)
        .map((type) => type.id);

      dispatch(
        searchActions.setSearchFilter({ type: "modelType", value: modelTypes })
      );

      return newState;
    });
  };

  const baseModelsChangeHandler = (e) => {
    setBaseModelCheckboxStatus((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex((type) => type.id === e.target.id);

      newState[curIndex].value = e.target.checked;

      const checked = newState.filter((item) => item.value).length;
      setBaseModelsChecked(checked);

      const baseModelsData = newState
        .filter((type) => type.value)
        .map((type) => type.id);

      dispatch(
        searchActions.setSearchFilter({
          type: "baseModel",
          value: baseModelsData,
        })
      );

      return newState;
    });
  };

  const hashtagChangeHandler = (e) => {
    setHashtagCheckboxStatus((prevState) => {
      return {
        ...prevState,
        value: e.target.checked,
      };
    });
    dispatch(
      searchActions.setSearchFilter({
        type: "hashtag",
        value: e.target.checked,
      })
    );
  };

  useEffect(() => {
    setMaxBaseModelsAllowed(modelTypesChecked > 1 ? 1 : 3);
    setMaxModelTypesAllowed(baseModelsChecked > 1 ? 1 : 3);
  }, [modelTypesChecked, baseModelsChecked]);

  useEffect(() => {
    if (modelTypesChecked === maxModelTypesAllowed) {
      setModelTypeCheckboxStatus((prevState) => {
        return prevState.map((item) => {
          return { ...item, disabled: !item.value };
        });
      });
    } else {
      setModelTypeCheckboxStatus((prevState) => {
        return prevState.map((item) => {
          return { ...item, disabled: false };
        });
      });
    }
    if (baseModelsChecked === maxBaseModelsAllowed) {
      setBaseModelCheckboxStatus((prevState) => {
        return prevState.map((item) => {
          return { ...item, disabled: !item.value };
        });
      });
    } else {
      setBaseModelCheckboxStatus((prevState) => {
        return prevState.map((item) => {
          return { ...item, disabled: false };
        });
      });
    }
  }, [
    modelTypesChecked,
    baseModelsChecked,
    maxModelTypesAllowed,
    maxBaseModelsAllowed,
    hashtagCheckboxStatus,
  ]);

  const modelTypesHtml = modelTypeCheckboxStatus.map((type) => {
    return (
      <li key={type.id}>
        <Checkbox
          id={type.id}
          name={type.name}
          checked={type.value}
          label={type.label}
          onChange={typeChangeHandler}
          disabled={type.disabled}
        />
      </li>
    );
  });

  const baseModelsHtml = baseModelCheckboxStatus.map((type) => {
    return (
      <li key={type.id}>
        <Checkbox
          id={type.id}
          name={type.name}
          checked={type.value}
          label={type.label}
          onChange={baseModelsChangeHandler}
          disabled={type.disabled}
        />
      </li>
    );
  });

  const resetFilterHandler = () => {
    setModelTypeCheckboxStatus((prevState) => {
      return prevState.map((item) => {
        return { ...item, value: false };
      });
    });
    setBaseModelCheckboxStatus((prevState) => {
      return prevState.map((item) => {
        return { ...item, value: false };
      });
    });
    setHashtagCheckboxStatus((prevState) => {
      return { ...prevState, value: false };
    });
    setModelTypesChecked(0);
    setBaseModelsChecked(0);
    dispatch(searchActions.resetSearchFilter());
  };

  const openSidebarHandler = () => {
    setSidebarIsOpen(true);
  };

  const closeidebarHandler = () => {
    setSidebarIsOpen(false);
  };

  return (
    <div className={classes["container"]}>
      {!searchIsLoading && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
      <LeftSidebar
        isOpen={sidebarIsOpen}
        onClose={closeidebarHandler}
        onOpen={openSidebarHandler}
        btnContent={<AdjustmentsHorizontalIcon />}
      >
        <div>
          <ButtonTertiary
            className={classes["filter__reset"]}
            onClick={resetFilterHandler}
          >
            Reset filter
          </ButtonTertiary>
        </div>
        <div className={classes.filter}>
          {!!modelTypesHtml?.length && (
            <div>
              <Checkbox
                id={hashtagCheckboxStatus.id}
                name={hashtagCheckboxStatus.name}
                checked={hashtagCheckboxStatus.value}
                label={hashtagCheckboxStatus.label}
                onChange={hashtagChangeHandler}
              />
            </div>
          )}
          {!!modelTypesHtml?.length && (
            <div>
              <div className={classes["filter__name"]}>
                Type{" "}
                <span
                  className={`${classes["filter__checked"]} ${
                    modelTypesChecked === maxModelTypesAllowed
                      ? classes["filter__limit"]
                      : ""
                  }`}
                >
                  ({modelTypesChecked} / {maxModelTypesAllowed})
                </span>
              </div>
              <ul className={classes["filter__field"]}>{modelTypesHtml}</ul>
            </div>
          )}
          {!!baseModelsHtml?.length && (
            <div>
              <div className={classes["filter__name"]}>
                Base model{" "}
                <span
                  className={`${classes["filter__checked"]} ${
                    baseModelsChecked === maxBaseModelsAllowed
                      ? classes["filter__limit"]
                      : ""
                  }`}
                >
                  ({baseModelsChecked} / {maxBaseModelsAllowed})
                </span>
              </div>
              <ul className={classes["filter__field"]}>{baseModelsHtml}</ul>
            </div>
          )}
        </div>
      </LeftSidebar>
      <div>
        {!!searchResult?.result?.length && (
          <div className={classes["text"]}>
            Search result for "{searchResult.query}"
          </div>
        )}
        {!searchIsLoading &&
          searchQuery &&
          searchResult?.query &&
          !searchResultHtml?.length &&
          isOnline && (
            <NotificationMessage className={classes["text"]}>
              No results for "{searchQuery}" found. Try to change your search
              filter
            </NotificationMessage>
          )}
        {!searchIsLoading &&
          !searchQuery &&
          !searchResult?.query &&
          !searchResultHtml?.length &&
          isOnline && (
            <NotificationMessage className={classes["text"]}>
              Enter your query in the search field to start searching
            </NotificationMessage>
          )}
        {!!searchResult?.result?.length && (
          <ul className={classes["result-list"]}>{searchResultHtml}</ul>
        )}
        {searchIsLoading && <Spinner />}
        {!isOnline && <ErrorMessage>{ERROR_MESSAGE_OFFLINE}</ErrorMessage>}
        <div ref={endPage}></div>
      </div>
    </div>
  );
};

export default SearchPage;
