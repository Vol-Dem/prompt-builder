import React from "react";
import { useEffect, useState } from "react";
import Category from "../subcategories/Subcategories";
import classes from "./ModelsList.module.scss";
import { db } from "../../firebase-config";
import { onValue, ref, set } from "firebase/database";
import Tag from "../tag/Tag";
import PreviewCard from "../previewCard/PreviewCard";
// import Subcategory from "../subcategory/Subcategory";

const ModelsList = ({ loraItems }) => {
  // useEffect(() => {
  //   const loraPrevRef = ref(db, "lora preview");
  //   const figureRef = ref(db, "lora");
  //   onValue(figureRef, (snapshot) => {
  //     const data = snapshot.val();
  //     const lorasPreview = {};
  //     Object.keys(data).forEach((id) => {
  //       lorasPreview[data[id].main] = {
  //         id,
  //         main: data[id].main,
  //         sub: data[id].sub,
  //         title: data[id].title,
  //         mainTag: data[id].mainTag,
  //         baseModel: data[id].baseModel,
  //         tags: data[id].tags || [],
  //         helperTags: data[id].helperTags || [],
  //         negativeTags: data[id].negativeTags || [],
  //         type: data[id].type,
  //         weight: data[id].weight,
  //         clipSkip: data[id].clipSkip || "",
  //         size: data[id].size || "",
  //       };
  //     });

  //     // Object.keys(data).forEach((cat) => {

  //     //   lorasPreview[cat] = Object.keys(data[cat]).map((id) => {

  //     //     return {
  //     //       id,
  //     //       sub: data[cat][id].sub,
  //     //       title: data[cat][id].title,
  //     //       mainTag: data[cat][id].mainTag,
  //     //       tags: data[cat][id].tags || [],
  //     //       baseModel: data[cat][id].baseModel,
  //     //       helperTags: data[cat][id].helperTags || [],
  //     //       negativeTags: data[cat][id].negativeTags || [],
  //     //       type: data[cat][id].type,
  //     //       weight: data[cat][id].weight,
  //     //       clipSkip: data[cat][id].clipSkip || "",
  //     //       size: data[cat][id].size || "",
  //     //     };
  //     //   });
  //     // });
  //     console.log(lorasPreview);
  //     set(loraPrevRef, lorasPreview);
  //   });
  // }, []);

  const loraHtml = loraItems.map((item, i) => {
    return <PreviewCard previewData={item} key={i} />;
  });

  return (
    <div className={classes["container"]}>
      <div className={classes["category"]}>{loraHtml}</div>
    </div>
  );
};

export default ModelsList;
