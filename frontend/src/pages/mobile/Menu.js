import React, { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { money, imageUrl, getTotalAmount } from "static/js/myjs";
import Options from "./Options";
import Cart from "./Cart";
import Header from "common/Header";
import { getMenuMobile, getCategory } from "apis/menu";
import { OrderContext } from "providers/OrderProvider";
import Counter from "common/Counter";
import { useSearchParams } from "react-router-dom";
import { QrCode, Search, ShoppingBag, X } from "lucide-react";
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

  const { data: menuData, isLoading } = useQuery({
    queryKey: ["getMenuMobile"],
    queryFn: getMenuMobile,
  });

  const [activeMenu, setActiveFilter] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");

  function updateItemQuantity(code, val) {
    if (val <= 0) {
      delete orderForm.items[code];
      setOrderForm({ ...orderForm });
      return;
    }
    orderForm.items[code].info.quantity = val;
    setOrderForm({ ...orderForm });
  }

  const totalPrice = getTotalAmount(orderForm);
  const cartItems = Object.values(orderForm.items);
  const totalQty = cartItems.reduce((s, i) => s + i.info.quantity, 0);

  React.useEffect(() => {
    if (showCart && cartItems.length === 0) {
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

  const q = search.trim().toLowerCase();
  const visibleItems = (menuData || []).filter(
    (item) =>
      !q ||
      item.Name?.toLowerCase().includes(q) ||
      item.Description?.toLowerCase().includes(q) ||
      item.Tags?.toLowerCase().includes(q)
  );
  // Only show categories that actually have items to tap on
  const categories = (categoryList || []).filter((c) =>
    visibleItems.some((i) => i.CategoryCode === c.Code)
  );

  return (
    <>
      <div className="mainBg"></div>
      <Header icon="order" title="Menu" />
      {!sessionStorage.getItem("TABLENO") ? (
        <div className="bg-background-blue min-h-[90vh] overflow-y-auto flex justify-center items-center shadow-lg rounded-t-3xl noScroll">
          <div className="text-xl text-center px-6">
            <div>Please scan the QR code on your table to view the menu</div>
            <QrCode className="mx-auto mt-10" size={60} />
          </div>
        </div>
      ) : (
        <div className="bg-background-blue min-h-[90vh] shadow-lg rounded-t-3xl mx-2 pb-24">
          {/* Search + categories */}
          <div className="sticky top-0 z-[5] bg-background-blue rounded-t-3xl shadow-md">
            <div className="px-4 pt-4 relative">
              <Search size={16} className="absolute left-7 top-[calc(50%+8px)] -translate-y-2/4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes..."
                className="!rounded-full !ps-9 !py-2 bg-white"
              />
              {search && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-7 top-[calc(50%+8px)] -translate-y-2/4 text-gray-400"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="topMenu p-4 overflow-x-auto whitespace-nowrap">
              {categories.map((item, index) => (
                <button
                  key={item.Code}
                  onClick={() => scrollToCategory(item.Code)}
                  className={`${item.Code === activeMenu || (index === 0 && activeMenu === "")
                    ? "bg-background-orange border-background-orange"
                    : "bg-white"
                    } me-2 border transition-all duration-200 inline-block rounded-full px-4 py-1 shadow-sm font-semibold text-sm`}
                >
                  {item.Name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Cards */}
          <div className="p-4">
            {isLoading &&
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white/70 rounded-xl mb-4 animate-pulse" />
              ))}

            {!isLoading && visibleItems.length === 0 && (
              <div className="text-center text-gray-500 py-16">
                {q ? `No dishes match "${search}"` : "Menu is empty right now"}
              </div>
            )}

            {categories.map((category) => (
              <div key={category.Code} className={`${category.Code}_area scroll-mt-32`}>
                <div className="font-bold text-sm mb-2 mt-1 text-gray-700">{category.Name}</div>
                {visibleItems
                  .filter((item) => item.CategoryCode === category.Code)
                  .map((item) => (
                    <div
                      key={item.Code}
                      className="w-full shadow-sm items-center bg-white rounded-xl mb-4 grid grid-cols-10 overflow-hidden"
                    >
                      <div className="col-span-3 h-full">
                        <img
                          src={item.Images?.length > 0 ? imageUrl(item.Code, item.Images[0]) : dummyfood}
                          alt={item.Name}
                          loading="lazy"
                          className="w-full h-full object-cover aspect-square"
                        />
                      </div>
                      <div className="col-span-7 px-3 py-3 text-sm">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="font-bold">{item.Name}</div>
                            <div className="font-semibold">{money(item.Price)}</div>
                          </div>
                          <div>
                            {item.Code in orderForm.items ? (
                              <Counter
                                value={orderForm.items[item.Code].info.quantity}
                                onChange={(val) => updateItemQuantity(item.Code, val)}
                              />
                            ) : (
                              <button
                                onClick={() => setItemCode(item.Code)}
                                className="border-2 border-background-orange text-gray-800 font-bold px-4 py-1 rounded-lg active:scale-95 transition-transform"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.Description}</div>
                        {item.PreparationTime > 0 && (
                          <div className="text-[10px] text-gray-400 mt-1">~{item.PreparationTime} min</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Total Footer */}
      {cartItems.length > 0 && (
        <div className="flex items-center shadow-up fixed bottom-0 left-0 w-full bg-background-orange px-4 py-3 z-[6]">
          <div>
            <div className="text-xs font-semibold">
              {totalQty} {totalQty === 1 ? "item" : "items"}
            </div>
            <div className="font-bold">{money(totalPrice)}</div>
          </div>
          <div className="flex-1 text-end">
            <button
              onClick={() => setShowCart(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg active:scale-95 transition-transform"
            >
              <ShoppingBag size={16} />
              View cart
            </button>
          </div>
        </div>
      )}

      {/* Options */}
      {itemCode !== "" && (
        <Options Code={itemCode} open={true} onClose={() => setItemCode("")} />
      )}

      {/* Cart */}
      <Cart open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Menu;
