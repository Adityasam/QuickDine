import React, { useEffect } from "react";

const CustomToggle = ({ status = false, onChange }) => {
  const [active, setActive] = React.useState(status);

  function changeValue() {
    onChange(active ? "0" : "1");
    setActive(!active);
  }

  useEffect(() => {
    setActive(status);
  }, [status]);

  return (
    <>
      <div
        className="w-14 h-7 shadow-md rounded-full relative border cursor-pointer"
        onClick={() => changeValue()}
      >
        <div
          className={`w-5 h-5 rounded-full absolute top-2/4 -translate-y-2/4 ${
            active ? "bg-background-orange right-1" : "bg-gray-300 left-1"
          }`}
        ></div>
      </div>
    </>
  );
};

export default CustomToggle;
