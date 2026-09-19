import { useDispatch } from "react-redux";
import { useEffect } from "react";

import AppRouter from "./router/AppRouter";
import { initAuth } from "./store/auth";
import { generalActions } from "./store/general";
import { checkIsMobile } from "./utils/generalUtils";

/**
 * Root application component.
 *
 * Initializes authentication and device state, preloads the model page,
 * and renders the application router.
 *
 * @returns {JSX.Element} Application router.
 */
const App = () => {
  const dispatch = useDispatch();

  //Authorizes user on application load
  useEffect(() => {
    dispatch(generalActions.setIsMobile(checkIsMobile()));
    dispatch(initAuth());
  }, [dispatch]);

  // Preload the model page to reduce the delay on first navigation.
  useEffect(() => {
    import("./pages/Model");
  }, []);

  return <AppRouter />;
};

export default App;
