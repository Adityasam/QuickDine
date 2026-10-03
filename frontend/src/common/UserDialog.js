import Dialog from "./Dialog";
import { saveUser } from "apis/settings";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Toggle from "./Toggle";
import { getUserDetail } from "apis/settings";

const UserDialog = ({ userId = "", onClose, onSubmit }) => {
  const [form, setForm] = useState({ userid: userId, name: "", password: "", active: true, role: "staff" });

  const { data: userdata, isLoading } = useQuery({
    queryKey: ["getUserDetail", userId],
    queryFn: getUserDetail,
    enabled: userId != "",
  });

  useEffect(() => {
    if (userdata?.detail) {
      const d = userdata.detail;
      setForm({ userid: d.UserID, name: d.FullName || "", password: d.Password || "", active: !!d.Active, role: d.Role });
    }
  }, [userdata]);

  const saveMutation = useMutation({
    mutationFn: saveUser,
    onSuccess: (d) => {
      if (d.status == "1") {
        toast.success(userId ? "User updated" : "User created");
        onSubmit();
      } else {
        toast.error(d.message || "Could not save user");
      }
    },
    onError: () => {
      toast.error("An error occured");
    },
  });

  function save(e) {
    e.preventDefault();
    if (!form.userid.trim() || !form.name.trim() || !form.password.trim()) {
      toast.error("User ID, name and password are required");
      return;
    }
    saveMutation.mutate({
      userid: form.userid.trim(),
      name: form.name.trim(),
      password: form.password.trim(),
      active: form.active ? "1" : "0",
      role: form.role,
    });
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Dialog open={true} onClose={onClose} title={userId ? "Edit User" : "Add User"}>
      {userId && isLoading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : (
        <form onSubmit={save}>
          <label className="block mb-4">
            <div className="text-xs font-semibold mb-1">User ID</div>
            <input disabled={!!userId} value={form.userid} onChange={set("userid")} placeholder="Enter User ID..." autoFocus={!userId} />
          </label>
          <label className="block mb-4">
            <div className="text-xs font-semibold mb-1">Full Name</div>
            <input value={form.name} onChange={set("name")} placeholder="Enter full name of user..." />
          </label>
          <label className="block mb-4">
            <div className="text-xs font-semibold mb-1">Password</div>
            <input value={form.password} onChange={set("password")} placeholder="Enter a strong password..." />
          </label>
          <label className="block mb-4">
            <div className="text-xs font-semibold mb-1">Role</div>
            <select value={form.role} onChange={set("role")}>
              <option value="admin">Admin: everything</option>
              <option value="staff">Staff: orders, table bills, waiter calls</option>
              <option value="kitchen">Kitchen: orders board only</option>
            </select>
          </label>
          <div className="mb-2 flex items-end">
            <div className="flex-1">
              <div className="text-xs font-semibold mb-1">Active</div>
              <Toggle active={form.active} onChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn bg-green-500 rounded-full px-4 py-1.5 text-white disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
};

export default UserDialog;
