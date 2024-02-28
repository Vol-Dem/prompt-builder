import React from "react";
import classes from "./GeneralForm.module.scss";
import { ref, set, get } from "firebase/database";
import { db } from "../../../firebase-config";

const GeneralForm = () => {
  const addGeneralTagsHandler = (e) => {
    e.preventDefault();

    const formdata = new FormData(e.target);
    const main = formdata.get("main").trim();
    const sub = formdata.get("sub").trim();
    const tags = formdata
      .get("tags")
      .trim()
      .split(",")
      .filter(Boolean)
      .map((tag) => tag.trim());

    const generalRef = ref(db, "general/" + main);

    get(generalRef).then((snapshot) => {
      if (snapshot.exists()) {
        const curData = snapshot.val();
        curData[sub] = tags;
        set(generalRef, curData);
      } else {
        set(generalRef, {
          [sub]: tags,
        });
      }
    });

    e.target.reset();
  };
  return (
    <form onSubmit={addGeneralTagsHandler} className={classes["form"]}>
      <input name="main" type="text" placeholder="main" />
      <input name="sub" type="text" placeholder="sub" />
      <textarea name="tags" id="" cols="30" rows="10"></textarea>
      <button type="submit">Add</button>
    </form>
  );
};

export default GeneralForm;
