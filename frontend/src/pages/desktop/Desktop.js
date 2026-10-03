import { useState } from "react";
import DesktopMenu from "common/DesktopMenu";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Settings from "./Settings";
import Menu from "./Menu";
import { MenuProvider } from "providers/MenuProvider";
import DesktopHeader from "common/DesktopHeader";
import Review from "./Review";

import { useParams, useNavigate } from "react-router-dom";
import { DesktopMainContext } from "providers/DesktopMainProvider";
import { useContext, useEffect } from "react";
import { ROLE_PAGES } from "static/js/myjs";

const Desktop = () => {
  let { page } = useParams();
  const [collapse, setCollapse] = useState(false);
  const { isLoggedIn, authLoading, userInfo } = useContext(DesktopMainContext);
  const navigate = useNavigate();
  const allowed = ROLE_PAGES[userInfo?.role] || [];
  page = page || allowed[0];

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login");
    } else if (isLoggedIn && !allowed.includes(page)) {
      navigate("/desktop/" + allowed[0], { replace: true });
    }
  }, [isLoggedIn, authLoading, navigate, page]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-blue">
        <div className="text-background-orange text-2xl font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !allowed.includes(page)) {
    return null;
  }

  return (
    <>
      <div className="flex">
        <div
          className={`relative transition-all duration-500 ${collapse ? "w-16" : "w-60"
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
            {page == "menu" && (
              <MenuProvider>
                <Menu />
              </MenuProvider>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Desktop;
