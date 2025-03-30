import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

const Counter = ({
  defaultValue = 1,
  className,
  minValue,
  maxValue,
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (onChange) {
      onChange(value);
    }
  }, [value]);

  function changeValue(change) {
    if (
      (!minValue || value + change > minValue) &&
      (!maxValue || value + change < maxValue)
    ) {
      setValue((prev) => prev + change);
    }
  }

  return (
    <>
      <div className={"flex w-auto items-center " + className}>
        <Minus
          size={20}
          onClick={() => changeValue(-1)}
          className="border cursor-pointer p-1 rounded-md bg-background-lightOrange"
        />
        <span className="select-none px-4 font-bold">{value}</span>
        <Plus
          size={20}
          onClick={() => changeValue(1)}
          className="border cursor-pointer p-1 rounded-md bg-background-lightOrange"
        />
      </div>
    </>
  );
};

export default Counter;
