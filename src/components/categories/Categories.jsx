import React from "react";
import { useEffect } from "react";
import Subcategories from "../subcategories/Subcategories";
import classes from "./Categories.module.scss";
import { db } from "../../firebase-config";
import { onValue, ref } from "firebase/database";
import TagList from "../tag-list/TagList";
import { useDispatch, useSelector } from "react-redux";
import { tabActions } from "../../store/tabs";
import { getDoc } from "firebase/firestore";

// const generalRef = ref(db, "general/body");

const Categories = () => {
  // const [categories, setCategories] = useState({});
  // const [activeCategory, setActiveCategory] = useState("");
  const activeCategory = useSelector((state) => state.tabs.currCategory);
  const activeTab = useSelector((state) => state.tabs.currTab);
  const categories = useSelector((state) => state.tabs.categoriesData);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(categories);
    // const userRef = doc(firestore, "users", uid);
    // const getCategories = async () => {
    //   const userSnap = await getDoc(userRef);
    //   if (userSnap.exists()) {
    //     const data = modelSnap.data();
    //     console.log(data);
    //     dispatch(tabActions.setCategories(data));
    //   }
    // };
    // getCategories();
    // const categoryRef = ref(db, activeTab);
    // onValue(categoryRef, (snapshot) => {
    //   const data = snapshot.val();
    //   dispatch(tabActions.setCategories(data));
    // });
  }, [activeTab, dispatch, categories]);

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

  const catHtml = categories?.hasOwnProperty(activeTab)
    ? Object.keys(categories[activeTab]).map((key) => {
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
      })
    : [];

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>{catHtml}</div>
      {activeCategory && (
        <Subcategories
          subcategories={categories[activeTab][activeCategory]}
          activeCategory={activeCategory}
        />
      )}
      {!categories && <div>Nothing is here...</div>}
    </div>
  );
};

export default Categories;
