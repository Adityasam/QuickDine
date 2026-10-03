import React, { useEffect } from "react";
import { X } from "lucide-react";

const Dialog = ({ open, onClose, title, className, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={() => onClose()}
        className={`${open ? "fixed" : "hidden"
          } top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 bg-[#0000008e] w-full h-full z-[99999]`}
      ></div>
      <div
        className={`${open ? "fixed" : "hidden"
          } z-[99999] slideIn top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 bg-white p-4 rounded-xl min-w-[30vw] max-w-[95vw] ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center mb-4 border-b pb-2">
          <div className="text-lg font-bold flex-1">{title}</div>
          <button aria-label="Close" onClick={() => onClose()} className="p-1 rounded hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

export default Dialog;
