import { useState, useContext } from "react";
import { CookingPot, List, BellRing, Receipt, HandPlatter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MainContext } from "providers/MainProvider";
import { requestService } from "apis/menu";

const Header = ({ icon, title = "QuickDine" }) => {
  const navigate = useNavigate();
  const { userOrders } = useContext(MainContext);
  const [helpOpen, setHelpOpen] = useState(false);
  const tableNo = sessionStorage.getItem("TABLENO");
  const activeOrders = userOrders.filter((o) => o.Status == "A" || o.Status == "P").length;

  const serviceMutation = useMutation({
    mutationFn: requestService,
    onSuccess: (d, type) => {
      if (d.status == 1) {
        toast.success(type === "bill" ? "Your bill is on its way" : "A waiter is on the way");
      } else {
        toast.error(d.message || "Could not reach staff");
      }
      setHelpOpen(false);
    },
    onError: () => toast.error("Could not reach staff. Please try again."),
  });

  return (
    <div className="flex px-4 py-4 items-center">
      {tableNo && (
        <div className="flex-1 flex items-baseline">
          <div className="inline-block border border-red-500 px-2 rounded-full shadow-xl bg-background-orange">
            <div className="text-xs inline-block me-2">Table</div>
            <div className="font-bold text-xl inline-block">{tableNo}</div>
          </div>
        </div>
      )}
      <div className="text-center text-2xl font-bold flex-1 overflow-x-visible whitespace-nowrap">{title}</div>
      <div className="relative flex-1 flex justify-end items-center gap-3">
        {tableNo && (
          <button aria-label="Call staff" aria-expanded={helpOpen} onClick={() => setHelpOpen(!helpOpen)} className="p-1">
            <BellRing />
          </button>
        )}
        {tableNo && icon == "order" && (
          <button aria-label="My orders" onClick={() => navigate("/myorders")} className="p-1 relative">
            <CookingPot />
            {activeOrders > 0 && (
              <span className="absolute pointer-events-none -top-1 -right-1 bg-red-500 text-white shadow-xl border border-white rounded-full text-xs w-4 h-4 flex justify-center items-center font-bold">
                {activeOrders}
              </span>
            )}
          </button>
        )}
        {icon == "menu" && (
          <button aria-label="Back to menu" onClick={() => navigate("/")} className="p-1">
            <List />
          </button>
        )}

        {helpOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setHelpOpen(false)} />
            <div className="absolute right-0 top-10 z-40 bg-white rounded-xl shadow-2xl w-52 py-2 animate-fadeIn">
              <button
                disabled={serviceMutation.isPending}
                onClick={() => serviceMutation.mutate("waiter")}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-orange-50"
              >
                <HandPlatter size={18} /> Call waiter
              </button>
              <button
                disabled={serviceMutation.isPending}
                onClick={() => serviceMutation.mutate("bill")}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-orange-50"
              >
                <Receipt size={18} /> Request bill
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
