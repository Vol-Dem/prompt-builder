import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";

import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import Checkbox from "../../ui/forms/Checkbox";
import classes from "./SearchFilter.module.scss";
import { searchActions } from "../../../store/search";
import { MODEL_TYPES } from "../../../variables/constants";
import { updateSearchParams } from "../../../utils/generalUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks/hooks";

type mMdelTypeCheckboxStatusInput = {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [maxModelTypesAllowed, setMaxModelTypesAllowed] = useState(3);
  const [maxBaseModelsAllowed, setMaxBaseModelsAllowed] = useState(3);
  const [modelTypesChecked, setModelTypesChecked] = useState(0);
  const [baseModelsChecked, setBaseModelsChecked] = useState(0);
  const [modelTypeCheckboxStatus, setModelTypeCheckboxStatus] = useState<
    mMdelTypeCheckboxStatusInput[]
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
  const baseModels = useAppSelector((state) => state.tabs.baseModels);
  const categories = useAppSelector((state) => state.tabs.categoriesData);
  const dispatch = useAppDispatch();
  const searchFilter = useMemo(() => {
    const modelType = searchParams.get("modelType");
    const baseModel = searchParams.get("baseModel");
    const hashtag = !!searchParams.get("hashtag");
    return {
      modelType: modelType?.split(",").filter(Boolean) || [],
      baseModel: baseModel?.split(",").filter(Boolean) || [],
      hashtag,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!MODEL_TYPES || !initial) return;
    const modelTypes = Object.keys(categories)
      .flatMap((categoryId) => {
        const modelTypeInfo = MODEL_TYPES.find(
          (modelType) => modelType.value === categoryId,
        );

        return modelTypeInfo || [];
      })
      .sort((a, b) => a.position - b.position)
      .map((type) => {
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
    setModelTypesChecked(searchFilter.modelType.length);
    setBaseModelsChecked(searchFilter.baseModel.length);
    setInitial(false);
  }, [baseModels, categories, searchFilter.hashtag, searchFilter, initial]);

  useEffect(() => {
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
        searchActions.setSearchFilter({ type: "modelType", value: modelTypes }),
      );

      setSearchParams((prevParams) => {
        return updateSearchParams(prevParams, {
          modelType: modelTypes.toString(),
        });
      });

      return newState;
    });
  };

  const baseModelsChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
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
        }),
      );

      setSearchParams((prevParams) => {
        return updateSearchParams(prevParams, {
          baseModel: baseModelsData.toString(),
        });
      });

      return newState;
    });
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
    </>
  );
};

export default SearchFilter;
