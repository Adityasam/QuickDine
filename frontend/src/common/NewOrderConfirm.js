import Dialog from "common/Dialog";
import { rupee, MENU_IMAGE_PATH } from "static/js/myjs";
import { CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { saveOrder } from "apis/menu";
import { toast } from "react-toastify";
import { getTableList } from "apis/settings";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const NewOrderConfirm = ({ data, onClose, onSubmit }) => {
  const [tableNo, setTableNo] = useState("");
  const { data: tableList } = useQuery({
    queryKey: ["getTableList"],
    queryFn: getTableList,
  });

  const saveMutation = useMutation({
    mutationFn: saveOrder,
    onSuccess: (resp, data) => {
      if (resp.status == 1) {
        toast.success("Order placed");
        onSubmit();
      } else {
        toast.error(resp.message);
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  function placeOrder() {
    if (tableNo == "") {
      toast.error("Please select the table no");
      return;
    }
    const fd = new FormData();
    data["orderstatus"] = "A";
    fd.append("data", JSON.stringify(data));
    const tableno = tableNo;
    fd.append("tableno", tableno);

    const userid = localStorage.getItem("USERID");
    fd.append("userid", userid);
    saveMutation.mutate(fd);
  }

  let grandtotal = 0;
  Object.keys(data.items).forEach((itemcode) => {
    const item = data.items[itemcode];
    let temptotal = item.info.price;
    if ("options" in item) {
      Object.keys(item.options).forEach((gcode) => {
        const group = item.options[gcode];
        Object.keys(group).forEach((icode) => {
          const im = group[icode];
          temptotal += im.price;
        });
      });
    }
    grandtotal += temptotal * item.info.quantity;
  });
  return (
    <>
      <Dialog title="Order Preview" open={true} onClose={onClose}>
        <div className="max-h-80vh overflow-y-auto">
          {data && (
            <div>
              {Object.keys(data.items).map((itemkey, index) => {
                const item = data.items[itemkey];
                let itemtotal = item.info.price;
                return (
                  <div
                    className="flex gap-2 border-b py-2 rounded-md"
                    key={index}
                  >
                    <div className="border-r pe-2">
                      <img
                        className="w-20 h-20 object-contain"
                        src={
                          process.env.REACT_APP_PUBLIC_URL +
                          MENU_IMAGE_PATH +
                          "/" +
                          itemkey +
                          "/" +
                          item.info.image
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 justify-center">
                      <div className="flex">
                        <div className="font-bold flex-1 underline underline-offset-2">
                          {item.info.name}
                        </div>
                        {/* <div className="bg-red-500 text-white p-1 rounded-full shadow-xl cursor-pointer">
                          <Trash2 size={16} />
                        </div> */}
                      </div>
                      {"options" in item &&
                        Object.keys(item.options).length > 0 && (
                          <div className="border-b pb-2">
                            {Object.keys(item.options).map((gpkey) => {
                              const group = item.options[gpkey];
                              return Object.keys(group).map((ikey) => {
                                itemtotal += group[ikey].price;
                                return (
                                  <div className="text-xs">
                                    + {group[ikey].name}
                                  </div>
                                );
                              });
                            })}
                          </div>
                        )}
                      <div className="flex text-sm items-baseline">
                        <div className="flex gap-2 flex-1 items-baseline">
                          <div>Price</div>
                          <div className="font-semibold">
                            {rupee}
                            {itemtotal}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-1 items-baseline">
                          <div>Quantity</div>
                          <div className="font-semibold">
                            {item.info.quantity}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-1 items-baseline">
                          <div>Price</div>
                          <div className="font-semibold text-lg">
                            {rupee}
                            {itemtotal * item.info.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="underline underline-offset-2 font-bold mb-2">
              Table No.
            </div>
            <div className="grid grid-cols-6 gap-2">
              {tableList &&
                tableList.data.map((table, index) => (
                  <div className="col-span-1" key={index}>
                    <div
                      className={`shadow-xl cursor-pointer transition-all duration-200 select-none flex justify-center py-4 rounded-md text-3xl font-bold border ${
                        tableNo == table.TableNo
                          ? "bg-background-orange text-white"
                          : ""
                      }`}
                      onClick={() => setTableNo(table.TableNo)}
                    >
                      {table.TableNo}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="border-t pt-2 mt-2 flex">
            <div className="flex gap-2 items-baseline flex-1">
              <div>Grand Total</div>
              <div className="font-bold text-xl">
                {rupee}
                {grandtotal}
              </div>
            </div>
            <button
              onClick={() => placeOrder()}
              className="btn bg-green-500 text-white py-2 px-4 flex gap-2 items-center"
            >
              <CheckCircle size={20} />
              Confirm
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default NewOrderConfirm;
