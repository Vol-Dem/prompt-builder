import React, { useEffect, useState } from "react";
import TagList from "../tag-list/TagList";
import classes from "./Subcategories.module.scss";
import ModelsList from "../lora/ModelsList";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";

const Subcategories = () => {
  // const [activeSubcategory, setActiveSubategory] = useState("");
  // const [subcats, setSubcats] = useState([]);

  const [isLora, setIsLora] = useState(false);
  // const [loraSubcategories, setLoraSubcategories] = useState([]);
  const activeSubcategory = useSelector((state) => state.tabs.currSubcategory);
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const currTab = useSelector((state) => state.tabs.currTab);
  const catigories = useSelector((state) => state.tabs.categoriesData);
  const subcats = useSelector((state) => state.tabs.subcategories);
  const loraSubcategories = useSelector((state) => state.tabs.modelsData);
  const subcategories = catigories[activeCategory];
  // console.log(catigories);
  // console.log(subcats);

  // console.log(currTab);
  const dispatch = useDispatch();

  // console.log(subcats);
  // console.log(catigories);
  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentSubcategory(e.target.id));
    // setActiveSubategory(e.target.id);

    if (isLora) {
      const loraCat = subcategories.filter((item) => {
        // console.log(item.sub);
        return item.sub.includes(e.target.id);
      });
      // console.log(loraCat);
      dispatch(tabActions.setModelsData(loraCat));
      // setLoraSubcategories(loraCat);
    }
  };

  useEffect(() => {
    const isLora = currTab === "models preview";
    // console.log(isLora);
    // console.log(catigories);
    // console.log(subcategories);

    const loraSubcatigoriesHtml = isLora && [
      ...new Set(
        subcategories?.flatMap((el) => {
          return el.sub;
        })
      ),
    ];

    const subcats = isLora
      ? loraSubcatigoriesHtml
      : Object.keys(subcategories || {});

    // setSubcats(subcats);
    setIsLora(isLora);
    dispatch(tabActions.setSubcategories(subcats));
  }, [subcategories]);

  const subcategoriesHtml = subcats?.map((category) => {
    return (
      <div
        id={category}
        onClick={categorySwitchHandler}
        key={category}
        className={`${classes[`subcategory__link`]} ${
          activeSubcategory === category ? classes.active : ""
        }`}
      >
        {category}
      </div>
    );
  });

  // const subcategoryHtml = (
  //   <TagList subcat={subcategories[activeSubcategory]} />
  // );

  // const subcatItemLora = subcategories.

  return (
    <div className={classes.category}>
      <div className={classes["subcategories"]}>{subcategoriesHtml}</div>
      {!isLora && <TagList subcat={subcategories[activeSubcategory]} />}
      {activeSubcategory && isLora && (
        <ModelsList loraItems={loraSubcategories} />
      )}
    </div>
  );
};

export default Subcategories;
