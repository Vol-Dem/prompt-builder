import { useDispatch, useSelector } from "react-redux";
import ButtonTertiary from "../../ui/ButtonTertiary";
import Checkbox from "../../ui/Checkbox";
import classes from "./SearchFilter.module.scss";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchActions } from "../../../store/search";
import { MODEL_TYPES } from "../../../variables/constants";
import { updateSearchParams } from "../../../utils/generalUtils";

const SearchFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const baseModels = useSelector((state) => state.tabs.baseModels);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();
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

      setSearchParams((prevParams) => {
        return updateSearchParams(prevParams, { modelType: modelTypes });
      });

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

      setSearchParams((prevParams) => {
        return updateSearchParams(prevParams, { baseModel: baseModelsData });
      });

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

    setSearchParams((prevParams) => {
      return updateSearchParams(prevParams, { hashtag: e.target.checked });
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
      return { searchQuery: prevParams.get("searchQuery") };
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
