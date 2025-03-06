import React, { useRef, useContext, useEffect } from "react";
import { ImagePlus, X, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Dialog from "common/Dialog";
import OptionGroup from "common/OptionGroup";
import { randomString, urlToFile, MENU_IMAGE_PATH } from "static/js/myjs";
import { MenuContext } from "providers/MenuProvider";
import CustomTooltip from "common/CustomTooltip";
import { toast } from "react-toastify";
import { getCategory, saveMenuItem, getSingleMenuItem } from "apis/menu";
import CustomToggle from "./CustomToggle";

const MenuItemDialog = ({ itemCode = "", open, onClose }) => {
  const { itemForm, setItemForm } = useContext(MenuContext);
  const tagRef = useRef(null);

  const { data: categories } = useQuery({
    queryKey: ["getCategory"],
    queryFn: getCategory,
  });

  const { data: menuDetail } = useQuery({
    queryKey: ["getSingleMenuItem", itemCode],
    queryFn: getSingleMenuItem,
    enabled: itemCode != "",
  });

  useEffect(() => {
    if (menuDetail) {
      async function setData() {
        const temp = {};
        temp.code = menuDetail.data.Code;
        temp.images = [];
        temp.name = menuDetail.data.Name;
        temp.available = menuDetail.data.Available ? "1" : "0";
        temp.description = menuDetail.data.Description;
        temp.category = menuDetail.data.CategoryCode;
        temp.price = menuDetail.data.Price;
        temp.tags = menuDetail.data.Tags ? menuDetail.data.Tags.split(",") : [];
        temp.prepTime = menuDetail.data.PreparationTime;

        const dt = new DataTransfer();

        async function processImage(img) {
          const newFile = await urlToFile(
            process.env.REACT_APP_PUBLIC_URL +
              MENU_IMAGE_PATH +
              "/" +
              itemCode +
              "/" +
              img,
            img
          );
          if (newFile) {
            dt.items.add(newFile);
            temp.images.push(newFile);
            imageFileRef.current.files = dt.files;
          }
        }

        for (const img of menuDetail.images) {
          await processImage(img);
        }

        const tempOG = [];
        menuDetail.options.forEach((m) => {
          const tempOps = [];
          m.Options.forEach((op) => {
            tempOps.push({
              id: randomString(20),
              code: op.Code,
              name: op.Name,
              price: op.Price,
            });
          });

          tempOG.push({
            id: randomString(20),
            code: m.Code,
            title: m.Name,
            type: m.SelectionType,
            maxSelection: m.MaxSelection,
            items: tempOps,
          });
        });

        temp.optionGroup = tempOG;

        setItemForm(temp);
      }

      setData(menuDetail);
    }
  }, [menuDetail]);

  const imageFileRef = useRef(null);

  function fileChanged() {
    const temp = [];
    const fls = imageFileRef.current;
    if (fls) {
      for (let i = 0; i < fls.files.length; i++) {
        temp.push(fls.files[i]);
      }
      itemForm.images = [...itemForm.images, ...temp];
      setItemForm({ ...itemForm });
    }
  }

  function removeImage(index) {
    const items = itemForm.images.filter((_, ind) => ind != index);
    itemForm.images = items;
    setItemForm({ ...itemForm });
  }

  function addOptionGroup() {
    const newOp = {
      id: randomString(20),
      title: "",
      type: "single",
      maxSelection: 1,
      items: [],
    };
    itemForm.optionGroup.push(newOp);
    setItemForm({ ...itemForm });
  }

  function updateKey(key, value) {
    itemForm[key] = value;
    setItemForm({ ...itemForm });
  }

  const saveMutation = useMutation({
    mutationFn: saveMenuItem,
    onSuccess: (d) => {
      console.log(d);
      if (itemCode == "") {
        toast.success("Menu item created");
      } else {
        toast.success("Menu item updated");
      }
      onClose();
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  function save_menu_item(e) {
    const fd = new FormData();
    fd.append("data", JSON.stringify(itemForm));

    itemForm.images.forEach((img, index) => {
      fd.append(`image_${index}`, img);
    });
    saveMutation.mutate(fd);
  }

  function addTag(e) {
    if (e.key == "Enter") {
      const tags = itemForm.tags;
      const newTag = e.target.value.trim();
      if (tags.includes(newTag)) {
        toast.error("Tag already exists");
      } else {
        tags.push(newTag);
        updateKey("tags", tags);
        tagRef.current.value = "";
      }
    }
  }

  function removeTag(tag) {
    const newTags = itemForm.tags.filter((t) => t != tag);
    updateKey("tags", newTags);
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} title="Add Menu">
        <div className="max-w-[40vw] max-h-[70vh] overflow-y-auto overflow-x-hidden flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="file"
              accept="images/*"
              onChange={() => fileChanged()}
              ref={imageFileRef}
              hidden
              multiple
            />
            <div
              onClick={() => imageFileRef.current.click()}
              className="flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-background-orange hover:text-background-orange transition-all divide-purple-200 justify-center w-24 h-24 border rounded-md"
            >
              <ImagePlus />
              <div className="text-sm mt-2">Add Images</div>
            </div>
            <div className="flex-1">
              <div className="w-full overflow-x-auto noScroll">
                {itemForm.images.map((fl, index) => {
                  return (
                    <div
                      key={index}
                      className="relative inline-block mr-4 h-24 w-24 me-2"
                    >
                      <img
                        className="object-contain border rounded-md"
                        src={URL.createObjectURL(fl)}
                      />
                      <X
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 cursor-pointer bg-white shadow-md rounded-full p-0.5"
                        size={18}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 text-md font-semibold">
              <div className="border-b inline-block pe-4">Item Details</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs mb-1">Item Name</div>
              <input
                type="text"
                className="w-full"
                value={itemForm.name}
                onChange={(e) => updateKey("name", e.target.value)}
                placeholder="Enter item name..."
              />
            </div>
            <div className="col-span-2">
              <div className="text-xs mb-1">Category</div>
              <select
                value={itemForm.category}
                placeholder="Select category..."
                className="w-full"
                onChange={(e) => updateKey("category", e.target.value)}
              >
                <option value="">--Select Category--</option>
                {categories &&
                  categories.map((d, index) => (
                    <option key={index} value={d.Code}>
                      {d.Name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-span-2">
              <div className="text-xs mb-1">Description</div>
              <textarea
                className="w-full"
                value={itemForm.description}
                onChange={(e) => updateKey("description", e.target.value)}
              ></textarea>
            </div>
            <div className="col-span-1">
              <div className="text-xs mb-1">Price</div>
              <input
                type="number"
                min={0}
                value={itemForm.price}
                className="w-full"
                onChange={(e) => updateKey("price", e.target.value)}
                placeholder="Enter price..."
              />
            </div>
            <div className="col-span-1">
              <div className="text-xs mb-1">Availability</div>
              <CustomToggle
                status={itemForm.available == "1"}
                onChange={(e) => updateKey("available", e)}
              />
            </div>
            <div className="col-span-3">
              <div className="text-xs mb-1">Tags</div>
              <input
                type="text"
                className="w-full"
                ref={tagRef}
                onKeyUp={(e) => addTag(e)}
                placeholder="Add tags and press enter..."
              />
            </div>
            <div className="col-span-1">
              <div className="text-xs mb-1">Preparation Time</div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  className="w-full"
                  onChange={(e) => updateKey("prepTime", e.target.value)}
                  value={itemForm.prepTime}
                />
                <div className="text-sm font-bold">Min</div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="flex">
                {itemForm.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="border border-background-orange me-4 rounded-md px-2 py-1 text-xs relative"
                  >
                    <span>{tag}</span>
                    <X
                      onClick={() => removeTag(tag)}
                      className="shadow-md cursor-pointer absolute top-0 right-0 text-white bg-red-500 -mt-2 -me-2 rounded-full p-0.5"
                      size={16}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-4">
              <div className="flex">
                <div className="flex-1">
                  <div className="border-b text-md inline-block font-semibold pe-4">
                    Options
                  </div>
                </div>
                <div>
                  <CustomTooltip text={"Add Option Group"}>
                    <button
                      className="flex items-center gap-2 btn border border-background-orange text-xs"
                      onClick={() => addOptionGroup()}
                    >
                      <Plus size={14} />
                      <div className="font-bold">Add</div>
                    </button>
                  </CustomTooltip>
                </div>
              </div>
              <div className="text-sm mt-2">
                {itemForm.optionGroup.length == 0 ? (
                  <div>-- No options --</div>
                ) : (
                  itemForm.optionGroup.map((op, ind) => (
                    <OptionGroup data={op} key={"op_" + ind + "_" + op.id} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-end">
          <button
            onClick={save_menu_item}
            className="btn bg-green-500 shadow-md text-white"
          >
            Save Menu Item
          </button>
        </div>
      </Dialog>
    </>
  );
};

export default MenuItemDialog;
