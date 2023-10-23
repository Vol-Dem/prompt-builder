import React from "react";
import { useEffect } from "react";
import Subcategories from "../subcategories/Subcategories";
import classes from "./Categories.module.scss";
import { db } from "../../firebase-config";
import { onValue, ref } from "firebase/database";
import TagList from "../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";

// const generalRef = ref(db, "general/body");

const Categories = () => {
  // const [categories, setCategories] = useState({});
  // const [activeCategory, setActiveCategory] = useState("");
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();

  useEffect(() => {
    const categoryRef = ref(db, activeTab);
    //     const tagsByCategory = {};
    //    tags.forEach((el) => {
    //       tagsByCategory.hasOwnProperty(el.mainCategory)
    //         ? tagsByCategory[el.mainCategory].push(el)
    //         : (tagsByCategory[el.mainCategory] = [el]);
    //     });

    onValue(categoryRef, (snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      // setCategories(data);
      dispatch(tabActions.setCategories(data));
    });
  }, [activeTab, dispatch]);

  const categorySwitchHandler = (e) => {
    dispatch(tabActions.setCurrentCategory(e.target.id));
    dispatch(tabActions.setCurrentSubcategory(""));
    // setActiveCategory(e.target.id);
  };

  // useEffect(() => {
  //   const loraPrevRef = ref(db, "lora preview");
  //   const figureRef = ref(db, "lora");
  //   onValue(figureRef, (snapshot) => {
  //     const data = snapshot.val();
  //     //   console.log(data);
  //     const lorasPreview = {};
  //     Object.keys(data).forEach((cat) => {
  //       // console.log(cat);
  //       // const subcat = [];
  //       lorasPreview[cat] = Object.keys(data[cat]).map((id) => {
  //         //   subcat.push(data[cat][id].sub);
  //         return {
  //           id,
  //           sub: data[cat][id].sub,
  //           title: data[cat][id].title,
  //           mainTag: data[cat][id].mainTag,
  //           tags: data[cat][id].tags || [],
  //           baseModel: data[cat][id].baseModel,
  //           helperTags: data[cat][id].helperTags || [],
  //           negativeTags: data[cat][id].negativeTags || [],
  //           type: data[cat][id].type,
  //           weight: data[cat][id].weight,
  //           clipSkip: data[cat][id].clipSkip || "",
  //           size: data[cat][id].size || "",
  //         };
  //       });
  //       // console.log([...new Set(subcat.flat())]);
  //     });
  //     console.log(lorasPreview);
  //     set(loraPrevRef, lorasPreview);
  //   });
  // }, []);

  const catHtml = Object.keys(categories).map((key) => {
    return (
      <div
        id={key}
        onClick={categorySwitchHandler}
        key={key}
        className={`${classes[`category__link`]} ${
          activeCategory === key ? classes.active : ""
        }`}
      >
        {key}
      </div>
    );
  });

  const isArr = Array.isArray(categories[activeCategory]);
  const isLora = isArr && activeTab === "models preview";

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>{catHtml}</div>
      {activeCategory && (isLora || !isArr) && (
        <Subcategories
          subcategories={categories[activeCategory]}
          activeCategory={activeCategory}
        />
      )}
      {activeCategory && isArr && !isLora && (
        <TagList tags={categories[activeCategory]} />
      )}
    </div>
  );
};

export default Categories;
