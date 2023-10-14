import React from "react";
import classes from "./Layout.module.scss";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default Layout;
