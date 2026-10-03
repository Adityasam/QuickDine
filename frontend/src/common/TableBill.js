import Dialog from "./Dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getTableBill, settleTable } from "apis/orders";
import { money, orderTotal } from "static/js/myjs";
import { useState } from "react";
import { toast } from "react-toastify";

// One bill for every unpaid order on a table.
const TableBill = ({ tableNo, onClose, onSettled }) => {
  const [discount, setDiscount] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["getTableBill", tableNo],
    queryFn: getTableBill,
  });

  const settleMutation = useMutation({
    mutationFn: settleTable,
    onSuccess: (d) => {
      if (d.status == 1) {
        toast.success(`Table ${tableNo} settled · ${money(d.net)}`);
        onSettled();
      } else {
        toast.error(d.message || "Could not settle table");
      }
    },
    onError: () => toast.error("An error occured"),
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), total);

  return (
    <Dialog open={true} onClose={onClose} title={`Bill · Table ${tableNo}`} className="w-[min(640px,95vw)]">
      <div className="max-h-[60vh] overflow-y-auto">
        {isLoading && <div className="py-10 text-center text-gray-400">Loading...</div>}
        {!isLoading && orders.length === 0 && (
          <div className="py-10 text-center text-gray-500">No unpaid orders on this table.</div>
        )}
        {orders.map((o) => (
          <div key={o.Code} className="mb-3">
            <div className="flex text-sm font-semibold bg-gray-50 px-2 py-1 rounded">
              <span className="flex-1">
                Order #{o.ShortCode} · {o.OrderTime}
              </span>
              <span>{money(orderTotal(o))}</span>
            </div>
            {o.Items.map((item, i) => (
              <div key={i} className="flex text-sm px-2 py-1 border-b border-dashed">
                <span className="w-10 text-gray-500">{item.orderitem.Quantity} ×</span>
                <span className="flex-1">
                  {item.data.Name || "Item removed"}
                  {item.addons.length > 0 && (
                    <span className="text-xs text-gray-500"> + {item.addons.map((a) => a.Name).join(", ")}</span>
                  )}
                </span>
                <span>{money(orderTotal({ Items: [item] }))}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {orders.length > 0 && (
        <div className="border-t-2 mt-2 pt-2 text-sm font-semibold space-y-2">
          <div className="flex justify-between">
            <span>
              Subtotal ({orders.length} {orders.length === 1 ? "order" : "orders"})
            </span>
            <span>{money(total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Discount</span>
            <input
              type="number"
              min={0}
              max={total}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="!w-32 text-end"
            />
          </div>
          <div className="flex justify-between text-lg border-t pt-2">
            <span>Net payable</span>
            <span>{money(total - safeDiscount)}</span>
          </div>
          <div className="flex justify-end pt-2">
            <button
              disabled={settleMutation.isPending}
              onClick={() => settleMutation.mutate({ tableno: tableNo, discount: safeDiscount })}
              className="btn px-4 py-2 rounded bg-green-500 text-white disabled:opacity-60"
            >
              {settleMutation.isPending ? "Saving..." : "Payment received · settle table"}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default TableBill;
