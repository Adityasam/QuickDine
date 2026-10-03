import Dialog from "./Dialog";

const Confirmation = ({
  title,
  message,
  onCancel,
  onConfirm,
  cancelBtn = "Cancel",
  confirmBtn = "Delete",
}) => {
  return (
    <>
      <Dialog open={true} onClose={onCancel} title={title}>
        <div>{message}</div>
        <div className="flex justify-end mt-4 gap-2">
          {cancelBtn && (
            <button
              className="btn bg-gray-500 text-white"
              onClick={() => onCancel()}
            >
              {cancelBtn}
            </button>
          )}
          <button
            autoFocus
            className="btn bg-red-500 text-white"
            onClick={() => onConfirm()}
          >
            {confirmBtn}
          </button>
        </div>
      </Dialog>
    </>
  );
};

export default Confirmation;
