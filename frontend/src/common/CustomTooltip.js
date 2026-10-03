const CustomTooltip = ({ text, children, side = "top" }) => {
  return (
    <>
      <div className="cursor-pointer relative group z-50">
        <div
          className={`absolute whitespace-nowrap shadow-lg opacity-0 transition-all duration-200 ${
            side == "top"
              ? "top-0 left-2/4 -translate-x-2/4 -mt-4 group-hover:-mt-8"
              : side == "right"
              ? "left-[calc(100%-20px)] top-2/4 -translate-y-2/4 group-hover:left-[calc(100%+10px)]"
              : ""
          } group-hover:opacity-100 bg-gray-950 text-white px-2 py-1 rounded-md text-xs`}
        >
          {text}
        </div>
        {children}
      </div>
    </>
  );
};

export default CustomTooltip;
