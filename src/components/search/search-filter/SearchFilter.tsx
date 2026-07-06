import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";

import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import Checkbox from "../../ui/forms/Checkbox";
import classes from "./SearchFilter.module.scss";
import { searchActions } from "../../../store/search";
import { MODEL_TYPES } from "../../../variables/constants";
import { updateSearchParams } from "../../../utils/generalUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";
import { ENUMS_CIVITAI } from "../../../variables/enums";
import type { SearchSrcType } from "../../../types/search.types";
import Select from "../../ui/forms/Select";

type ModelTypeCheckboxStatusInput = {
  type: string;
  id: string;
  name: string;
  label: string;
  value: boolean;
  disabled?: boolean;
};

type BaseModelCheckboxStatusInput = {
  type: string;
  id: string;
  name: string;
  label: string;
  value: boolean;
  disabled?: boolean;
};

type ModelTypeInputData = { name: string; value: string };

const sortOptions = [
  { name: "Newest", value: "Newest" },
  { name: "Relevancy", value: "Relevancy" },
  { name: "Highest Rated", value: "Highest Rated" },
  { name: "Most Downloaded", value: "Most Downloaded" },
  { name: "Most Liked", value: "Most Liked" },
  { name: "Most Discussed", value: "Most Discussed" },
  { name: "Most Collected", value: "Most Collected" },
  { name: "Most Buzz", value: "Most Buzz" },
];

/**
 * SearchFilter
 *
 * Dynamic filter sidebar for the search page.
 *
 * Provides model type, base model, and hashtag filters while
 * enforcing backend query constraints (Firestore disjunction limits).
 *
 * The component dynamically restricts the number of selectable
 * checkboxes so that the generated query is always valid.
 *
 * Constraint rules:
 * - A maximum of 4 total disjunctions is allowed.
 * - If 2–3 model types are selected, only 1 base model may be selected.
 * - If 2–3 base models are selected, only 1 model type may be selected.
 * - Otherwise, up to 3 selections are allowed per group.
 *
 * Behavior:
 * - Synchronizes filter state with the URL query parameters.
 * - Dispatches filter changes to the global search store.
 * - Automatically disables options when limits are reached.
 * - Re-enables options when selections are removed.
 * - Supports full filter reset while preserving the search query.
 *
 * @component
 *
 * @returns Search filter sidebar.
 */
const SearchFilter = () => {
  const [initial, setInitial] = useState(true);
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [searchParams, setSearchParams] = useSearchParams();
  const [maxModelTypesAllowed, setMaxModelTypesAllowed] = useState(3);
  const [maxBaseModelsAllowed, setMaxBaseModelsAllowed] = useState(3);
  const [modelTypesChecked, setModelTypesChecked] = useState(0);
  const [baseModelsChecked, setBaseModelsChecked] = useState(0);
  const [modelTypeCheckboxStatus, setModelTypeCheckboxStatus] = useState<
    ModelTypeCheckboxStatusInput[]
  >([]);
  const [baseModelCheckboxStatus, setBaseModelCheckboxStatus] = useState<
    BaseModelCheckboxStatusInput[]
  >([]);
  const [hashtagCheckboxStatus, setHashtagCheckboxStatus] = useState({
    type: "checkbox",
    id: "hashtag",
    name: "hashtag",
    label: "#hashtag",
    value: false,
  });
  const userBaseModels = useAppSelector((state) => state.tabs.baseModels);
  const categories = useAppSelector((state) => state.tabs.categoriesData);
  const searchSrc = useAppSelector((state) => state.search.src);
  const searchQuery = useAppSelector((state) => state.search.searchQuery);
  const dispatch = useAppDispatch();
  const searchParamSrc = searchParams.get("searchSrc") as SearchSrcType;
  const searchFilter = useMemo(() => {
    const modelType = searchParams.get("modelType");
    const baseModel = searchParams.get("baseModel");
    const sort = searchParams.get("sort");
    const hashtag = searchParams.get("hashtag") === "true";
    return {
      modelType: modelType?.split(",").filter(Boolean) || [],
      baseModel: baseModel?.split(",").filter(Boolean) || [],
      hashtag,
      searchSrc,
      sort,
    };
  }, [searchParams, searchParamSrc]);

  useEffect(() => {
    if (searchParamSrc !== searchSrc)
      setSearchParams(() => {
        return {
          searchSrc: searchSrc,
          ...(searchSrc === "civitai" && { sort: sortOptions[0].value || "" }),
          ...(searchQuery && { searchQuery: searchQuery || "" }),
        };
      });
  }, [searchSrc]);

  useEffect(() => {
    if (searchParamSrc && initial) {
      dispatch(searchActions.setSearchSrc(searchParamSrc));
    }

    setInitial(false);
  }, [searchSrc, initial]);

  const createModelTypesInputData = (
    modelTypes: ModelTypeInputData[],
  ): ModelTypeCheckboxStatusInput[] => {
    const modelTypeInputs = modelTypes.map((type) => {
      return {
        type: "checkbox",
        id: type.value,
        name: type.value,
        label: type.name,
        value: searchFilter.modelType.includes(type.value),
        disabled: false,
      };
    });

    if (searchSrc === "aitools") {
      return [
        {
          type: "checkbox",
          id: "collection",
          name: "collection",
          label: "Image collection",
          value: searchFilter.modelType.includes("collection"),
          disabled: false,
        },
        ...modelTypeInputs,
      ];
    }

    return modelTypeInputs;
  };

  useEffect(() => {
    // if (!MODEL_TYPES || !initial) return;

    let modelTypes: ModelTypeInputData[] = [];

    if (searchSrc === "civitai") {
      modelTypes = ENUMS_CIVITAI.ModelType.map((type) => {
        return { name: type, value: type };
      });
    }

    if (searchSrc === "aitools") {
      modelTypes = Object.keys(categories)
        .flatMap((categoryId) => {
          const modelTypeInfo = MODEL_TYPES.find(
            (modelType) => modelType.value === categoryId,
          );

          return modelTypeInfo || [];
        })
        .sort((a, b) => a.position - b.position);
    }

    const modelTypesInputData = createModelTypesInputData(modelTypes);
    setModelTypeCheckboxStatus(modelTypesInputData);

    if (!userBaseModels.length) return;

    let baseModels =
      searchSrc === "aitools" ? userBaseModels : ENUMS_CIVITAI.BaseModel;

    const baseModelsData = baseModels.map((baseModel) => {
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

    if (searchFilter.sort) {
      setSortBy(searchFilter.sort);
    }

    setModelTypesChecked(searchFilter.modelType.length);
    setBaseModelsChecked(searchFilter.baseModel.length);
    // setInitial(false);
  }, [
    userBaseModels,
    categories,
    searchFilter.hashtag,
    searchFilter,
    // initial,
    searchSrc,
  ]);

  useEffect(() => {
    if (searchSrc === "civitai") return;
    setMaxBaseModelsAllowed(modelTypesChecked > 1 ? 1 : 3);
    setMaxModelTypesAllowed(baseModelsChecked > 1 ? 1 : 3);

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

  const typeChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const newModelTypeCheckboxStatus = [...modelTypeCheckboxStatus];
    setModelTypeCheckboxStatus((prevState) => {
      const newState = [...prevState];
      const curIndex = newState.findIndex((type) => type.id === e.target.id);
      newState[curIndex].value = e.target.checked;

      return newState;
    });

    const checked = newModelTypeCheckboxStatus.filter(
      (item) => item.value,
    ).length;
    setModelTypesChecked(checked);

    const modelTypes = newModelTypeCheckboxStatus
      .filter((type) => type.value)
      .map((type) => type.id);

    dispatch(
      searchActions.setSearchFilter({ type: "modelType", value: modelTypes }),
    );

    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, {
        modelType: modelTypes.toString(),
      });
    });
  };

  const baseModelsChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const newBaseModelsCheckboxStatus = [...baseModelCheckboxStatus];
    const curIndex = newBaseModelsCheckboxStatus.findIndex(
      (type) => type.id === e.target.id,
    );

    newBaseModelsCheckboxStatus[curIndex].value = e.target.checked;

    const checked = newBaseModelsCheckboxStatus.filter(
      (item) => item.value,
    ).length;
    setBaseModelsChecked(checked);

    const baseModelsData = newBaseModelsCheckboxStatus
      .filter((type) => type.value)
      .map((type) => type.id);

    dispatch(
      searchActions.setSearchFilter({
        type: "baseModel",
        value: baseModelsData,
      }),
    );

    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, {
        baseModel: baseModelsData.toString(),
      });
    });

    setBaseModelCheckboxStatus(newBaseModelsCheckboxStatus);
  };

  const hashtagChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
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
      }),
    );

    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, { hashtag: e.target.checked + "" });
    });
  };

  const resetFilterHandler = () => {
    setSortBy(sortOptions[0].value);
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
    setSearchParams((prevParams) => {
      return { searchQuery: prevParams.get("searchQuery") || "" };
    });
  };

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

  const searchSrcHandler = (value: string | null) => {
    if (!value) return;

    setSortBy(value);
    dispatch(
      searchActions.setSearchFilter({
        type: "sort",
        value: value,
      }),
    );

    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, { sort: value });
    });
  };

  return (
    <>
      <div>
        <ButtonTertiary
          className={classes["filter__reset"]}
          onClick={resetFilterHandler}
        >
          Reset filter
        </ButtonTertiary>
      </div>
      <div className={classes.filter}>
        {searchSrc === "civitai" && (
          <Select
            options={sortOptions}
            selected={sortBy}
            onChange={searchSrcHandler}
          />
        )}
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
              {searchSrc === "aitools" && (
                <span
                  className={`${classes["filter__checked"]} ${
                    modelTypesChecked === maxModelTypesAllowed
                      ? classes["filter__limit"]
                      : ""
                  }`}
                >
                  ({modelTypesChecked} / {maxModelTypesAllowed})
                </span>
              )}
            </div>
            <ul className={classes["filter__field"]}>{modelTypesHtml}</ul>
          </div>
        )}
        {!!baseModelsHtml?.length && (
          <div>
            <div className={classes["filter__name"]}>
              Base model{" "}
              {searchSrc === "aitools" && (
                <span
                  className={`${classes["filter__checked"]} ${
                    baseModelsChecked === maxBaseModelsAllowed
                      ? classes["filter__limit"]
                      : ""
                  }`}
                >
                  ({baseModelsChecked} / {maxBaseModelsAllowed})
                </span>
              )}
            </div>
            <ul className={classes["filter__field"]}>{baseModelsHtml}</ul>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchFilter;
