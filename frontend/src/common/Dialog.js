import React from "react";
import { X } from "lucide-react";

const Dialog = ({ open, onClose, title, className, children }) => {
  return (
    <>
      <div
        onClick={() => onClose()}
        className={`${
          open ? "fixed" : "hidden"
        } top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 bg-[#0000008e] w-full h-full z-20`}
      ></div>
      <div
        className={`${
          open ? "fixed" : "hidden"
        } z-30 slideIn top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 bg-white p-4 rounded-xl min-w-[30vw] ${className}`}
      >
        <div className="flex items-center mb-4 border-b pb-2">
          <div className="text-lg font-bold flex-1">{title}</div>
          <X size={20} className="cursor-pointer" onClick={() => onClose()} />
        </div>
        {children}
      </div>
    </>
  );
};

export default Dialog;
