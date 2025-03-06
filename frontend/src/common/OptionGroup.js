import React, { useContext } from "react";
import { MenuContext } from "providers/MenuProvider";
import Options from "./Options";
import OptionItem from "./OptionItem";
import { Trash2, PlusCircle } from "lucide-react";
import { randomString } from "static/js/myjs";
import CustomTooltip from "./CustomTooltip";

const OptionGroup = ({ data }) => {
  const { itemForm, setItemForm } = useContext(MenuContext);

  function removeGroup(id) {
    const newOp = itemForm.optionGroup.filter((itm) => itm.id != id);
    itemForm.optionGroup = newOp;
    setItemForm({ ...itemForm });
  }

  function updateKey(key, value) {
    itemForm.optionGroup.forEach((item) => {
      if (item.id == data.id) {
        item[key] = value;
      }
    });
    setItemForm({ ...itemForm });
  }

  function addItem() {
    itemForm.optionGroup.forEach((item) => {
      if (item.id == data.id) {
        const obj = {
          id: randomString(20),
          name: "",
          price: 0,
        };

        item.items.push(obj);
      }
    });

    setItemForm({ ...itemForm });
  }

  return (
    <>
      <div className="mb-4 border p-2 rounded-md">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1">
            <div className="text-xs mb-1">Group Title</div>
            <input
              onChange={(e) => updateKey("title", e.target.value)}
              type="text"
              className="w-full"
              placeholder="Group title..."
              value={data.title}
            />
          </div>
          <div>
            <div className="text-xs mb-1">Selection Type</div>
            <Options
              defaultValue={data.type}
              data={[
                { title: "Single", value: "single" },
                { title: "Multiple", value: "multi" },
              ]}
              onChange={(v) => updateKey("type", v)}
            />
          </div>
          {data.type == "multi" && (
            <div>
              <div className="text-xs mb-1">Max Selections</div>
              <input
                type="number"
                className="w-20"
                min={0}
                step={1}
                value={data.maxSelection}
                onChange={(e) => updateKey("maxSelection", e.target.value)}
              />
            </div>
          )}
          <div>
            <div className="text-xs mb-1 opacity-0">Action</div>
            <CustomTooltip text={"Delete Group"}>
              <Trash2
                className="text-red-500 cursor-pointer"
                size={20}
                onClick={() => removeGroup(data.id)}
              />
            </CustomTooltip>
          </div>
          <div>
            <div className="text-xs mb-1 opacity-0">Action</div>
            <CustomTooltip text={"Add Items"}>
              <PlusCircle
                size={20}
                onClick={() => addItem()}
                className="text-green-500 cursor-pointer"
              />
            </CustomTooltip>
          </div>
        </div>

        {/* Options */}
        <div className="ps-2">
          {data.items.map((item, index) => (
            <OptionItem data={item} key={"index_" + data.id + "_" + index} />
          ))}
        </div>
      </div>
    </>
  );
};

export default OptionGroup;
