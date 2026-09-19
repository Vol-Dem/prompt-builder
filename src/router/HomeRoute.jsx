import { lazy } from "react";

import Models from "../pages/Models";
import { useAppSelector } from "../store/hooks/hooks";

const Landing = lazy(() => import("../pages/Landing"));

const HomeRoute = () => {
  const isAuth = useAppSelector((state) => state.auth.isLoggedIn);
  const initialAuth = useAppSelector((state) => state.auth.initialAuth);

  if (isAuth) return <Models title="Models" />;
  if (initialAuth) return <Landing title="AIDE-TOOLS" />;

  return null;
};

export default HomeRoute;
