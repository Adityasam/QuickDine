import Dialog from "common/Dialog";
import { rupee } from "static/js/myjs";
import { Plus } from "lucide-react";
import { useState } from "react";
import Counter from "./Counter";

const NewOrderDialog = ({ data, onClose, onSubmit }) => {
  const [itemOptions, setItemOptions] = useState({
    items: {},
    quantity: 1,
  });

  function addOptions(option, group) {
    if (
      group.Code in itemOptions.items &&
      option.Code in itemOptions.items[group.Code]
    ) {
      delete itemOptions.items[group.Code][option.Code];
      setItemOptions({ ...itemOptions });
    } else {
      const info = {
        name: option.Name,
        price: option.Price,
      };
      if (group.Code in itemOptions.items == false) {
        itemOptions.items[group.Code] = {};
      }
      itemOptions.items[group.Code][option.Code] = info;
      setItemOptions({ ...itemOptions });
    }
  }

  let optionPrice = data.Price;
  Object.keys(itemOptions.items).forEach((groupkey) => {
    const group = itemOptions.items[groupkey];
    Object.keys(group).forEach((itemkey) => {
      optionPrice += group[itemkey].price;
    });
  });

  function updateQuantity(q) {
    if (q == 0) {
      onClose();
    } else {
      itemOptions.quantity = q;
      setItemOptions({ ...itemOptions });
    }
  }

  function submitItem() {
    onSubmit(itemOptions, data);
  }

  return (
    <>
      <Dialog title={data ? data.Name : ""} open={true} onClose={onClose}>
        <div>
          {data && (
            <div>
              <div className="flex gap-2">
                <div>
                  {"Options" in data &&
                    data.Options.map((op, ip) => {
                      return (
                        <div key={ip} className="mb-4 select-none">
                          <div className="mb-2 font-bold underline underline-offset-2 decoration-gray-400">
                            {op.Name}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {op.Options.map((o, i) => {
                              return (
                                <div
                                  onClick={() => addOptions(o, op)}
                                  key={i}
                                  className={`flex flex-col gap-2 cursor-pointer shadow-xl rounded-md p-2 border ${
                                    op.Code in itemOptions.items &&
                                    o.Code in itemOptions.items[op.Code]
                                      ? "bg-background-orange text-white"
                                      : ""
                                  }`}
                                >
                                  <div>{o.Name}</div>
                                  <div className="font-bold text-xl">
                                    {rupee}
                                    {o.Price}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t flex gap-4 pt-4 mt-4 items-center">
                <div>
                  <span className="pe-2">Item Net Price</span>
                  <span className="font-bold text-xl">
                    {rupee + "" + optionPrice * itemOptions.quantity}
                  </span>
                </div>
                <div className="flex-1 pe-4 justify-end flex gap-2">
                  <span>Quantity</span>
                  <Counter
                    onChange={(q) => updateQuantity(q)}
                    defaultValue={itemOptions.quantity}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => submitItem()}
                    className="btn bg-green-500 px-4 py-2 rounded-md text-white flex gap-2 items-center shadow-xl cursor-pointer"
                  >
                    <Plus size={20} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              {/* Footer */}
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default NewOrderDialog;
