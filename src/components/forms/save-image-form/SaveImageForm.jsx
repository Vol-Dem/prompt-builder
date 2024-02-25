import React, { useEffect, useState } from "react";
import classes from "./SaveImageForm.module.scss";
import { ref, set, get } from "firebase/database";
import { db } from "../../../firebase-config";
import {
  addResourcesInfo,
  getImagesInfo,
  getModelInfo,
} from "../../../utils/fetchUtils";
import firebaseApp from "../../../firebase-config";
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";

const firestore = getFirestore(firebaseApp);

const SaveImageForm = ({ modelData }) => {
  const [filterDisabledInput, setFilterDisabledInput] = useState(false);
  const [imageIsSaving, setImageIsSaving] = useState(false);
  const [errorMessage, seteErrorMessage] = useState("");
  const [successMessage, seteSuccessMessage] = useState("");
  const [postIdInput, setPostIdInput] = useState("");
  const [examplePromtsAmount, setExamplePromtsAmount] = useState([
    [
      {
        type: "text",
        id: "exmpl-image-id",
        name: "image-id",
        placeholder: "image id",
        value: "",
      },
    ],
  ]);

  const uid = useSelector((state) => state.auth.user.uid);

  const addGeneralTagsHandler = (e) => {
    e.preventDefault();
    setImageIsSaving(true);
    seteErrorMessage("");
    seteSuccessMessage("");
    const formdata = new FormData(e.target);
    const curVersionId = +formdata
      .get("curVersionId")
      .trim()
      .toLowerCase()
      .trim();
    const postId = +formdata.get("post-id").trim().toLowerCase().trim();
    const exemplePromtsImageId = formdata.getAll("image-id").filter(Boolean);

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
        if (!postId) {
          throw new Error("Empty post id");
        }

        if (
          modelData?.savedImages?.hasOwnProperty(`${curVersionId}`) &&
          modelData?.savedImages[`${curVersionId}`].some(
            (post) => post.postId === postId
          )
        ) {
          throw new Error("Exists");
        }

        const imgExampleResponse = await fetch(
          `https://civitai.com/api/v1/images?postId=${postId}${
            !filterDisabledInput ? `&modelId=${modelData?.id}` : ""
          }`
        );
        const data = await imgExampleResponse.json();
        console.log(data);
        if (!data.items.length) {
          throw new Error("0 items");
        }
        data.items.forEach((image) => {
          if (image.meta) {
            image.meta = clearObjectKeys(image.meta);
            if (image.meta.hashes)
              image.meta.hashes = clearObjectKeys(image.meta.hashes);
          }
        });

        let dataFiltered = data;

        if (exemplePromtsImageId.length) {
          const images = data.items.filter((image) => {
            return exemplePromtsImageId.some((img) => +img === image.id);
          });

          dataFiltered = { items: images };
        }
        const examplesDataWithRes = await getImagesInfo(dataFiltered.items);

        examplesDataWithRes.curVersionId = curVersionId;

        console.log(examplesDataWithRes);

        const modelRef = doc(
          firestore,
          "users",
          uid,
          "models",
          modelData.id + ""
        );
        const modelImagesRef = doc(
          firestore,
          "users",
          uid,
          "models",
          modelData.id + "",
          "images",
          postId + ""
        );

        // const modelSnap = await getDoc(modelRef);
        // const modelImagesSnap = await getDoc(modelImagesRef);

        //Throw error if user try to add existing model using new model form

        // await updateDoc(modelRef, {
        //   savedImages: arrayUnion({
        //     postId: +postId,
        //     amount: dataFiltered.items.length,
        //   }),
        // });
        // await setDoc(
        //   modelImagesRef,
        //   {
        //     [`${postId}`]: examplesDataWithRes,
        //   },
        //   { merge: true }
        // );

        const newImgData = {
          postId: +postId,
          amount: dataFiltered.items.length,
        };

        let newSavedImages;
        if (modelData?.savedImages?.hasOwnProperty(`${curVersionId}`)) {
          newSavedImages = [
            ...modelData?.savedImages[`${curVersionId}`],
            newImgData,
          ];
        } else {
          newSavedImages = [newImgData];
        }

        await setDoc(
          modelImagesRef,
          {
            items: examplesDataWithRes,
            versionId: curVersionId,
            createdAt: examplesDataWithRes[0].createdAt,
            savedAt: new Date().toISOString(),
            nsfw: examplesDataWithRes[0].nsfw,
            nsfwLevel: examplesDataWithRes[0]?.nsfwLevel || "",
          },
          { merge: true }
        );

        await setDoc(
          modelRef,
          {
            savedImages: {
              [`${curVersionId}`]: newSavedImages,
            },
          },
          { merge: true }
        );

        // const modelsRef = ref(db, "models/" + modelData.id);

        // get(modelsRef).then((snapshot) => {
        //   if (snapshot.exists()) {
        //     const curData = snapshot.val();
        //     console.log(curVersionId);
        //     if (curData?.savedImages?.hasOwnProperty(`${curVersionId}`)) {
        //       curData.savedImages[`${curVersionId}`].unshift({
        //         postId: +postId,
        //         amount: dataFiltered.items.length,
        //       });
        //     } else {
        //       curData.savedImages = {
        //         ...curData?.savedImages,
        //         [`${curVersionId}`]: [
        //           { postId: +postId, amount: dataFiltered.items.length },
        //         ],
        //       };
        //     }

        //     set(modelsRef, curData);
        //   } else {
        //   }
        // });

        // const savedImagesRef = ref(db, `savedImages/` + modelData.id);

        // get(savedImagesRef).then((snapshot) => {
        //   if (snapshot.exists()) {
        //     const curData = snapshot.val();

        //     const exapleIndex = curData[curVersionId]
        //       ?.filter(Boolean)
        //       .findIndex(
        //         (example) =>
        //           example.items[0].postId ===
        //           examplesDataWithRes.items[0].postId
        //       );

        //     if (exapleIndex && exapleIndex !== -1) {
        //       const newExamples = examplesDataWithRes.items.filter((item) => {
        //         const isExists = curData[curVersionId]
        //           .filter(Boolean)
        //           .find((example) => example.items[0].id === item.id);
        //         return !isExists;
        //       });
        //       curData[curVersionId][exapleIndex].items = [
        //         ...newExamples,
        //         ...curData[curVersionId][exapleIndex].items,
        //       ];
        //       // curData.examplesData[exapleIndex].curVersionId = curVersionId
        //     } else {
        //       curData[curVersionId] = curData[curVersionId]
        //         ? [examplesDataWithRes, ...curData[curVersionId]]
        //         : [examplesDataWithRes];
        //     }
        //     console.log(curData);
        //     set(savedImagesRef, curData);
        //   } else {
        //     const images = { [curVersionId]: [examplesDataWithRes] };
        //     set(savedImagesRef, images);
        //   }
        // });
        setImageIsSaving(false);
        seteSuccessMessage("Saved");
      } catch (err) {
        setImageIsSaving(false);
        seteErrorMessage(err.message);
        console.log(err.message);
      }
    };

    getModelData();
  };

  const addExampleInputHandler = () => {
    const newFields = [...examplePromtsAmount];
    newFields.push([
      {
        id: `${Date.now() + "imid"}`,
        name: "image-id",
        placeholder: "image id",
        cols: "30",
        rows: "10",
      },
    ]);

    setExamplePromtsAmount(newFields);
  };

  let exemplePromtsHtml = examplePromtsAmount.map((example) => {
    return (
      <div className={classes["example-field"]} key={example[0].id}>
        <input
          name={example[0].name}
          type={example[0].type}
          placeholder={example[0].placeholder}
        ></input>
      </div>
    );
  });

  let versionSelectOptionHtml = modelData?.data?.modelVersions?.map(
    (version, i) => {
      return (
        <option value={version.id} key={i}>
          {version.name}
        </option>
      );
    }
  );

  //   const srcHandler = (e) => {
  //     setSrcInput(e.target.value);
  //   };

  return (
    <form onSubmit={addGeneralTagsHandler} className={classes["form"]}>
      <label htmlFor="version-select">Select version:</label>
      <select name="curVersionId" id="version-select">
        {versionSelectOptionHtml}
      </select>
      <input
        name="post-id"
        type="text"
        placeholder="post id"
        value={postIdInput}
        onChange={(e) => {
          setPostIdInput(e.target.value);
        }}
      />
      {exemplePromtsHtml}

      <button type="button" id="example" onClick={addExampleInputHandler}>
        Add example
      </button>
      <div className={classes.filter}>
        <input
          id="filter"
          type="checkbox"
          onChange={(e) => {
            setFilterDisabledInput(e.target.checked);
          }}
        />
        <label htmlFor="filter">disable filter</label>
      </div>
      <button type="submit" disabled={imageIsSaving}>
        Add
      </button>
      {successMessage && <div>{successMessage}</div>}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default SaveImageForm;
