import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";

import { searchActions } from "../store/search";
import {
  selectSearchCreator,
  selectSearchHashtag,
  selectSearchQuery,
  selectSearchSrc,
} from "../store/searchSelectors";
import { MODEL_TYPES } from "../variables/constants";
import { updateSearchParams } from "../utils/generalUtils";
import { parseSearchFilterParams } from "../utils/searchUtils";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { ENUMS_CIVITAI } from "../variables/enums";
import type { SearchSrcType } from "../types/search.types";

type ModelTypeCheckboxStatusInput = {
  type: string;
  id: string;
  name: string;
  label: string;
  value: boolean;
};

type BaseModelCheckboxStatusInput = {
  type: string;
  id: string;
  name: string;
  label: string;
  value: boolean;
};

type ModelTypeInputData = { name: string; value: string };

const sortOptions = [
  { name: "Highest Rated", value: "Highest Rated" },
  { name: "Newest", value: "Newest" },
  { name: "Relevancy", value: "Relevancy" },
  { name: "Most Downloaded", value: "Most Downloaded" },
  { name: "Most Liked", value: "Most Liked" },
  { name: "Most Discussed", value: "Most Discussed" },
  { name: "Most Collected", value: "Most Collected" },
  { name: "Most Buzz", value: "Most Buzz" },
];

/**
 * Owns search-filter controls, query limits, and Redux/URL synchronization.
 * Keep source initialization and synchronization effects in their existing order.
 */
const useSearchFilterController = () => {
  const [initial, setInitial] = useState(true);
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [creatorCheckboxStatus, setCreatorCheckboxStatus] = useState({
    type: "checkbox",
    id: "creator",
    name: "creator",
    label: "Creator",
    value: false,
  });
  const userBaseModels = useAppSelector((state) => state.tabs.baseModels);
  const categories = useAppSelector((state) => state.tabs.categoriesData);
  const searchSrc = useAppSelector(selectSearchSrc);
  const searchQuery = useAppSelector(selectSearchQuery);
  const hashtag = useAppSelector(selectSearchHashtag);
  const creator = useAppSelector(selectSearchCreator);
  const tester = useAppSelector((state) => state.auth.tester);
  const dispatch = useAppDispatch();
  const searchParamSrc = searchParams.get("searchSrc") as SearchSrcType;
  const searchFilter = useMemo(
    () => ({ ...parseSearchFilterParams(searchParams), searchSrc }),
    [searchParams, searchParamSrc],
  );
  const modelTypesChecked = modelTypeCheckboxStatus.filter(
    (item) => item.value,
  ).length;
  const baseModelsChecked = baseModelCheckboxStatus.filter(
    (item) => item.value,
  ).length;
  const hasSelectionLimits = searchSrc === "aitools";
  const maxModelTypesAllowed = hasSelectionLimits && baseModelsChecked > 1 ? 1 : 3;
  const maxBaseModelsAllowed = hasSelectionLimits && modelTypesChecked > 1 ? 1 : 3;
  const modelTypeOptions = modelTypeCheckboxStatus.map((item) => ({
    ...item,
    disabled:
      hasSelectionLimits && modelTypesChecked === maxModelTypesAllowed && !item.value,
  }));
  const baseModelOptions = baseModelCheckboxStatus.map((item) => ({
    ...item,
    disabled:
      hasSelectionLimits && baseModelsChecked === maxBaseModelsAllowed && !item.value,
  }));

  useEffect(() => {
    if (searchParamSrc !== searchSrc)
      setSearchParams(() => {
        return {
          searchSrc: searchSrc,
          hashtag: hashtag + "",
          creator: creator + "",
          ...(searchSrc === "civitai" && { sort: sortOptions[0].value || "" }),
          ...(searchQuery && { searchQuery: searchQuery || "" }),
        };
      });
  }, [searchSrc, searchQuery, hashtag, creator]);

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
    setCreatorCheckboxStatus((prevState) => {
      return { ...prevState, value: !!searchFilter.creator };
    });

    if (searchFilter.sort) {
      setSortBy(searchFilter.sort);
    }

    // setInitial(false);
  }, [
    userBaseModels,
    categories,
    searchFilter.hashtag,
    searchFilter,
    // initial,
    searchSrc,
  ]);

  const typeChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, checked: isChecked } = e.target;
    const newModelTypeCheckboxStatus = modelTypeCheckboxStatus.map((type) =>
      type.id === id ? { ...type, value: isChecked } : type,
    );
    setModelTypeCheckboxStatus(newModelTypeCheckboxStatus);

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
    const newBaseModelsCheckboxStatus = baseModelCheckboxStatus.map((model) =>
      model.id === e.target.id ? { ...model, value: e.target.checked } : model,
    );

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
    dispatch(
      searchActions.setSearchFilter({
        type: "creator",
        value: false,
      }),
    );

    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, {
        hashtag: e.target.checked + "",
        creator: "false",
      });
    });
  };

  const creatorChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setCreatorCheckboxStatus((prevState) => {
      return {
        ...prevState,
        value: e.target.checked,
      };
    });
    dispatch(
      searchActions.setSearchFilter({
        type: "creator",
        value: e.target.checked,
      }),
    );
    dispatch(
      searchActions.setSearchFilter({
        type: "hashtag",
        value: false,
      }),
    );

    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, {
        creator: e.target.checked + "",
        hashtag: "false",
      });
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
    setCreatorCheckboxStatus((prevState) => {
      return { ...prevState, value: false };
    });
    dispatch(searchActions.resetSearchFilter());
    setSearchParams((prevParams) => {
      return { searchQuery: prevParams.get("searchQuery") || "" };
    });
  };

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

  return {
    source: searchSrc,
    sort: {
      options: sortOptions,
      value: sortBy,
      disabled: !tester,
      onChange: searchSrcHandler,
    },
    modelTypes: {
      options: modelTypeOptions,
      checkedCount: modelTypesChecked,
      maxAllowed: maxModelTypesAllowed,
      onChange: typeChangeHandler,
    },
    baseModels: {
      options: baseModelOptions,
      checkedCount: baseModelsChecked,
      maxAllowed: maxBaseModelsAllowed,
      onChange: baseModelsChangeHandler,
    },
    hashtag: {
      ...hashtagCheckboxStatus,
      onChange: hashtagChangeHandler,
    },
    creator: {
      ...creatorCheckboxStatus,
      onChange: creatorChangeHandler,
    },
    reset: resetFilterHandler,
  };
};

export default useSearchFilterController;
