import React, { useState } from "react";
import {
  LayoutDashboard,
  ListCheck,
  SquareMenu,
  Star,
  Cog,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DesktopMenuItem from "./DesktopMenuItem";
import logosmall from "static/img/logosmall.png";
import CustomTooltip from "./CustomTooltip";

const DesktopMenu = ({ collapse = false }) => {
  const { page } = useParams();

  const menuItem = [
    {
      title: "Dashboard",
      key: "dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: "Orders",
      key: "orders",
      icon: <ListCheck size={20} />,
    },
    {
      title: "Menus Items",
      key: "menu",
      icon: <SquareMenu size={20} />,
    },
    {
      title: "Reviews",
      key: "reviews",
      icon: <Star size={20} />,
    },
    {
      title: "Settings",
      key: "settings",
      icon: <Cog size={20} />,
    },
  ];

  const [selectedMenu, setSelectedMenu] = useState(page || "dashboard");
  return (
    <>
      <div className="flex items-center p-4 mt-2 relative">
        <img
          src={logosmall}
          className={`w-12 h-12 transition-all duration-500 border-4 rounded-full border-white absolute top-2 ${
            collapse ? "left-2" : "left-6"
          }`}
        />
        <div className="ps-16 transition-all duration-500 font-bold text-lg text-white flex-1">
          QuickDine
        </div>
      </div>
      <div
        className={`py-4 transition-all duration-500 ${
          collapse ? "ps-2" : "ps-8"
        }`}
      >
        {menuItem.map((m, index) => {
          if (collapse) {
            return (
              <CustomTooltip text={m.title} side="right">
                <Link to={"/desktop/" + m.key} key={"menu_index_" + index}>
                  <DesktopMenuItem
                    key={"menu_" + m.key + "_" + index}
                    m={m}
                    collapse={collapse}
                    setSelectedMenu={(e) => setSelectedMenu(e)}
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
                  setSelectedMenu={(e) => setSelectedMenu(e)}
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
