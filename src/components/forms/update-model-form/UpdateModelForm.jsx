import React, { useEffect, useState } from "react";
import classes from "./UpdateModelForm.module.scss";
import { ref, set, get } from "firebase/database";
import { db } from "../../../firebase-config";

const UpdateModelForm = ({ modelData }) => {
  const [updateInput, setUpdateInput] = useState(false);
  const [srcInput, setSrcInput] = useState("civitai.com");
  // const [subDataInput, setSubDataInput] = useState("");
  const [mainTagInput, setMainTagInput] = useState(modelData.mainTag);
  const [weightInput, setWeightInput] = useState(modelData.weight);
  const [sizetInput, setSizeInput] = useState(modelData.size);
  const [helperTagsInput, setHelperTagsInput] = useState(modelData.helperTags);
  const [negativeTagsInput, setNegativeTagsInput] = useState(
    modelData.negativeTags
  );

  const [subCatAmount, setSubCatAmount] = useState([
    { type: "text", id: 1, name: "sub", placeholder: "sub", value: "" },
  ]);
  const [examplePromtsAmount, setExamplePromtsAmount] = useState([
    {
      type: "text",
      id: 1,
      name: "example",
      placeholder: "example: post id",
      value: "",
    },
  ]);

  useEffect(() => {
    console.log(modelData);
    const subCats = modelData.sub.map((sub, i) => {
      return {
        type: "text",
        id: i,
        name: "sub",
        placeholder: "sub",
        value: sub,
      };
    });
    setSubCatAmount(subCats);
  }, [modelData]);

  const addGeneralTagsHandler = (e) => {
    e.preventDefault();

    const formdata = new FormData(e.target);
    const src = formdata.get("src").trim().toLowerCase();
    // const modelId = +formdata.get("id").trim().toLowerCase();
    // const main = formdata.get("main").trim().toLowerCase();
    const subData = formdata.getAll("sub").filter(Boolean);
    const sub = subData.map((el) => el.trim());
    const mainTag = formdata.get("main-tag").trim();
    const weight = formdata.get("weight").trim();
    const size = formdata.get("size").trim();

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
        let data = {};

        if (updateInput) {
          const response = await fetch(
            `https://civitai.com/api/v1/models/${modelData.id}`
          );

          data = await response.json();
          console.log(response);
          console.log(data);

          data.modelVersions.forEach((version) => {
            version.images.forEach((image) => {
              if (image.meta) {
                image.meta = clearObjectKeys(image.meta);
                if (image.meta.hashes)
                  image.meta.hashes = clearObjectKeys(image.meta.hashes);
              }
            });
          });
        } else {
          data = modelData.data;
        }

        if (!data.id) return;

        let examplesData = [];
        if (exemplePromts.length) {
          examplesData = await Promise.all(
            exemplePromts.map(async (example) => {
              const imgExampleResponse = await fetch(
                `https://civitai.com/api/v1/images?postId=${example}&modelId=${modelData.id}`
              );
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
        const previewImg = data.modelVersions[0].images.filter(
          (img) => img.type === "image"
        )[0].url;

        const modelExemplePromts = modelData.exemplePromts || [];
        const modelExamplesData = modelData.examplesData || [];
        const loraData = {
          id: modelData.id,
          src,
          main: modelData.main,
          sub: sub,
          mainTag,
          weight,
          size,
          helperTags,
          negativeTags,
          exemplePromts: [...exemplePromts, ...modelExemplePromts],
          data,
          examplesData: [...examplesData, ...modelExamplesData],
          updatedAt: new Date().toISOString(),
        };

        console.log(loraData);

        const loraPrevData = {
          id: modelData.id,
          src,
          main: modelData.main,
          sub: sub,
          title: data.name,
          imgUrl: previewImg,
          type: data.type,
          baseModel: data.modelVersions[0].baseModel,
          mainTag,
          weight,
          size,
          tags: data.modelVersions[0].trainedWords || "",
          helperTags,
          updatedAt: new Date().toISOString(),
        };

        const modelsRef = ref(db, "models/" + modelData.id);
        const modelsPrevRef = ref(db, "models preview/" + modelData.main);

        get(modelsPrevRef).then((snapshot) => {
          if (snapshot.exists()) {
            const curData = snapshot.val();
            const curPrevIndex = curData.findIndex(
              (prev) => prev.id === modelData.id
            );
            console.log(curPrevIndex);
            console.log(loraPrevData);
            curData[curPrevIndex] = loraPrevData;
            set(modelsPrevRef, [...curData]);
          } else {
            // set(modelsPrevRef, [loraPrevData]);
          }
        });
        set(modelsRef, loraData);
      } catch (err) {
        console.log(err);
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
        defaultValue={sub.value}
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

  //   const srcHandler = (e) => {
  //     setSrcInput(e.target.value);
  //   };

  return (
    <form onSubmit={addGeneralTagsHandler} className={classes["form"]}>
      <label htmlFor="update">
        <input
          id="update"
          type="checkbox"
          value={updateInput}
          onChange={(e) => {
            setUpdateInput(e.target.checked);
          }}
        />
        update
      </label>
      <input
        name="src"
        type="text"
        placeholder="src"
        // value="civitai.com"
        value={srcInput}
        onChange={(e) => {
          setSrcInput(e.target.value);
        }}
        // readOnly
      />
      {/* <input name="id" type="number" placeholder="id" />
      <input name="main" type="text" placeholder="main" /> */}
      {subCatHtml}
      <button type="button" id="sub" onClick={addSubHandler}>
        Add sub
      </button>
      <input
        name="main-tag"
        type="text"
        placeholder="main-tag"
        value={mainTagInput}
        onChange={(e) => {
          setMainTagInput(e.target.value);
        }}
      />
      <input
        name="weight"
        type="text"
        placeholder="weight"
        value={weightInput}
        onChange={(e) => {
          setWeightInput(e.target.value);
        }}
      />
      <input
        name="size"
        type="text"
        placeholder="size"
        value={sizetInput}
        onChange={(e) => {
          setSizeInput(e.target.value);
        }}
      />
      <textarea
        name="helper-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="helper tags"
        value={helperTagsInput}
        onChange={(e) => {
          setHelperTagsInput(e.target.value);
        }}
      ></textarea>
      <textarea
        name="negative-tags"
        id=""
        cols="30"
        rows="10"
        placeholder="negative tags"
        value={negativeTagsInput}
        onChange={(e) => {
          setNegativeTagsInput(e.target.value);
        }}
      ></textarea>
      {exemplePromtsHtml}
      <button type="button" id="example" onClick={addSubHandler}>
        Add example
      </button>
      <button type="submit">Add</button>
    </form>
  );
};

export default UpdateModelForm;
