import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Edit, Trash2, Plus } from "lucide-react";
import { money, imageUrl } from "static/js/myjs";
import PageSearch from "common/PageSearch";
import Toggle from "common/Toggle";
import MenuItemDialog from "common/MenuItemDialog";
import { getMenuDesktop, updateMenuItemsStatus } from "apis/menu";
import { MenuContext, itemFormDefault } from "providers/MenuProvider";
import { toast } from "react-toastify";
import Confirmation from "common/Confirmation";
import dummyfood from "static/img/food_dummy.png";

const Menu = () => {
  const { setItemForm } = useContext(MenuContext);
  const [search, setSearch] = useState("");
  const [menuItemCode, setMenuItemCode] = useState("");
  const [askConfirmation, setAskConfirmation] = useState({});
  const [addDialog, setAddDialog] = useState(false);

  const { data: menuList, isLoading, refetch: refetchmenuList } = useQuery({
    queryKey: ["getMenuDesktop"],
    queryFn: getMenuDesktop,
  });

  const updateMutation = useMutation({
    mutationFn: updateMenuItemsStatus,
    onSuccess: (d, e) => {
      if (d.status == 1) {
        if (e.field == "available") {
          toast.success(e.status ? "Menu item is now available" : "Menu item is now unavailable");
        } else if (e.field == "delete") {
          setAskConfirmation({});
          toast.success("Menu item deleted");
        }
        refetchmenuList();
      } else {
        toast.error(d.message || "An error occured");
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  function openEditor(code = "") {
    // fresh copy so arrays in the default aren't shared between dialogs
    setItemForm(structuredClone(itemFormDefault));
    if (code) setMenuItemCode(code);
    else setAddDialog(true);
  }

  const q = search.toLowerCase();
  const filteredMenuData = (menuList || []).filter(
    (m) =>
      !q ||
      (m.Name || "").toLowerCase().includes(q) ||
      (m.CategoryName || "").toLowerCase().includes(q) ||
      (m.Tags || "").toLowerCase().includes(q)
  );

  function deleteItem(id, name) {
    setAskConfirmation({
      title: "Delete " + name + "?",
      message: "This item will be removed from the menu.",
      onConfirm: () => updateMutation.mutate({ id, field: "delete" }),
      onCancel: () => setAskConfirmation({}),
    });
  }

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
      <div className="flex flex-wrap gap-y-3 items-center mb-4">
        <div className="text-2xl font-semibold me-6">Menu</div>
        <PageSearch onChange={setSearch} />
        <div className="flex-1 flex justify-end font-semibold">
          <button
            onClick={() => openEditor()}
            className="border-2 me-4 rounded-full gap-2 flex items-center px-4 py-1.5 bg-background-orange shadow hover:shadow-lg transition-shadow"
          >
            <Plus size={18} />
            <span>Add New</span>
          </button>
        </div>
      </div>
      <div className="mt-2 bg-white p-4 rounded-xl shadow-xl overflow-x-auto">
        <table className="w-full">
          <thead className="text-sm text-left text-gray-500">
            <tr>
              <th></th>
              <th className="px-2">Item Name</th>
              <th className="px-2">Category</th>
              <th className="px-2">Price</th>
              <th className="px-2">Available</th>
              <th className="px-2">Dietary Tag</th>
              <th className="px-2">Prep Time</th>
              <th className="px-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-10">Loading menu...</td>
              </tr>
            )}
            {!isLoading && filteredMenuData.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-10">
                  {q ? `No items match "${search}"` : 'No menu items yet. Click "Add New" to create one.'}
                </td>
              </tr>
            )}
            {filteredMenuData.map((m) => (
              <tr key={m.Code} className="border-b hover:bg-gray-50">
                <td>
                  <img
                    alt={m.Name}
                    loading="lazy"
                    src={m.Images?.length > 0 ? imageUrl(m.Code, m.Images[0]) : dummyfood}
                    className="w-16 h-16 object-cover rounded-md my-1"
                    onError={(e) => (e.target.src = dummyfood)}
                  />
                </td>
                <td className="px-2 font-semibold">{m.Name}</td>
                <td className="px-2">{m.CategoryName || <span className="text-gray-400">—</span>}</td>
                <td className="px-2">{money(m.Price)}</td>
                <td className="px-2">
                  <Toggle active={m.Available} onChange={(v) => updateMutation.mutate({ id: m.id, status: v, field: "available" })} />
                </td>
                <td className="px-2">{m.Tags && m.Tags.replaceAll(",", ", ")}</td>
                <td className="px-2">{m.PreparationTime + " min"}</td>
                <td className="px-2 whitespace-nowrap">
                  <button aria-label={"Edit " + m.Name} title="Edit" onClick={() => openEditor(m.Code)} className="me-2 p-1 text-blue-500 hover:bg-blue-50 rounded">
                    <Edit size={18} />
                  </button>
                  <button aria-label={"Delete " + m.Name} title="Delete" onClick={() => deleteItem(m.id, m.Name)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Menu;
