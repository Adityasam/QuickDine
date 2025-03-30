import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { rupee, MENU_IMAGE_PATH } from "static/js/myjs";
import { getMenuDesktop } from "apis/menu";
import dummyfood from "static/img/food_dummy.png";
import Counter from "common/Counter";
import NewOrderDialog from "common/NewOrderDialog";
import NewOrderConfirm from "common/NewOrderConfirm";

const OrderMenu = ({ searchText = "", onNewOrder }) => {
  const [currentOrder, setCurrentOrder] = useState({
    items: {},
    code: "",
    note: "",
  });
  const [singleItemData, setSingleItemData] = useState({});
  const [askConfirm, setAskConfirm] = useState(false);

  const { data: menuList } = useQuery({
    queryKey: ["getMenuDesktop"],
    queryFn: getMenuDesktop,
  });

  function addOrderItem(menu) {
    if ("Options" in menu && menu.Options.length > 0) {
      setSingleItemData(menu);
    } else {
      const info = {
        quantity: 1,
        price: menu.Price,
        image: menu.Images.length > 0 ? menu.Images[0] : "",
        name: menu.Name,
      };
      currentOrder.items[menu.Code] = {};
      currentOrder.items[menu.Code]["info"] = info;
      setCurrentOrder({ ...currentOrder });
    }
  }

  function removeOrderItem(itemcode) {
    if (itemcode in currentOrder.items) {
      delete currentOrder.items[itemcode];
    }
    setCurrentOrder({ ...currentOrder });
  }

  function changeCount(itemcode, quantity) {
    if (quantity == 0) {
      removeOrderItem(itemcode);
      return;
    }

    currentOrder.items[itemcode].info.quantity = quantity;
    setCurrentOrder({ ...currentOrder });
  }

  function addItemtoCart(d, itemdata) {
    const info = {
      quantity: d.quantity,
      price: itemdata.Price,
      image: itemdata.Images.length > 0 ? itemdata.Images[0] : "",
      name: itemdata.Name,
    };
    currentOrder.items[itemdata.Code] = {};
    currentOrder.items[itemdata.Code].info = info;
    currentOrder.items[itemdata.Code].options = d.items;
    setCurrentOrder({ ...currentOrder });
    setSingleItemData({});
  }

  let orderTotal = 0;
  if ("items" in currentOrder) {
    Object.keys(currentOrder.items).forEach((itemkey) => {
      const item = currentOrder.items[itemkey];
      orderTotal += item.info.price;

      if ("options" in item) {
        Object.keys(item.options).forEach((groupkey) => {
          const group = item.options[groupkey];
          Object.keys(group).forEach((itemkey) => {
            const item = group[itemkey];
            orderTotal += item.price;
          });
        });
      }

      orderTotal *= item.info.quantity;
    });
  }

  function orderOnSubmit() {
    setSingleItemData({});
    setCurrentOrder({
      items: {},
      code: "",
      note: "",
    });
    setAskConfirm(false);
    onNewOrder();
  }

  return (
    <>
      {askConfirm && (
        <NewOrderConfirm
          onClose={() => setAskConfirm(false)}
          data={currentOrder}
          onSubmit={() => orderOnSubmit()}
        />
      )}
      {Object.keys(singleItemData).length > 0 && (
        <NewOrderDialog
          data={singleItemData}
          onClose={() => setSingleItemData({})}
          onSubmit={(d, itemdata) => addItemtoCart(d, itemdata)}
        />
      )}

      <div className="grid grid-cols-4 gap-4">
        {menuList &&
          menuList.map((menu) => {
            if (!menu.Name.toLowerCase().includes(searchText)) return;
            return (
              <div className="mt-2 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex align-baseline border-b mb-1 pb-1">
                  <h4 className="font-bold flex-1">{menu.Name}</h4>
                  <div>{rupee + " " + menu.Price}</div>
                </div>
                <div className="flex">
                  <div className="w-[30%] border-r pe-2">
                    <img
                      src={
                        menu.Images && menu.Images.length > 0
                          ? process.env.REACT_APP_PUBLIC_URL +
                            MENU_IMAGE_PATH +
                            "/" +
                            menu.Code +
                            "/" +
                            menu.Images[0]
                          : dummyfood
                      }
                    />
                  </div>
                  <div className="flex-1 flex justify-center items-center">
                    {menu.Code in currentOrder.items ? (
                      <div className="flex items-center w-full ps-2">
                        <div className="flex-1">
                          <Counter
                            defaultValue={
                              currentOrder.items[menu.Code].info.quantity
                            }
                            onChange={(c) => changeCount(menu.Code, c)}
                          />
                        </div>
                        <button
                          onClick={() => removeOrderItem(menu.Code)}
                          className="btn bg-red-500 text-sm text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addOrderItem(menu)}
                        className="btn bg-green-500 text-sm text-white"
                      >
                        Add To Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {/* Total Order Value */}
        {Object.keys(currentOrder.items).length > 0 && (
          <div className="fixed bottom-6 right-6 flex items-center">
            <div>
              <div className="flex items-baseline gap-2 shadow-xl rounded-l-full py-2 px-4 border-l border-t border-b -me-2">
                <div className="text-sm">Total Price</div>
                <div className="font-bold text-xl">
                  {rupee}
                  {orderTotal}
                </div>
              </div>
            </div>
            <div
              onClick={() => setAskConfirm(true)}
              className="w-16 cursor-pointer h-16 rounded-full bg-background-orange text-white border shadow-xl flex items-center justify-center z-10"
            >
              <Plus />
            </div>
          </div>
        )}
        {/* Total Order Value */}
      </div>
    </>
  );
};

export default OrderMenu;
