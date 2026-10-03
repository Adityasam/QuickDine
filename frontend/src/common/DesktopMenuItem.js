const DesktopMenuItem = ({ m, collapse, selectedMenu }) => {
  return (
    <>
      <div
        className={`flex items-center relative py-3 ps-4 transition-all duration-300 ease-in-out cursor-pointer mb-8 ${
          m.key == selectedMenu ? "text-background-orange" : "text-white"
        }`}
      >
        <div
          className={`absolute transition-all duration-300 ease-in-out rounded-l-full top-0 right-0 ${
            m.key == selectedMenu ? "w-full" : "w-0"
          } h-full bg-background-blue`}
        ></div>
        <div
          className={`absolute top-0 right-0 ${
            m.key == selectedMenu ? "w-2" : "w-0"
          } h-[calc(100%+20px)] -mt-[10px] bg-background-blue`}
        ></div>
        <div className="absolute top-0 -mt-4 right-0 w-4 h-4 rounded-full bg-background-orange"></div>
        <div className="absolute bottom-0 -mb-4 right-0 w-4 h-4 rounded-full bg-background-orange"></div>
        <div className="z-10">{m.icon}</div>
        <div
          className={`ms-4 text-sm font-semibold overflow-hidden z-10 ${
            collapse ? "w-0" : "w-auto"
          }`}
        >
          {m.title}
        </div>
      </div>
    </>
  );
};

export default DesktopMenuItem;
