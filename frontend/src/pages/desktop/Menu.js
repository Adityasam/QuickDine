import React, { useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { rupee, MENU_IMAGE_PATH } from "static/js/myjs";
import PageSearch from "common/PageSearch";
import CustomToggle from "common/CustomToggle";
import MenuItemDialog from "common/MenuItemDialog";
import { getMenuDesktop, updateMenuItemsStatus } from "apis/menu";
import { MenuContext, itemFormDefault } from "providers/MenuProvider";
import { toast } from "react-toastify";
import Confirmation from "common/Confirmation";
import dummyfood from "static/img/food_dummy.png";

const Menu = () => {
  const { setItemForm } = useContext(MenuContext);
  const [menuData, setMenuData] = useState([]);
  const [filteredMenuData, setFilteredMenuData] = useState([]);
  const [menuItemCode, setMenuItemCode] = useState("");
  const [pageIndex, setPageIndex] = useState(5);
  const [askConfirmation, setAskConfirmation] = useState(false);

  const { data: menuList, refetch: refetchmenuList } = useQuery({
    queryKey: ["getMenuDesktop", pageIndex],
    queryFn: getMenuDesktop,
  });

  const updateMutation = useMutation({
    mutationFn: updateMenuItemsStatus,
    onSuccess: (d, e) => {
      if (d.status == 1) {
        if (e.field == "available") {
          if (e.status == "1") {
            toast.success("Menu item is now available");
          } else {
            toast.success("Menu item is now unavailable");
          }
        } else if (e.field == "delete") {
          setAskConfirmation({});
          refetchmenuList();
          toast.success("Menu item deleted");
        }
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  useEffect(() => {
    if (menuList) {
      setMenuData(menuList);
      setFilteredMenuData(menuList);
    }
  }, [menuList]);

  const [addDialog, setAddDialog] = React.useState(false);

  function newItemDialog() {
    setItemForm(itemFormDefault);
    setAddDialog(true);
  }

  function searchItem(e) {
    const temp = [];
    menuData.forEach((m) => {
      const con1 = m.Name.toLowerCase().includes(e.toLowerCase());
      const tags = m.Tags ? m.Tags.split(",") : [];
      const con2 = tags.find((t) => t.toLowerCase().includes(e.toLowerCase()));
      if (con1 || con2) {
        temp.push(m);
      }
    });
    setFilteredMenuData(temp);
  }

  function changeStatus(status, itemid) {
    updateMutation.mutate({ id: itemid, status: status, field: "available" });
  }

  function confirmDelete(itemid) {
    updateMutation.mutate({ id: itemid, field: "delete" });
  }

  function deleteItem(id, name) {
    setAskConfirmation({
      title: "Deleting menu item " + name,
      message: "Are you sure you want to delete this menu item?",
      onConfirm: function () {
        confirmDelete(id);
      },
      onCancel: function () {
        setAskConfirmation({});
      },
    });
  }

  const totalItems = 123;

  return (
    <>
      {Object.keys(askConfirmation).length > 0 && (
        <Confirmation
          title={askConfirmation.title}
          message={askConfirmation.message}
          onCancel={askConfirmation.onCancel}
          onConfirm={askConfirmation.onConfirm}
        />
      )}

      {(addDialog || menuItemCode != "") && (
        <MenuItemDialog
          itemCode={menuItemCode}
          open={true}
          onClose={() => {
            setAddDialog(false);
            setMenuItemCode("");
            refetchmenuList();
          }}
        />
      )}
      <div className="flex items-center mb-4">
        <div className="text-2xl font-semibold me-6">Menu</div>
        <PageSearch onChange={(e) => searchItem(e)} />
        <div className="flex-1 flex justify-end font-semibold">
          <div
            onClick={newItemDialog}
            className={`border-2 me-4 rounded-full gap-2 flex items-center px-4 py-1.5 cursor-pointer bg-background-orange`}
          >
            <Plus size={18} />
            <span>Add New</span>
          </div>
        </div>
      </div>
      <div className="mt-2 bg-white p-4 rounded-xl shadow-xl">
        <table className="w-full">
          <thead className="text-sm text-left">
            <tr>
              <th></th>
              <th className="px-2">Item Name</th>
              <th className="px-2">Category</th>
              <th className="px-2">Price</th>
              <th className="px-2">Available</th>
              <th className="px-2">Dietary Tag</th>
              <th className="px-2">Preparation Time</th>
              <th className="px-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredMenuData.map((m, index) => {
              return (
                <tr key={"menu_" + index} className="border-b">
                  <td>
                    <img
                      src={
                        "Images" in m && m.Images && m.Images.length > 0
                          ? process.env.REACT_APP_PUBLIC_URL +
                            MENU_IMAGE_PATH +
                            "/" +
                            m.Code +
                            "/" +
                            m.Images[0]
                          : dummyfood
                      }
                      className="w-20 border-r my-2"
                    />
                  </td>
                  <td className="px-2">{m.Name}</td>
                  <td className="px-2">{m.CategoryName}</td>
                  <td className="px-2">{rupee + " " + m.Price}</td>
                  <td className="px-2">
                    <CustomToggle
                      status={m.Available}
                      onChange={(e) => changeStatus(e, m.id)}
                    />
                  </td>
                  <td className="px-2">
                    {m.Tags && m.Tags.replaceAll(",", ", ")}
                  </td>
                  <td className="px-2">{m.PreparationTime + " Min"}</td>
                  <td className="px-2">
                    <Edit
                      size={20}
                      onClick={() => setMenuItemCode(m.Code)}
                      className="inline-block me-2 cursor-pointer text-blue-500"
                    />
                    <Trash2
                      size={20}
                      onClick={() => deleteItem(m.id, m.Name)}
                      className="inline-block cursor-pointer text-red-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="items-center mt-2 text-sm hidden">
          <div>
            Page {pageIndex} of {Math.ceil(menuData.length / 10)}
          </div>
          <div className="flex-1 justify-end">
            <div className="items-center flex justify-end">
              <div className="max-w-[30vw] overflow-x-auto flex noScroll">
                {Array.from({ length: Math.ceil(menuData.length / 10) }).map(
                  (_, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => setPageIndex(index + 1)}
                        className={`mx-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                          index + 1 == pageIndex
                            ? "bg-background-orange text-white"
                            : ""
                        }`}
                      >
                        {index + 1}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
          <div
            onClick={() => setPageIndex((prev) => prev - 1)}
            className="mx-2 flex items-center font-bold border p-2 cursor-pointer rounded-lg shadow-lg"
          >
            <ChevronLeft size={14} className="me-2" />
            <span>Previous</span>
          </div>
          <div
            onClick={() => setPageIndex((prev) => prev + 1)}
            className="flex items-center font-bold border p-2 cursor-pointer rounded-lg shadow-lg"
          >
            <ChevronRight size={14} className="me-2" />
            <span>Next</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;
