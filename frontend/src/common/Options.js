import React, { useState } from "react";

const Options = ({ data, defaultValue = "", onChange }) => {
  const [value, setValue] = useState(defaultValue);

  function changeValue(val) {
    setValue(val);
    onChange(val);
  }
  return (
    <>
      <div className="flex items-center gap-2">
        {data.map((d, index) => (
          <div
            onClick={() => changeValue(d.value)}
            className={`border px-2 py-1 rounded-md cursor-pointer transition-all duration-200 ${
              value == d.value ? "bg-background-orange text-white" : ""
            }`}
            key={"op_" + index}
          >
            {d.title}
          </div>
        ))}
      </div>
    </>
  );
};

export default Options;
