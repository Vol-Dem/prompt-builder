import React, { useRef, useState } from "react";
import classes from "./LoraForm.module.scss";
import { push, ref, set, get } from "firebase/database";
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
    // const title = formdata.get("title").trim();
    // const type = formdata.get("type").trim();
    // const baseModel = formdata.get("base-model").trim();
    const mainTag = formdata.get("main-tag").trim();
    const weight = formdata.get("weight").trim();
    const size = formdata.get("size").trim();
    // const clipSkip = formdata.get("clip-skip").trim();
    // const version = formdata.get("version").trim();
    // const description = formdata.get("description").trim();
    // const tags = formdata
    //   .get("tags")
    //   .trim()
    //   .split(",")
    //   .filter(Boolean)
    //   .map((tag) => tag.trim());

    const helperTags = formdata
      .get("helper-tags")
      .trim()
      .split(",")
      .filter(Boolean)
      .map((tag) => tag.trim());
    const negativeTags = formdata
      .get("negative-tags")
      .trim()
      .split(",")
      .filter(Boolean)
      .map((tag) => tag.trim());
    const exemplePromts = formdata.getAll("example").filter(Boolean);
    // const exemplePromts = formdata.getAll("example").map((example) => {
    //   const indexNegative = example.indexOf("Negative prompt:");
    //   const stepsIndex = example.indexOf("Steps:");
    //   const positiveTags = example.slice(0, indexNegative);
    //   const negativeTags = example
    //     .slice(indexNegative, stepsIndex)
    //     .replace("Negative prompt: ", "")
    //     .trim();
    //   // const ex = example.slice(indexNegative).map((el) => el.trim());
    //   let config = {};

    //   example
    //     .slice(stepsIndex)
    //     .split(",")
    //     .forEach((el) => {
    //       const elArr = el.split(":");
    //       config[elArr[0]?.trim().replace(/[^\w\s]/gi, "")] = elArr[1]?.trim();
    //     });
    //   console.log(config);

    //   return {
    //     positive: positiveTags,
    //     negative: negativeTags,
    //     config,
    //     example,
    //   };
    // });

    // .filter(Boolean)

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
        console.log(response);
        console.log(data);

        let examplesData = [];
        if (exemplePromts.length) {
          examplesData = await Promise.all(
            exemplePromts.map(async (example) => {
              const imgExampleResponse = await fetch(
                `https://civitai.com/api/v1/images?postId=${example}&modelId=${modelId}`
              );
              // console.log(imgExampleResponse);
              return await imgExampleResponse.json();
            })
          );
          console.log(examplesData);
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

        console.log(examplesData);
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
          // title,
          // type,
          // baseModel,
          mainTag,
          weight,
          size,
          // clipSkip,
          // version,
          // description,
          // tags,
          helperTags,
          negativeTags,
          exemplePromts,
          data,
          examplesData,
          updatedAt: new Date().toISOString(),
        };

        console.log(loraData);

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
            // curData[main] = tags;
            set(modelsPrevRef, [...curData, loraPrevData]);
          } else {
            set(modelsPrevRef, [loraPrevData]);
          }
        });
        set(modelsRef, loraData);
        // push(modelsRef, loraData);
      } catch (err) {
        console.log(err);
      }
    };

    getModelData();

    // console.log(exemplePromts);

    // e.target.reset();
    // setSubCatAmount([{ type: "text", id: 1, name: "sub", placeholder: "sub" }]);
    // setExamplePromtsAmount([
    //   {
    //     id: 1,
    //     name: "example",
    //     placeholder: "example",
    //     cols: "30",
    //     rows: "10",
    //   },
    // ]);
  };

  const addSubHandler = (e) => {
    // console.log(e.target.id);
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

  // for (let i = 0; i < examplePromtsAmount; i++) {
  //   exemplePromtsHtml.push(
  //     <textarea
  //       key={i}
  //       name="example"
  //       id=""
  //       cols="30"
  //       rows="10"
  //       placeholder="example"
  //     ></textarea>
  //   );
  // }

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
      {/* <input name="title" type="text" placeholder="title" />
      <input name="type" type="text" placeholder="type" />
      <input
        name="base-model"
        type="text"
        placeholder="base-model"
        value="SD 1.5"
        readOnly
      /> */}
      <input name="main-tag" type="text" placeholder="main-tag" />
      <input name="weight" type="text" placeholder="weight" />
      <input name="size" type="text" placeholder="size" />
      {/* <input name="clip-skip" type="text" placeholder="clip skip" /> */}
      {/* <input name="version" type="text" placeholder="version" /> */}
      {/* <textarea
        name="description"
        id=""
        cols="30"
        rows="10"
        placeholder="description"
      ></textarea>
      <textarea
        name="tags"
        id=""
        cols="30"
        rows="10"
        placeholder="tags"
      ></textarea> */}
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
