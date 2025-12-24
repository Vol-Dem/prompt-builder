// import React, { useCallback, useState } from "react";
// import { useRef } from "react";
// import { useEffect } from "react";
// import {
//   arrayRemove,
//   arrayUnion,
//   doc,
//   getFirestore,
//   // setDoc,
//   // updateDoc,
//   writeBatch,
// } from "firebase/firestore";
// import { useDispatch, useSelector } from "react-redux";

// import classes from "./Carousel.module.scss";
// import ImageCard from "../image-card/ImageCard";
// import CarouselImage from "./carousel-image/CarouselImage";
// import useIntersection from "../../hooks/use-intersection";
// import { clearObjectKeys } from "../../utils/generalUtils";
// import {
//   getImagesInfo,
//   makeBatchRequest,
//   updateImagePostData,
// } from "../../utils/fetchUtils";
// import firebaseApp from "../../firebase-config";
// import Spinner from "../ui/Spinner";
// import { uploadActions } from "../../store/upload";
// import { deleteImgPost, modelActions } from "../../store/model";
// import ButtonAdd from "../ui/ButtonAdd";
// import Modal from "../ui/Modal";
// import Buttton from "../ui/Button";
// import Image from "../ui/image/Image";
// import ChooseImageForm from "../forms/choose-image-form/ChooseImageForm";
// import ImageFullView from "../ui/ImageFullView";

// const firestore = getFirestore(firebaseApp);

// const Carousel = ({
//   imagesData,
//   visibleImgAmount,
//   postId,
//   onUpdate,
//   modelId,
//   versionId,
//   existedImgsAmount,
//   imgIsOpen = false,
//   activeImgNum,
//   // onDelete,
//   saved,
//   active,
//   onActiveNumChange,
//   side,
// }) => {
//   const [visibleAmount, setVisibleAmount] = useState(visibleImgAmount);
//   const [initial, setInitial] = useState(true);
//   const [images, setImages] = useState(imagesData);
//   const [imageFormType, setImageFormType] = useState("");
//   // const [imgIsOpen, setImgIsOpen] = useState(imgIsOpen);
//   // const [isUploading, setSavingImages] = useState(false);
//   const [currImgNum, setCurrImgNum] = useState(0);
//   const [translate, setTranslate] = useState(0);
//   const [curTransitionDur, setCurTransitionDur] = useState("0ms");
//   const [imagesListIsOpen, setImagesListIsOpen] = useState(false);
//   const [fullViewIsOpen, setFullViewIsOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [imagesHtml, setImagesHtml] = useState([]);
//   const [transitionEnd, setTransitionEnd] = useState(true);
//   const [carouselHeight, setCarouselHeight] = useState(null);
//   const [visibleImages, setVisibleImages] = useState([]);
//   const [prevVisibleImages, setPrevVisibleImages] = useState([]);
//   const [curVisibleAmount, setCurVisibleAmount] = useState(visibleImgAmount);
//   const [carouselWidth, setCarouselWidth] = useState(0);
//   const [dimensions, setDimensions] = useState({});
//   const [cursorInitialX, setCursorInitialX] = useState(null);
//   const [cursorCurX, setCursorCurX] = useState(null);
//   const carouselRef = useRef();
//   const imagesRef = useRef();
//   // const wrapRef = useRef();
//   const wrapRef = carouselRef;
//   const maxCarouselHeight = 390;
//   const transitionDuration = 300;
//   const caruselIsVisible = true;
//   // const caruselIsVisible = useIntersection(carouselRef);
//   // const nsfwMode = true;
//   // const model = {};
//   // const queue = useSelector((state) => state.upload.queue);
//   // const isUploading = queue.find((item) => item.postId === postId);
//   const nsfwMode = useSelector((state) => state.model.nsfwMode);
//   const model = useSelector((state) => state.model.model);
//   const queue = useSelector((state) => state.upload.queue);
//   const isUploading = queue.find((item) => item.postId === postId);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     // console.log("WTF ImgData");
//     setImages(imagesData);
//   }, [imagesData]);

//   useEffect(() => {
//     setInitial(true);
//     setCurrImgNum(0);
//     setTranslate(0);
//   }, [nsfwMode]);

//   useEffect(() => {
//     if (!dimensions?.imgWidthWithGap) return;
//     // console.log(dimensions.imgWidthWithGap);
//     const curCarouselWidth =
//       dimensions.imgWidthWithGap * curVisibleAmount - dimensions.gap;
//     // console.log(curCarouselWidth);
//     setCarouselWidth(curCarouselWidth);
//   }, [dimensions.imgWidthWithGap, curVisibleAmount, dimensions.gap]);

//   useEffect(() => {
//     const gap = parseInt(getComputedStyle(imagesRef.current).gap);
//     const imgWidth = imagesRef.current.children[0].clientWidth;
//     const imgWidthWithGap = imgWidth + gap;
//     const wrapWidth = wrapRef.current.clientWidth;

//     setDimensions((prevState) => {
//       return {
//         ...prevState,
//         wrapWidth,
//         imgWidth,
//         gap,
//         imgWidthWithGap,
//       };
//     });
//   }, [imagesRef, wrapRef]);

//   // useEffect(()=> {
//   //   const handleResize = () => {}
//   //   if(visibleImgAmount > 1) {
//   //     window.addEventListener('resize', handleResize)
//   //   }

//   //   return ()=> {
//   //     window.removeEventListener('resize', handleResize)
//   //   }
//   // },[])

//   const openSaveImagesListHandler = () => {
//     if (images.length === 1) {
//       saveExampleHandler();
//     } else {
//       setImageFormType("save");
//       setImagesListIsOpen(true);
//     }
//   };

//   const openDeleteListHandler = () => {
//     setImageFormType("del");
//     setImagesListIsOpen(true);
//   };

//   const openFullViewHandler = () => {
//     // console.log(activeCarouselData);
//     setFullViewIsOpen(true);
//   };

//   const openCarouselHandler = useCallback(
//     (e) => {
//       if (imgIsOpen) return;
//       console.log("open");

//       // document.body.style.overflow = "hidden";
//       const imgNum = e.target.dataset.position - visibleAmount;
//       const currImg = imgNum >= 0 ? imgNum : images?.length + imgNum;
//       // console.log(e.target.dataset.position);
//       // console.log(visibleAmount);
//       // console.log(imgNum);
//       // console.log(currImg);
//       dispatch(
//         modelActions.setActiveCarouselData({
//           images,
//           visibleImgAmount,
//           postId,
//           modelId,
//           saved,
//           // onDelete,
//           versionId,
//           existedImgsAmount,
//           currImgNum: +currImg,
//         })
//       );
//     },
//     [
//       dispatch,
//       images,
//       visibleImgAmount,
//       postId,
//       modelId,
//       versionId,
//       existedImgsAmount,
//       imgIsOpen,
//       visibleAmount,
//       saved,
//     ]
//   );

//   useEffect(() => {
//     const curVisibleImgAmount = Math.floor(
//       dimensions.wrapWidth / dimensions.imgWidthWithGap
//     );
//     if (!visibleImgAmount && curVisibleImgAmount <= images?.length) {
//       console.log("VIS", curVisibleImgAmount);
//       console.log(versionId);
//       console.log(initial);
//       setVisibleAmount(curVisibleImgAmount);
//       setCurVisibleAmount(curVisibleImgAmount);
//     }
//     if (!visibleImgAmount && curVisibleImgAmount > images?.length) {
//       console.log("VIS", images?.length);
//       console.log(versionId);
//       console.log(initial);
//       setVisibleAmount(images?.length);
//       setCurVisibleAmount(images?.length);
//     }
//   }, [dimensions, visibleImgAmount, images]);

//   useEffect(() => {
//     setVisibleAmount(0);
//     setCurrImgNum(0);
//     setTranslate(0);
//     setInitial(true);
//   }, [versionId]);

//   useEffect(() => {
//     if (initial && !!images?.length && !!visibleAmount) {
//       const visibleImg = Array.from(
//         { length: visibleAmount },
//         (_, i) => visibleAmount + i
//       );
//       console.log(visibleImg);
//       console.log(visibleAmount);
//       console.log(curVisibleAmount);
//       console.log("NUM", currImgNum);
//       setVisibleImages(visibleImg);
//       setCurTransitionDur("0ms");
//       setCurrImgNum(0);
//       setInitial(false);
//     }
//   }, [visibleAmount, images, initial]);

//   const openImgHandler = useCallback(
//     (e) => {
//       // setCurTransitionDur("0ms");
//       // setImgIsOpen((prevState) => !prevState);
//       const imgNum = e.target.dataset.position - visibleAmount;
//       setCurrImgNum(imgNum >= 0 ? imgNum : images?.length + imgNum);
//       setCurVisibleAmount(1);
//       setPrevVisibleImages(visibleImages);
//       setVisibleImages([+e.target.dataset.position]);
//     },
//     [visibleAmount, visibleImages, images]
//   );

//   const closeImgHandler = () => {
//     // setImgIsOpen(false);
//     // setCurVisibleAmount(visibleAmount);
//     // if (prevVisibleImages?.length === visibleAmount) {
//     //   setVisibleImages(prevVisibleImages);
//     // } else {
//     //   const visibleImg = Array.from(
//     //     { length: visibleAmount },
//     //     (_, i) => visibleImages[0] + i
//     //   );
//     //   setVisibleImages(visibleImg);
//     // }
//     dispatch(modelActions.setActiveCarouselData({}));
//   };

//   useEffect(() => {
//     if (!images?.length || !visibleImages?.length) return;
//     // console.log(currImgNum);

//     const imagesFiltered = images.filter((image) => true);
//     const imagesHtml = imagesFiltered.map((image, i) => {
//       const src =
//         (visibleImages.includes(i + visibleAmount) ||
//           visibleImages.includes(i - images?.length + visibleAmount)) &&
//         caruselIsVisible
//           ? image.url
//           : "";

//       return (
//         <CarouselImage
//           key={image?.hash + i}
//           imageData={image}
//           postId={images}
//           // saved={!postId}
//           saved={saved}
//           active={!!active}
//           versionId={versionId}
//           onClick={openCarouselHandler}
//           onDelete={openDeleteListHandler}
//           onOpen={openFullViewHandler}
//           // // onDelete={onDelete}
//           id={image?.hash}
//           dataset={i + visibleAmount}
//           src={src}
//           alt="example image"
//           side={side}
//           nsfw={
//             image?.nsfw === false ||
//             image?.nsfw === "None" ||
//             image.nsfwLevel === 1
//               ? false
//               : true
//           }
//         />
//       );
//     });

//     let imagesleft = [];
//     let imagesRight = [];

//     if (imagesFiltered.length >= +visibleAmount) {
//       imagesRight = imagesFiltered.slice(0, visibleAmount).map((image, i) => {
//         const src =
//           visibleImages.includes(i + visibleAmount) && caruselIsVisible
//             ? image.url
//             : "";
//         return (
//           <CarouselImage
//             key={image?.hash + "r" + i}
//             imageData={image}
//             postId={images}
//             // saved={!postId}
//             saved={saved}
//             active={!!active}
//             versionId={versionId}
//             onClick={openCarouselHandler}
//             onDelete={openDeleteListHandler}
//             onOpen={openFullViewHandler}
//             // // onDelete={onDelete}
//             id={image?.hash}
//             dataset={i + visibleAmount}
//             src={src}
//             alt="example image"
//             side={side}
//             nsfw={
//               image?.nsfw === false ||
//               image?.nsfw === "None" ||
//               image.nsfwLevel === 1
//                 ? false
//                 : true
//             }
//           />
//         );
//       });
//       imagesleft = imagesFiltered.slice(-visibleAmount).map((image, i) => {
//         const src =
//           (visibleImages.includes(i) ||
//             visibleImages.includes(i + images?.length)) &&
//           caruselIsVisible
//             ? image.url
//             : "";
//         return (
//           <CarouselImage
//             key={image?.hash + "l" + i}
//             imageData={image}
//             postId={images}
//             // saved={!postId}
//             saved={saved}
//             active={!!active}
//             versionId={versionId}
//             onClick={openCarouselHandler}
//             onDelete={openDeleteListHandler}
//             onOpen={openFullViewHandler}
//             // // onDelete={onDelete}
//             id={image?.hash}
//             dataset={i}
//             src={src}
//             alt="example image"
//             side={side}
//             nsfw={
//               image?.nsfw === false ||
//               image?.nsfw === "None" ||
//               image.nsfwLevel === 1
//                 ? false
//                 : true
//             }
//           />
//         );
//       });
//     }
//     setImagesHtml([...imagesleft, ...imagesHtml, ...imagesRight]);
//   }, [
//     visibleAmount,
//     images,
//     visibleImages,
//     openImgHandler,
//     caruselIsVisible,
//     postId,
//     versionId,
//     currImgNum,
//     openCarouselHandler,
//     // onDelete,
//     saved,
//     active,
//     side,
//   ]);

//   useEffect(() => {
//     if (!images) return;
//     const bookImages = images.filter((img) => img?.height - img?.width > 0);
//     const imgsToGetSize = !bookImages.length ? images : bookImages;
//     const imgSize = imgsToGetSize?.reduce(
//       (acc, cur) => {
//         return cur?.height > acc[0] ? [cur?.height, cur?.width] : acc;
//       },
//       [0, 0]
//     );
//     const imgHight = Math.floor(
//       (dimensions.imgWidth / imgSize[1]) * imgSize[0]
//     );
//     setCarouselHeight(maxCarouselHeight);
//     // if (curVisibleAmount === 1) {
//     //   setCarouselHeight(maxCarouselHeight);
//     // } else {
//     //   setCarouselHeight(
//     //     imgHight > maxCarouselHeight ? maxCarouselHeight : imgHight
//     //   );
//     // }
//   }, [images, dimensions.imgWidth, curVisibleAmount]);

//   useEffect(() => {
//     if (images?.length > curVisibleAmount) {
//       setTranslate(-dimensions.imgWidthWithGap * visibleImages[0]);
//     }
//   }, [dimensions.imgWidthWithGap, curVisibleAmount, visibleImages, images]);

//   const transitionStartHandler = useCallback(() => {
//     setTransitionEnd(false);
//   }, []);

//   const transitionEndHandler = useCallback(() => {
//     setTransitionEnd(true);
//     if (!imagesRef?.current) return;

//     if (visibleImages[0] === 0) {
//       setCurTransitionDur("0ms");
//       setVisibleImages((prevState) =>
//         prevState.map((el, i) => images?.length + i)
//       );
//       setPrevVisibleImages((prevState) =>
//         prevState.map((el, i) => images?.length + i)
//       );
//       setTranslate(-dimensions.imgWidthWithGap * images?.length);
//     }
//     if (visibleImages[0] === images?.length + curVisibleAmount) {
//       setCurTransitionDur("0ms");
//       setVisibleImages((prevState) =>
//         prevState.map((el, i) => curVisibleAmount + i)
//       );
//       setTranslate(-dimensions.imgWidthWithGap * curVisibleAmount);
//     }
//     if (visibleImages[0] > images?.length + curVisibleAmount) {
//       setCurTransitionDur("0ms");
//       setVisibleImages((prevState) =>
//         prevState.map((el, i) => visibleImages[0] - images?.length)
//       );
//     }
//   }, [curVisibleAmount, visibleImages, images, dimensions.imgWidthWithGap]);

//   useEffect(() => {
//     if (images?.length > curVisibleAmount) {
//       setTransitionEnd(true);
//       document.removeEventListener("transitionstart", transitionStartHandler);
//       document.removeEventListener("transitionend", transitionEndHandler);
//       document.addEventListener("transitionstart", transitionStartHandler);
//       document.addEventListener("transitionend", transitionEndHandler);
//     }

//     return () => {
//       document.removeEventListener("transitionstart", transitionStartHandler);
//       document.removeEventListener("transitionend", transitionEndHandler);
//     };
//   }, [curVisibleAmount, images, transitionStartHandler, transitionEndHandler]);

//   const slideNextHandler = () => {
//     // console.log(images);
//     if (!transitionEnd || images.length <= 1) return;
//     setCurTransitionDur(`${transitionDuration}ms`);
//     const curImg = visibleImages[0] + 1;
//     setVisibleImages((prevState) => prevState.map((el) => el + 1));
//     setTranslate(-dimensions.imgWidthWithGap * curImg);
//     setPrevVisibleImages(visibleImages.map((el) => el + 1));
//     let imgNum = visibleImages[0] + 1 - visibleAmount;
//     if (imgNum > images?.length - 1) imgNum = 0;
//     const activeImage = imgNum >= 0 ? imgNum : images?.length + imgNum;
//     setCurrImgNum(activeImage);
//     if (!!onActiveNumChange && !fullViewIsOpen) {
//       onActiveNumChange(activeImage);
//     }

//     // if (imgIsOpen) {
//     //   dispatch(
//     //     modelActions.setActiveCarouselData({
//     //       images,
//     //       visibleImgAmount,
//     //       postId,
//     //       modelId,
//     //       versionId,
//     //       existedImgsAmount,
//     //       currImgNum: imgNum >= 0 ? imgNum : images?.length + imgNum,
//     //     })
//     //   );
//     // }
//   };

//   const slidePrevHandler = () => {
//     console.log(images);
//     if (!transitionEnd || images.length <= 1) return;
//     setCurTransitionDur(`${transitionDuration}ms`);
//     const curImg = visibleImages[0] - 1;
//     setVisibleImages((prevState) => prevState.map((el) => el - 1));
//     setTranslate(-dimensions.imgWidthWithGap * curImg);
//     setPrevVisibleImages(visibleImages.map((el) => el - 1));
//     const imgNum = visibleImages[0] - 1 - visibleAmount;
//     const activeImage = imgNum >= 0 ? imgNum : images?.length + imgNum;
//     setCurrImgNum(activeImage);
//     if (!!onActiveNumChange && !fullViewIsOpen) {
//       onActiveNumChange(activeImage);
//     }
//     // if (imgIsOpen) {
//     //   dispatch(
//     //     modelActions.setActiveCarouselData({
//     //       images,
//     //       visibleImgAmount,
//     //       postId,
//     //       modelId,
//     //       versionId,
//     //       existedImgsAmount,
//     //       currImgNum: imgNum >= 0 ? imgNum : images?.length + imgNum,
//     //     })
//     //   );
//     // }
//   };

//   const paginationHtml = images?.map((_, i) => {
//     const isActive =
//       visibleImages.includes(visibleAmount + i) ||
//       visibleImages.includes(i - images?.length + visibleAmount) ||
//       visibleImages.includes(i + images?.length + visibleAmount);
//     return (
//       <li
//         key={i}
//         className={`${classes["pagination__item"]} ${
//           isActive ? classes["pagination__item--active"] : ""
//         }`}
//         onClick={() => {
//           setCurTransitionDur(`${transitionDuration}ms`);
//           setCurrImgNum(i);
//           if (onActiveNumChange) {
//             onActiveNumChange(i);
//           }
//           setVisibleImages((prevState) => {
//             const newVisibleImages = prevState.map(
//               (el, j) => i + j + visibleAmount
//             );
//             setPrevVisibleImages(newVisibleImages);
//             return newVisibleImages;
//           });
//           // if (imgIsOpen) {
//           //   dispatch(
//           //     modelActions.setActiveCarouselData({
//           //       images,
//           //       visibleImgAmount,
//           //       postId,
//           //       modelId,
//           //       versionId,
//           //       existedImgsAmount,
//           //       currImgNum: i,
//           //     })
//           //   );
//           // }
//         }}
//       ></li>
//     );
//   });

//   const saveExampleHandler = async (e, ids) => {
//     const postData =
//       model.hasOwnProperty("savedImages") &&
//       model?.savedImages[versionId]?.find((post) => post.postId === +postId);
//     console.log(queue);
//     dispatch(
//       uploadActions.addToQueue({
//         postId,
//         modelId,
//         modelName: model.name,
//         versionId,
//         nsfwMode,
//         postData: postData || null,
//         imgUrl: images[0].url,
//         ids: ids || [],
//         existedAmount: existedImgsAmount,
//       })
//     );
//     setImagesListIsOpen(false);
//   };

//   const deleteExampleHandler = async (e, ids) => {
//     try {
//       const curPostId = images[0].postId;
//       const postData =
//         model.hasOwnProperty("savedImages") &&
//         model?.savedImages[versionId]?.find(
//           (post) => post.postId === curPostId
//         );
//       setIsDeleting(true);
//       // console.log(versionId);
//       // console.log(curPostId);
//       // console.log(postData);

//       if (!!ids?.length && ids?.length !== postData.amount) {
//         const newImages = images.filter((image) => !ids?.includes(image.id));
//         // console.log(newImages);
//         console.log("UPDATE");
//         await updateImagePostData(
//           {
//             postId: curPostId,
//             modelId,
//             modelName: model.name,
//             versionId,
//             nsfwMode,
//             postData: postData || null,
//             imgUrl: images[0].url,
//             ids: ids || [],
//             existedAmount: existedImgsAmount,
//           },
//           newImages
//         );
//         setImages(newImages);
//       } else {
//         console.log("DELETE");
//         dispatch(deleteImgPost(versionId, curPostId, postData));
//       }
//       setIsDeleting(false);
//       setImagesListIsOpen(false);
//     } catch (err) {
//       console.log(err);
//       setIsDeleting(false);
//       // setImagesListIsOpen(false);
//     }
//   };

//   // const imagesListHtml = images.map((image, i) => {
//   //   return (
//   //     <li key={i}>
//   //       <Image
//   //         className={classes["image"]}
//   //         src={image.url}
//   //         alt={`Image-${i}`}
//   //       />
//   //     </li>
//   //   );
//   // });

//   const updateExampleHandler = () => {
//     onUpdate(images[0].postId);
//   };

//   // useEffect(() => {
//   //   document.body.style.overflow = "hidden";
//   //   return () => {
//   //     document.body.style.overflow = null;
//   //   };
//   // }, []);
//   useEffect(() => {
//     if (activeImgNum) {
//       console.log(activeImgNum);
//       setCurrImgNum(activeImgNum);
//       setVisibleImages((prevState) => {
//         const newVisibleImages = prevState.map(
//           (el, j) => activeImgNum + j + visibleAmount
//         );
//         setPrevVisibleImages(newVisibleImages);
//         return newVisibleImages;
//       });
//     }
//   }, [activeImgNum, visibleAmount]);

//   const moveElement = (e) => {
//     const clientX = Math.round(e.clientX || e.touches[0].clientX);
//     console.log(clientX);
//     setCursorCurX(clientX);
//   };

//   const mouseDownHandler = (e) => {
//     const clientX = Math.round(e.clientX || e.touches[0].clientX);
//     // setCursorCurX(null);
//     setCursorInitialX(clientX);
//   };

//   const mouseUp = (e) => {
//     const clientX = Math.round(e?.clientX || e?.touches[0]?.clientX);
//     // console.log(e);
//     // console.log(e?.clientX);
//     // console.log(e?.touches[0]?.clientX);
//     console.log(cursorInitialX, cursorCurX);
//     // console.log(cursorInitialX - clientX);
//     if (!cursorInitialX || !cursorCurX) return;
//     const offcet = Math.round(cursorInitialX) - Math.round(cursorCurX);
//     setCursorCurX(null);
//     setCursorInitialX(null);
//     if (!!offcet && offcet > 0 && Math.abs(offcet) > 40) {
//       console.log("NEXT T");
//       slideNextHandler();
//     } else if (!!offcet && offcet < 0 && Math.abs(offcet) > 40) {
//       console.log("PREV T");
//       slidePrevHandler();
//     }
//   };

//   return (
//     // <div
//     //   // className={classes.container}
//     //   className={`${classes.container} ${
//     //     imgIsOpen ? classes["container--open"] : ""
//     //   }`}
//     //   style={
//     //     carouselHeight && !imgIsOpen ? { height: `${carouselHeight}px` } : {}
//     //   }
//     //   // onClick={openCarouselHandler}
//     // >
//     //   <div
//     //     ref={wrapRef}
//     //     className={`${classes.wrap}`}
//     //     style={
//     //       imgIsOpen
//     //         ? {
//     //             height: `${
//     //               promptIsOpen ? "calc(100vh - 315px)" : "calc(100vh - 110px)"
//     //             }`,
//     //           }
//     //         : {}
//     //     }
//     //     // className={`${classes.wrap} ${imgIsOpen ? classes["wrap--open"] : ""}`}
//     //   >
//     <div
//       className={`${classes.carousel}`}
//       ref={carouselRef}
//       style={
//         carouselHeight && carouselWidth
//           ? {
//               height: `${carouselHeight}px`,
//               maxWidth: `${carouselWidth}px`,
//             }
//           : {}
//       }
//       // onMouseUp={mouseUp}
//       onTouchEnd={mouseUp}
//       // onMouseDown={mouseDownHandler}
//       onTouchStart={mouseDownHandler}
//       // onPointerMove={moveElement}
//       onTouchMove={moveElement}
//     >
//       <div
//         className={`${classes["carousel__images"]} `}
//         style={{
//           transform: `translate3D(${translate}px, 0, 0)`,
//           transitionDuration: curTransitionDur,
//         }}
//         ref={imagesRef}
//       >
//         {imagesHtml}
//         {!imagesHtml.length && <div className={classes.image}>img</div>}
//       </div>

//       {images?.length > curVisibleAmount && (
//         <>
//           <button
//             type="button"
//             className={`${classes.btn} ${classes["btn__left"]}`}
//             onClick={slidePrevHandler}
//             title="Prev"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="w-6 h-6"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M15.75 19.5 8.25 12l7.5-7.5"
//               />
//             </svg>
//           </button>

//           <button
//             type="button"
//             className={`${classes.btn} ${classes["btn__right"]}`}
//             onClick={slideNextHandler}
//             title="Next"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={1.5}
//               stroke="currentColor"
//               className="w-6 h-6"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="m8.25 4.5 7.5 7.5-7.5 7.5"
//               />
//             </svg>
//           </button>
//         </>
//       )}
//       {images?.length > curVisibleAmount && (
//         <ul className={classes.pagination}>{paginationHtml}</ul>
//       )}
//       {/* <ButtonAdd
//         className={classes["btn-add"]}
//         previewData={images[currImgNum]}
//         type="image"
//       /> */}
//       {!saved && !!postId && (
//         <span className={classes["btn-save-container"]}>
//           <button
//             className={`${classes["btn-save"]} ${
//               isUploading ? classes["btn-save--saving"] : ""
//             }`}
//             onClick={openSaveImagesListHandler}
//           >
//             {!isUploading ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className="w-6 h-6"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="m9 13.5 3 3m0 0 3-3m-3 3v-6m1.06-4.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
//                 />
//               </svg>
//             ) : (
//               <Spinner size="small" />
//             )}
//           </button>
//           {existedImgsAmount && existedImgsAmount < images.length && (
//             <span className={classes["btn-save__amount"]}>
//               {existedImgsAmount}/{images.length}
//             </span>
//           )}
//         </span>
//       )}
//       {onUpdate && (
//         <span className={classes["btn-save"]} onClick={updateExampleHandler}>
//           UP
//         </span>
//       )}
//       {/* <span className={classes["amount"]}>{images?.length}</span> */}
//       {fullViewIsOpen && (
//         <ImageFullView
//           src={images[currImgNum]?.url}
//           onClose={() => {
//             setFullViewIsOpen(false);
//             onActiveNumChange(currImgNum);
//           }}
//           nextSlide={slideNextHandler}
//           prevSlide={slidePrevHandler}
//         ></ImageFullView>
//       )}
//       {imagesListIsOpen && (
//         <Modal
//           onClose={() => {
//             setImagesListIsOpen(false);
//           }}
//         >
//           <ChooseImageForm
//             type={imageFormType}
//             modelId={modelId}
//             images={images}
//             activeImageIndex={currImgNum}
//             existedImgsAmount={existedImgsAmount}
//             onSave={
//               imageFormType === "save"
//                 ? saveExampleHandler
//                 : deleteExampleHandler
//             }
//             isDeleting={isDeleting}
//             onClose={() => {
//               setImageFormType("");
//               setImagesListIsOpen(false);
//             }}
//           />
//         </Modal>
//       )}
//     </div>
//     //     {imgIsOpen && (
//     //       <ImageCard
//     //         imageData={images[currImgNum]}
//     //         closeImg={closeImgHandler}
//     //         // isOpen={imgIsOpen}
//     //       />
//     //     )}
//     //   </div>
//     // </div>
//   );
// };

// export default Carousel;
