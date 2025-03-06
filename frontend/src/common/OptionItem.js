import React, { useContext } from "react";
import { MenuContext } from "providers/MenuProvider";
import { Forward, XCircle } from "lucide-react";
import CustomTooltip from "./CustomTooltip";

const OptionItem = ({ data }) => {
  const { itemForm, setItemForm } = useContext(MenuContext);

  function removeItem() {
    itemForm.optionGroup.forEach((item) => {
      const nitem = item.items.filter((i) => i.id != data.id);
      item.items = nitem;
    });
    setItemForm({ ...itemForm });
  }

  function updateKey(key, value) {
    itemForm.optionGroup.forEach((item) => {
      item.items.forEach((it) => {
        if (it.id == data.id) {
          it[key] = value;
        }
      });
    });
    setItemForm({ ...itemForm });
  }

  return (
    <>
      <div className="mb-2">
        <div className="flex gap-4 items-center">
          <div>
            <div className="text-xs mb-1 opacity-0">O</div>
            <Forward className="-scale-y-100" />
          </div>
          <div className="flex-1">
            <div className="text-xs mb-1">Option Title</div>
            <input
              type="text"
              value={data.name}
              className="w-full"
              placeholder="Option Title..."
              onChange={(e) => updateKey("name", e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs mb-1">Price</div>
            <input
              type="number"
              value={data.price}
              min={0}
              onChange={(e) => updateKey("price", e.target.value)}
              className="w-24"
            />
          </div>
          <div>
            <div className="text-xs mb-1 opacity-0">Price</div>
            <CustomTooltip text={"Delete Item"}>
              <XCircle
                onClick={() => removeItem()}
                size={20}
                className="text-red-500 cursor-pointer"
              />
            </CustomTooltip>
          </div>
        </div>
      </div>
    </>
  );
};

export default OptionItem;
