import { money, imageUrl } from "static/js/myjs";
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
    if (max == 1) {
      // single choice: picking another option swaps it
      orderForm.items[Code].options[groupCode] = {};
    } else if (Object.keys(orderForm.items[Code].options[groupCode]).length >= max) {
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
      onClick={(e) => e.target === e.currentTarget && closeOptions()}
      className={`${
        open ? "bg-[#00000050] pointer-events-auto" : "pointer-events-none"
      } fixed overflow-y-auto top-0 left-0 w-full h-full transition-all duration-500 z-20`}
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
        <button
          aria-label="Close"
          onClick={() => closeOptions()}
          className="absolute -top-10 right-2 bg-white rounded-full text-gray-700 p-1.5 shadow-md"
        >
          <X size={18} />
        </button>
        <div className="grid border-b grid-cols-5 gap-2 items-center pt-4">
          <div className="col-span-2 border-r">
            {itemData ? (
              <img
                alt={itemData.data.Name}
                className="rounded-lg"
                src={itemData.images.length > 0 ? imageUrl(Code, itemData.images[0]) : dummyfood}
              />
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
            )}
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
                  {op.MaxSelection == 1
                    ? "Choose 1"
                    : `Choose up to ${op.MaxSelection}`}
                </div>
              </div>
              <div className="mt-4">
                {"Options" in op &&
                  op.Options.map((item, index) => (
                    <label
                      key={index}
                      htmlFor={"haveIt_" + op.Code + "_" + index}
                      className="flex gap-3 items-center mb-1 text-sm py-1.5 cursor-pointer"
                    >
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
                        className="!w-4 h-4 accent-orange-400"
                      />
                      <span className="flex-1">{item.Name}</span>
                      <span className="text-gray-600">
                        {item.Price > 0 ? "+ " + money(item.Price) : "Free"}
                      </span>
                    </label>
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
          value={orderForm.items[Code]?.info.quantity ?? 1}
          minValue={1}
          onChange={(val) => changeQuantity(val)}
        />
        <button
          disabled={!itemData}
          onClick={() => onClose(false)}
          className="ms-6 btn flex-1 bg-background-orange font-bold py-2 disabled:opacity-50"
        >
          Add to cart · {money(optionPrice)}
        </button>
      </div>
    </div>
  );
};

export default Options;
