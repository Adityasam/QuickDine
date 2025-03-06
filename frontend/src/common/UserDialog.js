import Dialog from "./Dialog";
import { saveUser } from "apis/settings";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import Toggle from "./Toggle";
import { getUserDetail } from "apis/settings";

const UserDialog = ({ userId = "", onClose, onSubmit }) => {
  const useridref = useRef();
  const nameref = useRef();
  const passref = useRef();
  const [active, setActive] = useState(false);

  const { data: userdata } = useQuery({
    queryKey: ["getUserDetail", userId],
    queryFn: getUserDetail,
    enabled: userId != "",
  });

  useEffect(() => {
    if (userdata) {
      setActive(userdata?.detail.Active);
    }
  }, [userdata]);

  const saveMutation = useMutation({
    mutationFn: saveUser,
    onSuccess: (d, v) => {
      if (d.status == "1") {
        if (userId) {
          toast.success("User updated");
        } else {
          toast.success("User created");
        }
        onSubmit();
      }
    },
    onError: () => {
      toast.error("An error occured");
    },
  });

  function save() {
    saveMutation.mutate({
      userid: useridref.current.value.trim(),
      name: nameref.current.value.trim(),
      password: passref.current.value.trim(),
      active: active ? "1" : "0",
    });
  }

  return (
    <>
      <Dialog
        open={true}
        onClose={onClose}
        title={userId ? "Edit User" : "Add User"}
      >
        <div>
          <div className="mb-4">
            <div className="text-xs font-semibold">User ID</div>
            <input
              disabled={userId}
              ref={useridref}
              defaultValue={userId}
              placeholder="Enter User ID..."
            />
          </div>
          <div className="mb-4">
            <div className="text-xs font-semibold">Full Name</div>
            <input
              defaultValue={userdata?.detail.FullName}
              ref={nameref}
              placeholder="Enter full name of user..."
            />
          </div>
          <div className="mb-4">
            <div className="text-xs font-semibold">Password</div>
            <input
              defaultValue={userdata?.detail.Password}
              ref={passref}
              placeholder="Enter a strong password..."
            />
          </div>
          <div className="mb-4 flex items-end">
            <div className="flex-1">
              <div className="text-xs font-semibold">Status</div>
              <Toggle active={active} onChange={(e) => setActive(e)} />
            </div>
            <div className="flex-1">
              <div className="text-end">
                <button
                  onClick={save}
                  className="btn bg-green-500 rounded-full px-2 py-1 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UserDialog;
