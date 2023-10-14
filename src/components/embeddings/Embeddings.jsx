import React from "react";
import { useEffect, useState } from "react";
import Category from "../category/Category";
import classes from "./Embeddings.module.scss";
import { db } from "../../firebase-config";
import { onValue, ref } from "firebase/database";
import Subcategory from "../subcategory/Subcategory";

const figureRef = ref(db, "embeddings");

const Embeddings = () => {
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    onValue(figureRef, (snapshot) => {
      const data = snapshot.val();
      //   console.log(data);
      setCategories(data);
    });
  }, []);

  const categorySwitchHandler = (e) => {
    setActiveCategory(e.target.id);
  };

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

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>{catHtml}</div>
      {activeCategory && !Array.isArray(categories[activeCategory]) && (
        <Category
          subcategories={categories[activeCategory]}
          activeCategory={activeCategory}
        />
      )}
      {activeCategory && Array.isArray(categories[activeCategory]) && (
        <Subcategory subcat={categories[activeCategory]} />
      )}
    </div>
  );
};

export default Embeddings;
