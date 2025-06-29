import { useState } from "react";
import classes from "./LoraForm.module.scss";
import { ref, set, get } from "firebase/database";
import { db } from "../../../firebase-config";

const LoraForm = () => {
  const [subCatAmount, setSubCatAmount] = useState([
    { type: "text", id: 1, name: "sub", placeholder: "sub" },
  ]);
  const [examplePromtsAmount, setExamplePromtsAmount] = useState([
    { type: "text", id: 1, name: "example", placeholder: "example: post id" },
  ]);

  const addGeneralTagsHandler = (e) => {
    e.preventDefault();

    const formdata = new FormData(e.target);
    const src = formdata.get("src").trim().toLowerCase();
    const modelId = +formdata.get("id").trim().toLowerCase();
    const main = formdata.get("main").trim().toLowerCase();
    const subData = formdata.getAll("sub").filter(Boolean);
    const sub = subData.map((el) => el.trim());
    const mainTag = formdata.get("main-tag").trim();
    const weight = formdata.get("weight").trim();
    const size = formdata.get("size").trim();

    const splitRegEx = /,(?![^()]*\)|[^[\]]*\]|[^{}]*\}|[^<>]*>)/;
    const helperTags = formdata
      .get("helper-tags")
      .trim()
      .split(splitRegEx)
      .filter(Boolean)
      .map((tag) => tag.trim());
    const negativeTags = formdata
      .get("negative-tags")
      .trim()
      .split(splitRegEx)
      .filter(Boolean)
      .map((tag) => tag.trim());
    const exemplePromts = formdata.getAll("example").filter(Boolean);

    const clearObjectKeys = (obj) => {
      const convertedMetaArr = Object.entries(obj).map((entry, i) => {
        const newKey = entry[0]
          ? entry[0].replace(/[^\w\s]/gi, " ")
          : `key${i}`;
        return [newKey, entry[1]];
      });
      return Object.fromEntries(convertedMetaArr);
    };

    const getModelData = async () => {
      try {
        const response = await fetch(
          `https://civitai.com/api/v1/models/${modelId}`
        );

        const data = await response.json();

        let examplesData = [];
        if (exemplePromts.length) {
          examplesData = await Promise.all(
            exemplePromts.map(async (example) => {
              const imgExampleResponse = await fetch(
                `https://civitai.com/api/v1/images?postId=${example}&modelId=${modelId}`
              );

              return await imgExampleResponse.json();
            })
          );

          examplesData.forEach((post) => {
            post.items.forEach((image) => {
              if (image.meta) {
                image.meta = clearObjectKeys(image.meta);
                if (image.meta.hashes)
                  image.meta.hashes = clearObjectKeys(image.meta.hashes);
              }
            });
          });
        }

        data.modelVersions.forEach((version) => {
          version.images.forEach((image) => {
            if (image.meta) {
              image.meta = clearObjectKeys(image.meta);
              if (image.meta.hashes)
                image.meta.hashes = clearObjectKeys(image.meta.hashes);
            }
          });
        });

        const previewImg = data.modelVersions[0].images.filter(
          (img) => img.type === "image"
        )[0].url;

        const loraData = {
          id: modelId,
          src,
          main,
          sub,
          mainTag,
          weight,
          size,
          helperTags,
          negativeTags,
          exemplePromts,
          data,
          examplesData,
          updatedAt: new Date().toISOString(),
        };

        const loraPrevData = {
          id: modelId,
          src,
          main,
          sub,
          title: data.name,
          imgUrl: previewImg,
          type: data.type,
          baseModel: data.modelVersions[0].baseModel,
          mainTag,
          weight,
          size,
          tags: data.modelVersions[0].trainedWords,
          helperTags,
          updatedAt: new Date().toISOString(),
        };

        const modelsRef = ref(db, "models/" + modelId);
        const modelsPrevRef = ref(db, "models preview/" + main);

        get(modelsPrevRef).then((snapshot) => {
          if (snapshot.exists()) {
            const curData = snapshot.val();
            set(modelsPrevRef, [...curData, loraPrevData]);
          } else {
            set(modelsPrevRef, [loraPrevData]);
          }
        });
        set(modelsRef, loraData);
      } catch (err) {
        console.log(err.message);
      }
    };

    getModelData();
  };

  const addSubHandler = (e) => {
    const elId = e.target.id;
    if (elId === "sub") {
      const newFields = [...subCatAmount];
      newFields.push({
        type: "text",
        id: Date.now(),
        name: "sub",
        placeholder: "sub",
      });
      setSubCatAmount(newFields);
    }
    if (elId === "example") {
      const newFields = [...examplePromtsAmount];
      newFields.push({
        id: Date.now(),
        name: "example",
        placeholder: "example",
        cols: "30",
        rows: "10",
      });

      setExamplePromtsAmount(newFields);
    }
  };

  const subCatHtml = subCatAmount.map((sub) => {
    return (
      <input
        key={sub.id}
        name={sub.name}
        type={sub.type}
        placeholder={sub.placeholder}
      />
    );
  });

  let exemplePromtsHtml = examplePromtsAmount.map((example) => {
    return (
      <input
        key={example.id}
        name={example.name}
        type={example.type}
        placeholder={example.placeholder}
      ></input>
    );
  });

  return (
    <form onSubmit={addGeneralTagsHandler} className={classes["form"]}>
      <input
        name="src"
        type="text"
        placeholder="src"
        value="civitai.com"
        readOnly
      />
      <input name="id" type="number" placeholder="id" />
      <input name="main" type="text" placeholder="main" />
      {subCatHtml}
      <button type="button" id="sub" onClick={addSubHandler}>
        Add sub
      </button>
      <input name="main-tag" type="text" placeholder="main-tag" />
      <input name="weight" type="text" placeholder="weight" />
      <input name="size" type="text" placeholder="size" />
      <textarea
        name="helper-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="helper tags"
      ></textarea>
      <textarea
        name="negative-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="negative tags"
      ></textarea>
      {exemplePromtsHtml}
      <button type="button" id="example" onClick={addSubHandler}>
        Add example
      </button>
      <button type="submit">Add</button>
    </form>
  );
};

export default LoraForm;
