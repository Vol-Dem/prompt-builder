import React, { useEffect, useState } from "react";
import classes from "./Layout.module.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "../footer/Footer";

// const Layout = () => {
//   return (
//     <div>
//       <Outlet />
//       <Footer />
//     </div>
//   );
// };

// export default Layout;

import Header from "../header/Header";
import MainNavigation from "../navigation/MainNavigation";
import MobileNavigation from "../navigation/MobileNavigation";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../../../store/auth";
import UserNavigation from "../navigation/UserNavigation";
import Buttton from "../../ui/Button";
import Modal from "../../ui/Modal";
import AuthForm from "../../forms/Auth/AuthForm";
import { Suspense } from "react";
import Spinner from "../../ui/Spinner";
import Notification from "../../ui/Notification";
import Prompt from "../../prompt/Prompt";
import UsedModelsPanel from "../../used-models-panel/UsedModelsPanel";
import { modelActions, switchNsfwMode } from "../../../store/model";
import Search from "../../search/Search";
import UploadingPanel from "../../uploading-panel/UploadingPanel";
import Carousel from "../../carousel/Carousel";
import ActiveCarousel from "../../active-carousel/ActiveCarousel";
import SearchSvg from "../../../assets/SearchSvg";

const Layout = () => {
  // const [mobileSearchIsOpen, setMobileSea  rchIsOpen] = useState(false);
  const isAuth = useSelector((state) => state.auth.isLoggedIn);
  const authIsOpen = useSelector((state) => state.auth.authFormIsOpen);
  const notificationIsShown = useSelector(
    (state) => state.notification.isShown
  );
  const notificationTitle = useSelector((state) => state.notification.title);
  const notificationMessage = useSelector(
    (state) => state.notification.message
  );
  const isNsfwMode = useSelector((state) => state.model.nsfwMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const openAuth = () => {
    dispatch(authActions.openAuthForm());
  };
  const closeAuth = () => {
    dispatch(authActions.closeAuthForm());
  };

  const openMobileSearch = () => {
    if (location.pathname !== "/search") {
      navigate("search");
    }
    // setMobileSearchIsOpen((prevState) => !prevState);
  };
  // const closeMobileSearch = () => {
  //   setMobileSearchIsOpen(false);
  // };

  const nsfwSwitchHandler = () => {
    dispatch(switchNsfwMode(!isNsfwMode));
  };

  // const activeCarouselData = useSelector(
  //   (state) => state.model.activeCarouselData
  // );
  // const activeCarouselHtml = (
  //   <div>
  //     <Carousel
  //       images={activeCarouselData?.images}
  //       versionId={activeCarouselData.versionId}
  //       existedImgsAmount={activeCarouselData?.existedImgsAmount || null}
  //       postId={activeCarouselData.postId}
  //       modelId={activeCarouselData.modelId}
  //       visibleImgAmount={1}
  //       isOpen={true}
  //     />
  //   </div>
  // );

  // useEffect(() => {
  //   if (!!activeCarouselData?.images?.length) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = null;
  //   }
  // }, [activeCarouselData]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>
        <Header>
          <div className={classes["menu-container"]}>
            <div className="wrapper">
              <div className={classes.menu}>
                <MobileNavigation />
                <div className={classes.logo}>LOGO</div>
                <MainNavigation />
                {isAuth && (
                  <>
                    <Search
                      className={`${
                        location.pathname === "/search"
                          ? ""
                          : classes["search-hidden"]
                      }`}
                    />
                    <span
                      className={classes["btn-search"]}
                      onClick={openMobileSearch}
                    >
                      <SearchSvg />
                    </span>
                    <UploadingPanel />

                    <div className={classes["mode-switch"]}>
                      <button
                        type="button"
                        onClick={nsfwSwitchHandler}
                        className={`${classes["btn-mode"]} ${
                          !isNsfwMode ? classes["btn-mode--active"] : ""
                        }`}
                      >
                        SFW
                      </button>
                      <button
                        type="button"
                        onClick={nsfwSwitchHandler}
                        className={`${classes["btn-mode"]} ${
                          isNsfwMode ? classes["btn-mode--active"] : ""
                        }`}
                      >
                        NSFW
                      </button>
                    </div>
                  </>
                )}

                {isAuth && <UserNavigation />}
                {!isAuth && (
                  <Buttton onClick={openAuth} className={classes["btn-auth"]}>
                    Sign In
                  </Buttton>
                )}
              </div>
            </div>
          </div>
          <div className="wrapper">
            <Prompt />
          </div>
          {/* {!!activeCarouselData?.images?.length && (
            // <div className={classes["active-corousel"]}>
            //   {activeCarouselHtml}
            // </div>
          )} */}
          <ActiveCarousel />
        </Header>

        <main>
          <div className="wrapper">
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        {authIsOpen && (
          <Modal onClose={closeAuth}>
            <AuthForm />
          </Modal>
        )}
        {notificationIsShown && (
          <Notification
            title={notificationTitle}
            message={notificationMessage}
          />
        )}
        <Footer />
      </div>
      <UsedModelsPanel />
    </div>
  );
};

export default Layout;
