import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMenuDesktop, saveOrder } from "apis/menu";
import { getTableList } from "apis/settings";
import Dialog from "./Dialog";
import Counter from "./Counter";
import { Search, Plus, Trash2, ShoppingCart } from "lucide-react";
import { money, imageUrl } from "static/js/myjs";
import dummyfood from "static/img/food_dummy.png";
import { toast } from "react-toastify";

const CreateOrderDialog = ({ open, onClose, onSuccess }) => {
    const [searchText, setSearchText] = useState("");
    const [selectedItems, setSelectedItems] = useState({});
    const [tableNo, setTableNo] = useState("");
    const [note, setNote] = useState("");

    const { data: menuItems } = useQuery({
        queryKey: ["getMenuDesktop"],
        queryFn: getMenuDesktop,
    });

    const { data: tableList } = useQuery({
        queryKey: ["getTableList"],
        queryFn: getTableList,
    });

    const saveMutation = useMutation({
        mutationFn: saveOrder,
        onSuccess: (resp) => {
            if (resp.status === 1) {
                toast.success("Order created successfully");
                onSuccess();
            } else {
                toast.error(resp.message || "Failed to create order");
            }
        },
        onError: () => {
            toast.error("An error occurred");
        },
    });

    const addToCart = (item) => {
        const newItems = { ...selectedItems };
        if (item.Code in newItems) {
            newItems[item.Code].info.quantity += 1;
        } else {
            newItems[item.Code] = {
                info: {
                    code: item.Code,
                    name: item.Name,
                    price: item.Price,
                    quantity: 1,
                    image: item.Images?.[0] || "",
                },
                options: {},
            };
        }
        setSelectedItems(newItems);
    };

    const updateQuantity = (code, qty) => {
        const newItems = { ...selectedItems };
        if (qty <= 0) {
            delete newItems[code];
        } else {
            newItems[code].info.quantity = qty;
        }
        setSelectedItems(newItems);
    };

    const removeItem = (code) => {
        const newItems = { ...selectedItems };
        delete newItems[code];
        setSelectedItems(newItems);
    };

    const handlePlaceOrder = () => {
        if (Object.keys(selectedItems).length === 0) {
            toast.error("Please add items to the order");
            return;
        }
        if (!tableNo) {
            toast.error("Please select a table number");
            return;
        }

        const orderForm = {
            items: selectedItems,
            note: note,
            payment: "L", // Default to Pay Later for dashboard created orders
            code: "",
        };

        const fd = new FormData();
        fd.append("data", JSON.stringify(orderForm));
        fd.append("tableno", tableNo);
        fd.append("userid", localStorage.getItem("USERID") || "admin");

        saveMutation.mutate(fd);
    };

    const filteredMenu = menuItems?.filter(
        (item) => item.Available && (item.Name || "").toLowerCase().includes(searchText.toLowerCase())
    );

    const totalAmount = Object.values(selectedItems).reduce(
        (total, item) => total + item.info.price * item.info.quantity,
        0
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title="Create New Order"
            className="min-w-[70vw] h-[80vh] flex flex-col"
        >
            <div className="flex flex-1 overflow-hidden gap-4">
                {/* Menu Selection Side */}
                <div className="flex-[3] flex flex-col border-r pe-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-background-orange outline-none"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-2">
                        {filteredMenu?.map((item) => (
                            <div
                                key={item.Code}
                                className="flex items-center gap-3 p-2 border rounded-xl hover:shadow-md transition-shadow group"
                            >
                                <img
                                    src={item.Images?.[0] ? imageUrl(item.Code, item.Images[0]) : dummyfood}
                                    className="w-16 h-16 rounded-lg object-cover"
                                    alt={item.Name}
                                />
                                <div className="flex-1">
                                    <div className="font-bold text-sm h-10 line-clamp-2">{item.Name}</div>
                                    <div className="text-background-orange font-bold">
                                        {money(item.Price)}
                                    </div>
                                </div>
                                <button
                                    aria-label={"Add " + item.Name}
                                    onClick={() => addToCart(item)}
                                    className="p-2 bg-orange-50 text-background-orange rounded-full hover:bg-background-orange hover:text-white transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Details Side */}
                <div className="flex-[2] flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-4">
                        <div className="font-bold mb-3 flex items-center gap-2">
                            <ShoppingCart size={18} />
                            Selected Items ({Object.keys(selectedItems).length})
                        </div>
                        {Object.keys(selectedItems).length === 0 ? (
                            <div className="text-gray-400 text-center py-10 italic">
                                No items selected
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(selectedItems).map(([code, item]) => (
                                    <div key={code} className="p-3 bg-gray-50 rounded-xl relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-sm flex-1 pr-6">
                                                {item.info.name}
                                            </div>
                                            <Trash2
                                                size={16}
                                                className="text-red-400 cursor-pointer hover:text-red-600"
                                                onClick={() => removeItem(code)}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm font-semibold text-gray-600">
                                                {money(item.info.price * item.info.quantity)}
                                            </div>
                                            <Counter
                                                value={item.info.quantity}
                                                onChange={(val) => updateQuantity(code, val)}
                                                className="scale-90"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Select Table No.
                            </label>
                            <select
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-background-orange"
                                value={tableNo}
                                onChange={(e) => setTableNo(e.target.value)}
                            >
                                <option value="">Select Table</option>
                                {tableList?.data?.map((tab) => (
                                    <option key={tab.TableNo} value={tab.TableNo}>
                                        Table {tab.TableNo}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Special Note (Optional)
                            </label>
                            <textarea
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-background-orange text-sm"
                                rows="2"
                                placeholder="Ex: No onions, Extra spicy..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-bold text-gray-700">Grand Total:</span>
                                <span className="font-black text-background-orange text-2xl">
                                    {money(totalAmount)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={saveMutation.isPending}
                            className="w-full py-3 bg-background-orange text-white font-bold rounded-xl shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50"
                        >
                            {saveMutation.isPending ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default CreateOrderDialog;
