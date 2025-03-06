import React, { useState, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { rupee, MENU_IMAGE_PATH, getTotalAmount } from "static/js/myjs";
import Options from "./Options";
import Cart from "./Cart";
import Header from "common/Header";
import { getMenuMobile, getCategory } from "apis/menu";
import { OrderContext } from "providers/OrderProvider";
import Counter from "common/Counter";
import { useSearchParams } from "react-router-dom";
import { QrCode } from "lucide-react";
import dummyfood from "static/img/food_dummy.png";

const Menu = () => {
  const { orderForm, setOrderForm } = useContext(OrderContext);
  const [searchparam] = useSearchParams();

  const tableno = searchparam.get("table");

  if (tableno) {
    sessionStorage.setItem("TABLENO", tableno);
  }

  const { data: categoryList } = useQuery({
    queryKey: ["getCategory"],
    queryFn: getCategory,
  });

  const { data: menuData } = useQuery({
    queryKey: ["getMenuMobile"],
    queryFn: getMenuMobile,
  });

  const [activeMenu, setActiveFilter] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [showCart, setShowCart] = useState(false);

  function updateItemQuantity(code, val) {
    if (val <= 0) {
      delete orderForm.items[code];
      setOrderForm({ ...orderForm });
      return;
    }
    orderForm.items[code].info.quantity = val;
    setOrderForm({ ...orderForm });
  }

  let totalPrice = getTotalAmount(orderForm);
  React.useEffect(() => {
    if (showCart && Object.keys(orderForm.items).length == 0) {
      setShowCart(false);
    }
  }, [orderForm]);

  function scrollToCategory(code) {
    const area = document.querySelector("." + code + "_area");
    if (area) {
      area.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveFilter(code);
  }

  return (
    <>
      <div className="mainBg"></div>
      <Header icon="order" title="Menu" />
      {!sessionStorage.getItem("TABLENO") ? (
        <div className="bg-background-blue min-h-[90vh] overflow-y-auto flex justify-center items-center shadow-lg rounded-t-3xl noScroll">
          <div className="text-xl text-center">
            <div>Please scan the QR code on table to view menu</div>
            <QrCode className="mx-auto mt-10" size={60} />
          </div>
        </div>
      ) : (
        <div className="bg-background-blue min-h-[90vh] overflow-y-auto shadow-lg rounded-t-3xl noScroll mx-2">
          {/* Top Menu */}
          <div className="topMenu p-4 shadow-xl sticky bg-background-blue top-0 overflow-x-auto whitespace-nowrap">
            {categoryList &&
              categoryList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => scrollToCategory(item.Code)}
                  className={`${
                    (activeMenu != "" && item.Code == activeMenu) ||
                    (index == 0 && activeMenu == "")
                      ? "bg-background-orange text-white"
                      : ""
                  } me-2 border transition-all duration-200 inline-block rounded-full px-4 py-1 shadow-xl`}
                >
                  {item.Name}
                </div>
              ))}
          </div>

          {/* Menu Cards */}
          <div className="flex-1 overflow-y-auto p-4">
            {categoryList &&
              categoryList.map((category, ind) => (
                <div key={"cat_" + ind}>
                  {menuData &&
                    menuData.filter(
                      (item) => category.Code == item.CategoryCode
                    ).length > 0 && (
                      <div
                        className={`font-semibold text-sm mb-1 ${category.Code}_area`}
                      >
                        {category.Name}
                      </div>
                    )}
                  {menuData &&
                    menuData.map((item, index) => {
                      if (item.CategoryCode == category.Code) {
                        return (
                          <div
                            key={index}
                            className="w-full shadow items-center bg-white rounded-xl mb-4 grid grid-cols-10"
                          >
                            <div className="col-span-3 border-r p-1">
                              <img
                                src={
                                  "Images" in item && item.Images.length > 0
                                    ? process.env.REACT_APP_PUBLIC_URL +
                                      MENU_IMAGE_PATH +
                                      "/" +
                                      item.Code +
                                      "/" +
                                      item.Images[0]
                                    : dummyfood
                                }
                                className="object-contain"
                              />
                            </div>
                            <div className="col-span-7 px-3 py-4 text-sm">
                              <div className="flex">
                                <div className="flex-1">
                                  <div className="font-bold">{item.Name}</div>
                                  <div>
                                    {rupee} {item.Price}
                                  </div>
                                </div>
                                <div>
                                  {item.Code in orderForm.items ? (
                                    <Counter
                                      defaultValue={
                                        orderForm.items[item.Code].info.quantity
                                      }
                                      onChange={(val) =>
                                        updateItemQuantity(item.Code, val)
                                      }
                                    />
                                  ) : (
                                    <div
                                      onClick={() => {
                                        setItemCode(item.Code);
                                      }}
                                      className="border-2 px-2 py-0.5 rounded-md"
                                    >
                                      Add
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.Description}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Total Footer */}
      {Object.keys(orderForm.items).length > 0 && (
        <div
          className={`flex shadow-up fixed bottom-0 left-0 w-full bg-background-orange px-4 py-2`}
        >
          <div>
            <div className="text-xs font-semibold">
              {Object.keys(orderForm.items).length}{" "}
              {Object.keys(orderForm.items).length == 1 ? "Item" : "Items"}
            </div>
            <div className="text-sm">
              Total {rupee} <span className="font-bold">{totalPrice}</span>
            </div>
          </div>
          <div className="flex-1 text-end">
            <button
              onClick={() => setShowCart(true)}
              className="ms-10 btn border border-gray-500"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Options */}
      {itemCode != "" && (
        <Options Code={itemCode} open={true} onClose={() => setItemCode("")} />
      )}

      {/* Cart */}
      <Cart open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Menu;
