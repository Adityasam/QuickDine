import React, { useContext } from "react";
import { DesktopMainContext } from "providers/DesktopMainProvider";
import { ROLE_PAGES } from "static/js/myjs";
import {
  LayoutDashboard,
  ListCheck,
  SquareMenu,
  Star,
  Cog,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DesktopMenuItem from "./DesktopMenuItem";
import logosmall from "static/img/quick_logo.png";
import CustomTooltip from "./CustomTooltip";

const DesktopMenu = ({ collapse = false }) => {
  const { page } = useParams();
  const { userInfo } = useContext(DesktopMainContext);
  const allowed = ROLE_PAGES[userInfo?.role] || [];

  const menuItem = [
    {
      id: 1,
      title: "Dashboard",
      key: "dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 2,
      title: "Orders",
      key: "orders",
      icon: <ListCheck size={20} />,
    },
    {
      id: 3,
      title: "Menus",
      key: "menu",
      icon: <SquareMenu size={20} />,
    },
    {
      id: 4,
      title: "Reviews",
      key: "reviews",
      icon: <Star size={20} />,
    },
    {
      id: 5,
      title: "Settings",
      key: "settings",
      icon: <Cog size={20} />,
    },
  ];

  const selectedMenu = page || allowed[0];
  return (
    <>
      <div className="flex items-center p-4 mt-2 relative">
        <img
          alt="QuickDine"
          src={logosmall}
          className={`w-12 h-12 transition-all duration-500 border-2 rounded-full border-white absolute top-2 ${collapse ? "left-2" : "left-6"
            }`}
        />
        <div className="ps-16 transition-all duration-500 font-bold text-lg text-white flex-1">
          QuickDine
        </div>
      </div>
      <div
        className={`py-4 transition-all duration-500 ${collapse ? "ps-2" : "ps-8"
          }`}
      >
        {menuItem.filter((m) => allowed.includes(m.key)).map((m, index) => {
          if (collapse) {
            return (
              <CustomTooltip text={m.title} side="right" key={"menu_index_" + index}>
                <Link to={"/desktop/" + m.key}>
                  <DesktopMenuItem
                    key={"menu_" + m.key + "_" + index}
                    m={m}
                    collapse={collapse}
                    selectedMenu={selectedMenu}
                  />
                </Link>
              </CustomTooltip>
            );
          } else {
            return (
              <Link to={"/desktop/" + m.key} key={"menu_index_" + index}>
                <DesktopMenuItem
                  key={"menu_" + m.key + "_" + index}
                  m={m}
                  collapse={collapse}
                  selectedMenu={selectedMenu}
                />
              </Link>
            );
          }
        })}
      </div>
    </>
  );
};

export default DesktopMenu;
