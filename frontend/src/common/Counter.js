import { Plus, Minus } from "lucide-react";

// Controlled: parent owns the value.
const Counter = ({ value = 1, className = "", minValue = 0, maxValue, onChange }) => {
  function change(delta) {
    const next = value + delta;
    if (next < minValue || (maxValue !== undefined && next > maxValue)) return;
    onChange(next);
  }

  return (
    <div className={"flex w-auto items-center " + className}>
      <button type="button" aria-label="Decrease" onClick={() => change(-1)}
        className="border p-1 rounded-md bg-background-lightOrange active:scale-90 transition-transform">
        <Minus size={14} />
      </button>
      <span className="px-3 font-bold min-w-[2rem] text-center">{value}</span>
      <button type="button" aria-label="Increase" onClick={() => change(1)}
        className="border p-1 rounded-md bg-background-lightOrange active:scale-90 transition-transform">
        <Plus size={14} />
      </button>
    </div>
  );
};

export default Counter;
