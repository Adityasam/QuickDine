const Toggle = ({ onChange, active = false }) => {
  return (
    <>
      <div
        className={`custom-toggle ${active ? "active" : ""}`}
        onClick={() => {
          onChange(!active);
        }}
      >
        <div></div>
      </div>
    </>
  );
};

export default Toggle;
