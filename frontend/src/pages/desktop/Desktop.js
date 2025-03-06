import { useState } from "react";
import DesktopMenu from "common/DesktopMenu";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Settings from "./Settings";
import MenuWrapper from "./MenuWrapper";
import DesktopHeader from "common/DesktopHeader";
import Review from "./Review";

import { useParams } from "react-router-dom";

const Desktop = () => {
  let { page } = useParams();
  page = page || "dashboard";
  const [collapse, setCollapse] = useState(false);

  return (
    <>
      <div className="flex">
        <div
          className={`relative transition-all duration-500 ${
            collapse ? "w-16" : "w-60"
          }`}
        >
          <DesktopMenu collapse={collapse} />
          <div
            className="cursor-pointer group overflow-x-visible z-50 absolute top-6 -right-10"
            onClick={() => setCollapse(!collapse)}
          >
            <div className="w-6 h-[3px] rounded-full bg-background-orange my-1.5"></div>
            <div className="w-6 h-[3px]  bg-background-orange rounded-full my-1 group-hover:ms-1.5 transition-all duration-200"></div>
            <div className="w-6 h-[3px]  bg-background-orange rounded-full my-1.5"></div>
          </div>
        </div>
        <div className="flex-1 h-[100vh] relative">
          <div className="absolute top-0 left-0 w-full py-4 px-8 h-full bg-background-blue overflow-y-auto">
            <DesktopHeader />
            {page == "dashboard" && <Dashboard />}
            {page == "orders" && <Orders />}
            {page == "settings" && <Settings />}
            {page == "reviews" && <Review />}
            {page == "menu" && <MenuWrapper />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Desktop;
