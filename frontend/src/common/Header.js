import React, { useEffect, useState } from "react";
import { CookingPot, List } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MainContext } from "providers/MainProvider";

const Header = ({ icon, title = "QuickDine" }) => {
  const navigate = useNavigate();
  const { userOrders } = useContext(MainContext);
  const [activeOrders, setActiveOrders] = useState(0);

  useEffect(() => {
    if (userOrders) {
      const active = userOrders.filter((o) => o.Status == "A");
      setActiveOrders(active.length);
    }
  }, [userOrders]);
  return (
    <>
      <div className="flex px-4 py-4 items-center">
        {sessionStorage.getItem("TABLENO") && (
          <div className="flex-1 flex items-baseline">
            <div className="inline-block border border-red-500 px-2 rounded-full shadow-xl bg-background-orange">
              <div className="text-xs inline-block me-2">Table</div>
              <div className="font-bold text-xl inline-block">
                {sessionStorage.getItem("TABLENO")}
              </div>
            </div>
          </div>
        )}
        <div className="text-center text-2xl font-bold flex-1 overflow-x-visible whitespace-nowrap">
          {title}
        </div>
        <div className="relative flex-1 flex justify-end">
          {sessionStorage.getItem("TABLENO") && icon == "order" && (
            <CookingPot onClick={() => navigate("/myorders")} />
          )}
          {sessionStorage.getItem("TABLENO") &&
            activeOrders > 0 &&
            icon == "order" && (
              <div
                className="absolute pointer-events-none top-0 right-0 bg-red-500 text-white shadow-xl border border-white rounded-full 
            text-xs w-4 h-4 flex justify-center items-center font-bold -mt-2 -me-2"
              >
                {activeOrders}
              </div>
            )}
          {icon == "menu" && <List onClick={() => navigate("/")} />}
        </div>
      </div>
    </>
  );
};

export default Header;
