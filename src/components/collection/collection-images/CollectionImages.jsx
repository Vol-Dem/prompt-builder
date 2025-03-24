import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import classes from "./CollectionImages.module.scss";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "../../carousel/Carousel";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import firebaseApp from "../../../firebase-config";
import Spinner from "../../ui/Spinner";
import ErrorMessage from "../../ui/ErrorMessage";

import { useOnlineStatus } from "../../../hooks/use-online-status";
import {
  ERROR_MESSAGE_DEFAULT,
  ANIMATIONS_FM_SLIDEIN,
  ANIMATIONS_FM_SLIDEIN_INITIAL,
  SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE,
  SETTINGS_LOAD_MORE_MARGIN,
  SETTINGS_LOAD_MORE_MARGIN_MEDIUM,
} from "../../../variables/constants";
import ExclamationCircleSvg from "../../../assets/ExclamationCircleSvg";
import FolderSvg from "../../../assets/FolderSvg";
import { motion } from "framer-motion";
import useIntersection from "../../../hooks/use-intersection";
import { checkIsInCurrentNsfwRange } from "../../../utils/generalUtils";
import { getColectionImagesByIds, imagesActions } from "../../../store/images";

const firestore = getFirestore(firebaseApp);

const CollectionImages = memo(() => {
  const [examplesIsLoading, setExamplesIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  // const [isLastPage, setIsLastPage] = useState(false);
  // const [lastVisible, setLastVisible] = useState({});
  // const [examplesImgData, setExamplesImgData] = useState([]);
  // const model = useSelector((state) => state.model.model);
  const savedImagesData = useSelector(
    (state) => state.images.collectionData
  )?.posts?.toSorted((a, b) => b.createdAt - a.createdAt);
  const nsfwMode = useSelector((state) => state.general.nsfwMode);
  const nsfwLevel = useSelector((state) => state.general.nsfwLevel);
  const uid = useSelector((state) => state.auth.user.uid);
  const collectionData = useSelector((state) => state.images.collectionData);
  const collectionImages = useSelector(
    (state) => state.images.collectionImages
  );
  const examplesImgData = collectionImages?.images || [];
  // console.log(collectionData);
  // console.log(collectionImages);
  // console.log(examplesImgData);
  const isLastPage = !!collectionImages?.isLastPage;
  //   const postIds = collectionData?.posts
  //     ?.toSorted((a, b) => a.createdAt - b.createdAt)
  //     ?.map((post) => post.postId);
  // const abortControlerRef = useRef(null);
  const endPageRef = useRef(null);
  const isIntersecting = useIntersection(
    endPageRef,
    false,
    SETTINGS_LOAD_MORE_MARGIN_MEDIUM
  );
  const isOnline = useOnlineStatus();
  // const timeoutRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(imagesActions.setCollectionImages({}));
    return () => {
      dispatch(imagesActions.setCollectionImages({}));
    };
  }, [collectionData?.id, nsfwLevel, dispatch]);

  const getImagesFromFirestore = useCallback(
    async (posts) => {
      try {
        // console.log("GET IMAGES");
        if (isLastPage) return;
        setExamplesIsLoading(true);
        // setErrorMessage("");
        // console.log("GETCH");
        // console.log(posts);
        // const nsfwFilter = !nsfwMode ? [true] : [true, false];
        // const from = pageIndex * SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;
        // const to =
        //   pageIndex * SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE +
        //   SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;
        // console.log(pageIndex);
        // console.log(from, to);

        // const curPosts = posts.slice(from, to);
        // const ids = curPosts?.map((post) => post.postId);
        // console.log(ids);

        // const q = query(
        //   collection(firestore, "users", uid, "images"),
        //   where("id", "in", ids),
        //   where("hasSfw", "in", nsfwFilter),
        //   orderBy("createdAt", "desc"),
        //   //   startAfter(lastVisible),
        //   limit(SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE)
        // );

        // const modelImagesSnap = await getDocs(q);

        // const isLast =
        //   !modelImagesSnap.docs.length ||
        //   modelImagesSnap.docs.length <
        //     SETTINGS_COLLECTION_SAVED_POSTS_PER_PAGE;

        // const data = modelImagesSnap.docs.flatMap((doc, i) => {
        //   return doc.data();
        // });

        // console.log(data);

        // const examples = data
        //   .map((post) => {
        //     return post.items
        //       .filter((image) => {
        //         const saved =
        //           savedImagesData?.length &&
        //           savedImagesData
        //             ?.find((postData) => postData.postId === image.postId)
        //             ?.imageIds?.includes(image.id);

        //         const isInCurrentNsfwRange = checkIsInCurrentNsfwRange(
        //           nsfwLevel,
        //           image?.nsfwLevel
        //         );

        //         return saved && isInCurrentNsfwRange;
        //       })
        //       .toSorted((a, b) => {
        //         return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        //       });
        //   })
        //   .filter((item) => !!item.length)
        //   .toSorted((a, b) => {
        //     return (
        //       curPosts.find((post) => post.postId === b[0].postId).createdAt -
        //       curPosts.find((post) => post.postId === a[0].postId).createdAt
        //     );
        //   });

        // console.log(examples);

        // setExamplesImgData((prevState) => [...prevState, ...examples]);

        // // const lastVisiblePost =
        // //   modelImagesSnap.docs[modelImagesSnap.docs.length - 1];
        // // if (!isLast) {
        // //   setLastVisible(lastVisiblePost);
        // // }
        // setIsLastPage(isLast);
        await dispatch(getColectionImagesByIds(posts, collectionData?.id));
        // setPageIndex((prevState) => prevState + 1);
      } catch (err) {
        setErrorMessage(err);
      } finally {
        setExamplesIsLoading(false);
      }
    },
    [
      // curImagesModelVersionId,
      isLastPage,
      // lastVisible,
      savedImagesData,
      nsfwMode,
      nsfwLevel,
      uid,
      setErrorMessage,
      dispatch,
      collectionData?.id,
      //   postIds,
      // pageIndex,
    ]
  );

  useEffect(() => {
    if (
      !isLastPage &&
      isIntersecting &&
      !errorMessage &&
      isOnline &&
      !examplesIsLoading &&
      savedImagesData?.length
    ) {
      // setExamplesIsLoading(true);
      // clearTimeout(timeoutRef.current);

      // timeoutRef.current = setTimeout(() => {
      //   getImagesFromFirestore();
      // }, 1000);
      // console.log("USEEF");
      getImagesFromFirestore(savedImagesData);
    }
  }, [
    isIntersecting,
    isLastPage,
    getImagesFromFirestore,
    errorMessage,
    examplesIsLoading,
    isOnline,
    savedImagesData,
  ]);

  // useEffect(() => {
  //   if (!!savedImagesData && !!examplesImgData?.length) {
  //     const savedPostsIds = savedImagesData?.map((post) => post.postId);

  //     const newExamples = examplesImgData?.filter((image) =>
  //       savedPostsIds?.includes(image[0]?.postId)
  //     );
  //     if (examplesImgData?.length > newExamples?.length) {
  //       setExamplesImgData(newExamples);
  //     }
  //   }
  // }, [savedImagesData, examplesImgData]);
  // console.log(collectionData);
  const postsHtml = examplesImgData.flatMap((item, i) => {
    const postData = collectionData.posts.find(
      (post) => post.postId === item[0].postId
    );

    return (
      <Carousel
        key={i}
        versionId={null}
        imagesData={item}
        visibleImgAmount={1}
        saved={true}
        postId={item[0].postId}
        showInView={true}
        location="collections"
        locationId={collectionData.id}
        curPostData={postData}
      />
    );
  });

  return (
    <>
      {!!examplesImgData?.length && postsHtml}
      {examplesIsLoading && <Spinner />}
      {errorMessage && isOnline && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!examplesIsLoading && !examplesImgData.length && !errorMessage && (
        <motion.div
          initial={ANIMATIONS_FM_SLIDEIN_INITIAL}
          animate={ANIMATIONS_FM_SLIDEIN}
          className={classes["notification"]}
        >
          <ExclamationCircleSvg className={classes["notification__svg"]} />
          <span>No images found.</span>
          <span>
            Click{" "}
            <FolderSvg
              className={`${classes["svg"]} ${classes["svg--medium"]}`}
            />{" "}
            at the top left corner of the image or use "Add image by ID" button
            to add it to your collection.
          </span>
        </motion.div>
      )}
      <div ref={endPageRef}></div>
    </>
  );
});

export default CollectionImages;
