import { rupee, MENU_IMAGE_PATH } from "static/js/myjs";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import Counter from "common/Counter";
import { X } from "lucide-react";
import { useEffect } from "react";
import { getSingleMenuItem } from "apis/menu";
import { OrderContext, itemDefault } from "providers/OrderProvider";
import { toast } from "react-toastify";
import dummyfood from "static/img/food_dummy.png";

const Options = ({ Code, open, onClose }) => {
  const { orderForm, setOrderForm } = useContext(OrderContext);

  const { data: itemData } = useQuery({
    queryKey: ["getSingleMenuItem", Code],
    queryFn: getSingleMenuItem,
  });

  useEffect(() => {
    if (itemData) {
      if (Code in orderForm.items == false) {
        const copy = structuredClone(itemDefault);
        orderForm.items[Code] = copy;
      }
      orderForm.items[Code].info.price = itemData.data.Price;
      orderForm.items[Code].info.name = itemData.data.Name;
      orderForm.items[Code].info.image =
        itemData.images.length > 0 ? itemData.images[0] : "";
      setOrderForm({ ...orderForm });
    }
  }, [itemData]);

  function addOption(code, price, groupCode, name) {
    if (groupCode in orderForm.items[Code].options == false) {
      orderForm.items[Code].options[groupCode] = {};
    }
    const max = itemData
      ? itemData.options.find((op) => op.Code == groupCode).MaxSelection
      : 99999;
    if (Object.keys(orderForm.items[Code].options[groupCode]).length >= max) {
      toast.error("Max " + max + " items allowed", { autoClose: 1000 });
      return;
    }
    orderForm.items[Code].options[groupCode][code] = {
      price: price,
      name: name,
    };
    setOrderForm({ ...orderForm });
  }

  function removeOption(code, groupCode) {
    delete orderForm.items[Code].options[groupCode][code];
    setOrderForm({ ...orderForm });
  }

  function changeQuantity(val) {
    if (val == 0) {
      const items = orderForm.items;
      delete items[Code];
      setOrderForm({ ...orderForm, items: items });
      onClose();
      return;
    }
    if (Code in orderForm.items == false) {
      orderForm.items[Code] = structuredClone(itemDefault);
    }
    orderForm.items[Code].info.quantity = val;
    setOrderForm({ ...orderForm });
  }

  function closeOptions() {
    changeQuantity(0);
  }

  let optionPrice = itemData ? itemData.data.Price : 0;
  if (Code in orderForm.items) {
    const qt = orderForm.items[Code].info.quantity;
    Object.keys(orderForm.items[Code].options).forEach((group) => {
      Object.keys(orderForm.items[Code].options[group]).forEach((option) => {
        optionPrice += orderForm.items[Code].options[group][option].price;
      });
    });
    optionPrice *= qt;
  }

  return (
    <div
      className={`${
        open ? "bg-[#00000050] pointer-events-auto" : "pointer-events-none"
      } fixed overflow-y-auto top-0 left-0 w-full h-full transition-all duration-500`}
    >
      <div
        className={`${
          open ? "bottom-0" : "-bottom-full"
        } fixed left-0 w-full max-h-[50vh] bg-white transition-all duration-500`}
      ></div>
      <div
        className={`${
          open ? "bottom-0" : "-bottom-full"
        } absolute transition-all duration-500 rounded-t-3xl left-0 w-full px-4 bg-white max-h-[70vh] z-10`}
      >
        <X
          className="absolute -top-8 right-2 bg-red-500 rounded-full text-white p-1"
          size={22}
          onClick={() => closeOptions()}
        />
        <div className="grid border-b grid-cols-5 gap-2 items-center pt-4">
          <div className="col-span-2 border-r">
            <img
              src={
                itemData && itemData.images.length > 0
                  ? process.env.REACT_APP_PUBLIC_URL +
                    MENU_IMAGE_PATH +
                    "/" +
                    Code +
                    "/" +
                    itemData.images[0]
                  : dummyfood
              }
            />
          </div>
          <div className="col-span-3 text-left">
            <div className="font-bold mb-1">
              {itemData && itemData.data.Name}
            </div>
            <div className="text-xs text-gray-500">
              {itemData && itemData.data.Description}
            </div>
          </div>
        </div>

        {itemData &&
          itemData.options.map((op, ind) => (
            <div key={ind}>
              <div className="mt-2">
                <div className="font-semibold">{op.Name}</div>
                <div className="text-xs text-gray-500">
                  You can choose upto {op.MaxSelection} options
                </div>
              </div>
              <div className="mt-4">
                {"Options" in op &&
                  op.Options.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2 text-sm">
                      <input
                        onChange={(v) => {
                          const chk = v.target.checked;
                          if (chk) {
                            addOption(
                              item.Code,
                              item.Price,
                              op.Code,
                              item.Name
                            );
                          } else {
                            removeOption(item.Code, op.Code);
                          }
                        }}
                        checked={
                          "items" in orderForm &&
                          Code in orderForm.items &&
                          op.Code in orderForm.items[Code].options &&
                          item.Code in orderForm.items[Code].options[op.Code]
                        }
                        id={"haveIt_" + op.Code + "_" + index}
                        type="checkbox"
                      />
                      <label
                        className="flex-1"
                        htmlFor={"haveIt_" + op.Code + "_" + index}
                      >
                        {item.Name}
                      </label>
                      <span>{rupee + " " + item.Price}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}

        {/* Filler */}
        <div className="h-14"></div>
      </div>

      {/* Bottom Buttons */}
      <div
        className={`${
          open ? "bottom-0" : "-bottom-full"
        } z-10 flex shadow-up transition-all duration-500 fixed left-0 w-full bg-white px-4 py-2`}
      >
        <Counter
          defaultValue={
            Code in orderForm ? orderForm.items[Code].info.quantity : 1
          }
          minValue={0}
          onChange={(val) => changeQuantity(val)}
        />
        <button
          onClick={() => onClose(false)}
          className="ms-10 btn flex-1 bg-background-orange"
        >
          Add {rupee} {optionPrice}
        </button>
      </div>
    </div>
  );
};

export default Options;
