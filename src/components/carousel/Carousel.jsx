import React, { useCallback, useState } from "react";
import classes from "./Carousel.module.scss";
import ImageCard from "../image-card/ImageCard";
import { useRef } from "react";
import { useEffect } from "react";
import CarouselImage from "./carousel-image/CarouselImage";
import useIntersection from "../../hooks/use-intersection";
import { db } from "../../firebase-config";
import { get, onValue, ref, set } from "firebase/database";
import { clearObjectKeys } from "../../utils/generalUtils";
import {
  getModelInfo,
  addResourcesInfo,
  getImagesInfo,
  makeBatchRequest,
} from "../../utils/fetchUtils";
import firebaseApp from "../../firebase-config";
import {
  arrayUnion,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";

const firestore = getFirestore(firebaseApp);

const Carousel = ({
  images,
  visibleImgAmount,
  postId,
  onSave,
  onUpdate,
  modelId,
  versionId,
}) => {
  // const [currImg, setCurrImg] = useState(null);
  const [visibleAmount, setVisibleAmount] = useState(visibleImgAmount);
  const [imgIsOpen, setImgIsOpen] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [currImgNum, setCurrImgNum] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [curTransitionDur, setCurTransitionDur] = useState("0ms");
  const [imagesHtml, setImagesHtml] = useState([]);
  const [transitionEnd, setTransitionEnd] = useState(true);
  const [carouselHeight, setCarouselHeight] = useState(null);
  const [visibleImages, setVisibleImages] = useState([]);
  const [prevVisibleImages, setPrevVisibleImages] = useState([]);
  const [curVisibleAmount, setCurVisibleAmount] = useState(visibleImgAmount);
  const carouselRef = useRef();
  const imagesRef = useRef();
  const wrapRef = useRef();
  const transitionDuration = 300;
  const caruselIsVisible = useIntersection(carouselRef);
  const uid = useSelector((state) => state.auth.user.uid);
  const model = useSelector((state) => state.model.model);

  useEffect(() => {
    const gap = parseInt(getComputedStyle(imagesRef.current).gap);
    const imgWidth = imagesRef.current.children[0].clientWidth + gap;
    const visAmount = Math.floor(wrapRef.current.clientWidth / imgWidth);
    console.log(visAmount);
    if (!visibleImgAmount && visAmount <= images?.length) {
      setVisibleAmount(visAmount);
      setCurVisibleAmount(visAmount);
    }
    if (!visibleImgAmount && visAmount > images?.length) {
      setVisibleAmount(images?.length);
      setCurVisibleAmount(images?.length);
    }
  }, [imagesRef, wrapRef, visibleImgAmount, images]);

  useEffect(() => {
    const visibleImg = Array.from(
      { length: visibleAmount },
      (_, i) => visibleAmount + i
    );

    setVisibleImages(visibleImg);
    setCurTransitionDur("0ms");
  }, [visibleAmount, images]);

  const openImgHandler = useCallback(
    (e) => {
      // setCurTransitionDur("0ms");
      console.log(e.target.dataset.position);
      setImgIsOpen((prevState) => !prevState);
      const imgNum = e.target.dataset.position - visibleAmount;
      setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
      setCurVisibleAmount(1);
      setPrevVisibleImages(visibleImages);
      setVisibleImages([+e.target.dataset.position]);
    },
    [visibleAmount, visibleImages, images]
  );

  const closeImgHandler = () => {
    setImgIsOpen(false);
    setCurVisibleAmount(visibleAmount);
    if (prevVisibleImages?.length === visibleAmount) {
      setVisibleImages(prevVisibleImages);
    } else {
      const visibleImg = Array.from(
        { length: visibleAmount },
        (_, i) => visibleImages[0] + i
      );
      setVisibleImages(visibleImg);
    }
  };

  useEffect(() => {
    if (!images?.length || !visibleImages?.length) return;

    const imagesFiltered = images.filter((image) => true);
    const imagesHtml = imagesFiltered.map((image, i) => {
      const src =
        (visibleImages.includes(i + visibleAmount) ||
          visibleImages.includes(i - images?.length + visibleAmount)) &&
        caruselIsVisible
          ? image.url
          : "";

      return (
        <CarouselImage
          key={image.hash + i}
          onClick={openImgHandler}
          id={image.hash}
          dataset={i + visibleAmount}
          src={src}
          alt="example image"
        />
      );
    });

    let imagesleft = [];
    let imagesRight = [];

    if (imagesFiltered.length >= +visibleAmount) {
      imagesRight = imagesFiltered.slice(0, visibleAmount).map((image, i) => {
        const src =
          visibleImages.includes(i + visibleAmount) && caruselIsVisible
            ? image.url
            : "";
        return (
          <CarouselImage
            key={image.hash + "r"}
            onClick={openImgHandler}
            id={image.hash}
            dataset={i + visibleAmount}
            src={src}
            alt="example image"
          />
        );
      });
      imagesleft = imagesFiltered.slice(-visibleAmount).map((image, i) => {
        const src =
          (visibleImages.includes(i) ||
            visibleImages.includes(i + images?.length)) &&
          caruselIsVisible
            ? image.url
            : "";
        return (
          <CarouselImage
            key={image.hash + "l"}
            onClick={openImgHandler}
            id={image.hash}
            dataset={i}
            src={src}
            alt="example image"
          />
        );
      });
    }
    setImagesHtml([...imagesleft, ...imagesHtml, ...imagesRight]);
  }, [visibleAmount, images, visibleImages, openImgHandler, caruselIsVisible]);

  useEffect(() => {
    if (!images) return;
    const imgSize = images?.reduce(
      (acc, cur) => {
        return cur.height > acc[0] ? [cur.height, cur.width] : acc;
      },
      [0, 0]
    );
    const imgWidth = imagesRef.current.children[0].clientWidth;
    const carHight = Math.floor((imgWidth / imgSize[1]) * imgSize[0]);

    setCarouselHeight(carHight < 300 ? 300 : carHight);
  }, [images, imagesRef]);

  useEffect(() => {
    if (images?.length > curVisibleAmount) {
      const gap = parseInt(getComputedStyle(imagesRef.current).gap);
      const imgWidth = imagesRef.current.children[0].clientWidth + gap;
      // console.log(-imgWidth, visibleImages[0], -imgWidth * visibleImages[0]);
      setTranslate(-imgWidth * visibleImages[0]);
    }
  }, [imagesRef, curVisibleAmount, visibleImages, images]);

  useEffect(() => {
    if (images?.length <= curVisibleAmount) return;
    setTransitionEnd(true);
    const transitionEnd = () => {
      setTransitionEnd(true);
      if (!imagesRef?.current) return;
      const gap = parseInt(getComputedStyle(imagesRef.current).gap);
      const imgWidth = imagesRef.current.children[0].clientWidth + gap;

      if (visibleImages[0] === 0) {
        setCurTransitionDur("0ms");
        setVisibleImages((prevState) =>
          prevState.map((el, i) => images?.length + i)
        );
        setPrevVisibleImages((prevState) =>
          prevState.map((el, i) => images?.length + i)
        );
        setTranslate(-imgWidth * images?.length);
      }
      if (visibleImages[0] === images?.length + curVisibleAmount) {
        setCurTransitionDur("0ms");
        setVisibleImages((prevState) =>
          prevState.map((el, i) => curVisibleAmount + i)
        );
        // setPrevVisibleImages((prevState) =>
        //   prevState.map((el, i) => curVisibleAmount + i)
        // );
        setTranslate(-imgWidth * curVisibleAmount);
      }
      if (visibleImages[0] > images?.length + curVisibleAmount) {
        setCurTransitionDur("0ms");
        setVisibleImages((prevState) =>
          prevState.map((el, i) => visibleImages[0] - images?.length)
        );
        // setPrevVisibleImages((prevState) =>
        //   prevState.map((el, i) => curVisibleAmount + i)
        // );
        // setTranslate(-imgWidth * curVisibleAmount);
      }
    };

    const transitionStart = () => {
      setTransitionEnd(false);
    };

    document.addEventListener("transitionstart", transitionStart);
    document.addEventListener("transitionend", transitionEnd);
    return () => {
      document.removeEventListener("transitionstart", transitionStart);
      document.removeEventListener("transitionend", transitionEnd);
    };
  }, [translate, curVisibleAmount, visibleImages, images]);

  const slideNextHandler = () => {
    if (!transitionEnd) return;
    setCurTransitionDur(`${transitionDuration}ms`);
    const curImg = visibleImages[0] + 1;
    setVisibleImages((prevState) => prevState.map((el) => el + 1));
    const gap = parseInt(getComputedStyle(imagesRef.current).gap);
    const imgWidth = imagesRef.current.children[0].clientWidth + gap;
    setTranslate(-imgWidth * curImg);
    setPrevVisibleImages(visibleImages.map((el) => el + 1));
    // if(curImg) setCurrImg()
    let imgNum = visibleImages[0] + 1 - visibleAmount;
    if (imgNum > images?.length - 1) imgNum = 0;
    setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
  };

  const slidePrevHandler = () => {
    if (!transitionEnd) return;
    setCurTransitionDur(`${transitionDuration}ms`);
    const curImg = visibleImages[0] - 1;
    setVisibleImages((prevState) => prevState.map((el) => el - 1));
    const gap = parseInt(getComputedStyle(imagesRef.current).gap);
    const imgWidth = imagesRef.current.children[0].clientWidth + gap;
    setTranslate(-imgWidth * curImg);
    setPrevVisibleImages(visibleImages.map((el) => el - 1));
    const imgNum = visibleImages[0] - 1 - visibleAmount;
    setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
  };

  // const goToSlide = () => {};

  const paginationHtml = images?.map((_, i) => {
    const isActive =
      visibleImages.includes(visibleAmount + i) ||
      visibleImages.includes(i - images?.length + visibleAmount) ||
      visibleImages.includes(i + images?.length + visibleAmount);
    return (
      <li
        key={i}
        className={`${classes["pagination__item"]} ${
          isActive ? classes["pagination__item--active"] : ""
        }`}
        onClick={() => {
          setCurTransitionDur(`${transitionDuration}ms`);
          setCurrImgNum(i);
          setVisibleImages((prevState) => {
            const newVisibleImages = prevState.map(
              (el, j) => i + j + visibleAmount
            );
            setPrevVisibleImages(newVisibleImages);
            return newVisibleImages;
          });
        }}
      ></li>
      // <li
      //   className={`${classes["pagination__item"]} ${
      //     currImgNum === i ? classes["pagination__item--active"] : ""
      //   }`}
      // ></li>
    );
  });

  const saveExampleHandler = async () => {
    try {
      if (savingImages) return;
      setSavingImages(true);
      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}&modelVersionId=${versionId}`
      );
      const data = await imgExampleResponse.json();
      console.log(data);
      if (!data.items.length) {
        throw new Error("0 items");
      }
      data.items.forEach((image) => {
        if (image.meta) {
          image.meta.comfy = "";
          image.meta = clearObjectKeys(image.meta);
          if (image.meta.hashes)
            image.meta.hashes = clearObjectKeys(image.meta.hashes);
        }
      });

      // console.log(data);
      // setSavingImages(false);
      // return;

      // const examplesDataWithRes = await Promise.all(
      //   data.items.map(async (item) => {
      //     const updatedImgData = { ...item };

      //     const newMeta = await getModelInfo(item.meta);
      //     if (newMeta) updatedImgData.meta = newMeta;

      //     if (item.meta?.resources) {
      //       const updatedRes = await addResourcesInfo(item.meta.resources);
      //       console.log(updatedRes);
      //       if (!updatedRes) {
      //         throw new Error("failed to update res");
      //       }
      //       updatedImgData.meta.resources = updatedRes;
      //     }
      //     if (item.meta?.civitaiResources) {
      //       const updatedCivRes = await addResourcesInfo(
      //         item.meta.civitaiResources
      //       );
      //       console.log(updatedCivRes);
      //       if (!updatedCivRes) {
      //         throw new Error("failed to update res");
      //       }
      //       updatedImgData.meta.civitaiResources = updatedCivRes;
      //     }

      //     return await updatedImgData;
      //   })
      // );
      const examplesDataWithRes = await makeBatchRequest(data.items);
      // const examplesDataWithRes = await getImagesInfo(data.items);
      // return;
      console.log(examplesDataWithRes);
      console.log(data);
      examplesDataWithRes.versionId = versionId;

      const modelRef = doc(firestore, "users", uid, "models", modelId + "");
      const modelImagesRef = doc(
        firestore,
        "users",
        uid,
        "models",
        modelId + "",
        "images",
        postId + ""
      );

      const newImgData = { postId: +postId, amount: data.items.length };
      let newSavedImages;
      if (model?.savedImages?.hasOwnProperty(`${versionId}`)) {
        newSavedImages = [...model?.savedImages[`${versionId}`], newImgData];
      } else {
        newSavedImages = [newImgData];
      }

      await setDoc(
        modelImagesRef,
        {
          items: examplesDataWithRes,
          versionId,
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
            [`${versionId}`]: newSavedImages,
          },
        },
        { merge: true }
      );

      // const savedImagesRef = ref(db, `savedImages/` + modelId);
      // const modelsRef = ref(db, "models/" + modelId);

      // get(savedImagesRef).then((snapshot) => {
      //   if (snapshot.exists()) {
      //     const curData = snapshot.val();

      //     const exapleIndex = curData[versionId]
      //       ?.filter(Boolean)
      //       .findIndex(
      //         (example) =>
      //           example.items[0].postId === examplesDataWithRes.items[0].postId
      //       );

      //     if (exapleIndex && exapleIndex !== -1) {
      //       const newExamples = examplesDataWithRes.items.filter((item) => {
      //         const isExists = curData[versionId]
      //           .filter(Boolean)
      //           .find((example) => example.items[0].id === item.id);
      //         return !isExists;
      //       });
      //       curData[versionId][exapleIndex].items = [
      //         ...newExamples,
      //         ...curData[versionId][exapleIndex].items,
      //       ];
      //       // curData.examplesData[exapleIndex].versionId = versionId
      //     } else {
      //       curData[versionId] = curData[versionId]
      //         ? [examplesDataWithRes, ...curData[versionId]]
      //         : [examplesDataWithRes];
      //     }
      //     console.log(curData);
      //     set(savedImagesRef, curData);
      //   } else {
      //     const images = { [versionId]: [examplesDataWithRes] };
      //     set(savedImagesRef, images);
      //   }
      // });

      // get(modelsRef).then((snapshot) => {
      //   if (snapshot.exists()) {
      //     const curData = snapshot.val();
      //     console.log(versionId);
      //     if (curData?.savedImages?.hasOwnProperty(`${versionId}`)) {
      //       curData.savedImages[`${versionId}`].unshift({
      //         postId: +postId,
      //         amount: data.items.length,
      //       });
      //     } else {
      //       curData.savedImages = {
      //         ...curData?.savedImages,
      //         [`${versionId}`]: [
      //           { postId: +postId, amount: data.items.length },
      //         ],
      //       };
      //     }

      //     set(modelsRef, curData);
      //   } else {
      //   }
      // });
      setSavingImages(false);
    } catch (err) {
      setSavingImages(false);
      console.log(err.message);
    }
    // onSave(postId);
  };
  const updateExampleHandler = () => {
    onUpdate(images[0].postId);
  };

  return (
    <div
      className={classes.container}
      style={carouselHeight ? { height: `${carouselHeight}px` } : {}}
    >
      <div
        ref={wrapRef}
        className={`${classes.wrap} ${imgIsOpen ? classes["wrap--open"] : ""}`}
      >
        <div
          className={`${classes.carousel} ${
            classes[`carousel__visible--${curVisibleAmount}`]
          } `}
          ref={carouselRef}
          style={carouselHeight ? { height: `${carouselHeight}px` } : {}}
        >
          <div
            className={`${classes["carousel__images"]} `}
            style={{
              transform: `translate3D(${translate}px, 0, 0)`,
              transitionDuration: curTransitionDur,
            }}
            ref={imagesRef}
          >
            {imagesHtml}
            {!imagesHtml.length && <div className={classes.image}>img</div>}
          </div>

          {images?.length > curVisibleAmount && (
            <>
              <button
                type="button"
                className={`${classes.btn} ${classes["btn__left"]}`}
                onClick={slidePrevHandler}
                title="Prev"
              ></button>

              <button
                type="button"
                className={`${classes.btn} ${classes["btn__right"]}`}
                onClick={slideNextHandler}
                title="Next"
              ></button>
            </>
          )}
          {images?.length > curVisibleAmount && (
            <ul className={classes.pagination}>{paginationHtml}</ul>
          )}
          {postId && (
            <span
              className={`${classes["post-id"]} ${
                savingImages ? classes["post-id--saving"] : ""
              }`}
              onClick={saveExampleHandler}
            >
              {!savingImages ? "+" : "S..."}
            </span>
          )}
          {onUpdate && (
            <span className={classes["post-id"]} onClick={updateExampleHandler}>
              UP
            </span>
          )}
          <span className={classes["amount"]}>{images?.length}</span>
        </div>
        <div
          className={`${classes.card} ${
            imgIsOpen ? classes["card--hidden"] : ""
          }`}
        >
          {imgIsOpen && (
            <ImageCard
              imageData={images[currImgNum]}
              closeImg={closeImgHandler}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
