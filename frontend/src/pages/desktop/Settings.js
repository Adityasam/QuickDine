import { useState } from "react";
import {
  Download,
  Trash,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  EyeClosed,
  Eye,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import dummyfood from "static/img/food_dummy.png";
import {
  saveTable,
  getTableList,
  deleteTable,
  getUserList,
  getCategoryList,
  saveCategory,
} from "apis/settings";
import { toast } from "react-toastify";
import Confirmation from "common/Confirmation";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import Dialog from "common/Dialog";
import caret_down from "static/img/caret_down.png";
import UserDialog from "common/UserDialog";

const Settings = () => {
  const [orderStatus, setOrderStatus] = useState("user");
  const [qrtext, setQrtext] = useState("");
  const [tableDialog, setTableDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const [catDialog, setCatDialog] = useState(false);
  const [userId, setUserId] = useState("");
  const [catData, setCatData] = useState({ code: "", name: "", active: true });
  const [tableDeleteProp, setTableDeleteProp] = useState("");
  const [passwordShow, setPasswordShow] = useState([]);

  const { data: tableList, refetch: refetchTableList } = useQuery({
    queryKey: ["getTableList"],
    queryFn: getTableList,
  });

  const { data: userList, refetch: refetchUserList } = useQuery({
    queryKey: ["getUserList"],
    queryFn: getUserList,
  });

  const { data: categoryList, refetch: refetchCategoryList } = useQuery({
    queryKey: ["getCategoryList"],
    queryFn: getCategoryList,
  });

  const updateMutation = useMutation({
    mutationFn: saveTable,
    onSuccess: (d) => {
      if (d.status == 1) {
        toast.success("Table created");
        setTableDialog(false);
        setQrtext("");
        refetchTableList();
      } else if (d.status == 2) {
        toast.error("Table no already exists");
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  const catMutation = useMutation({
    mutationFn: saveCategory,
    onSuccess: (d) => {
      if (d.status == 1) {
        toast.success("Category saved");
        setCatDialog(false);
        setCatData({ code: "", name: "", active: true });
        refetchCategoryList();
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: (d) => {
      if (d.status == 1) {
        toast.success("Table Deleted");
        setTableDeleteProp("");
        refetchTableList();
      }
    },
    onError: (error) => {
      toast.error("An error occured");
    },
  });

  function createTable() {
    if (!qrtext.trim()) {
      toast.error("Please enter a table number");
      return;
    }
    updateMutation.mutate({ tableno: qrtext.trim() });
  }

  function handleSaveCategory() {
    if (catData.name.trim() == "") {
      toast.error("Please enter category name");
      return;
    }
    catMutation.mutate(catData);
  }

  function askCancelConfirm(tableno) {
    setTableDeleteProp(tableno);
  }

  function onOrderCancelDismiss() {
    setTableDeleteProp("");
  }
  function onOrderCancelConfirm() {
    deleteMutation.mutate(tableDeleteProp);
  }

  async function downloadQR(e, filename = "download.png") {
    const div = e.target.closest(".qrblock").querySelector(".qrimage");

    const svgs = div.querySelectorAll("svg");
    for (let svg of svgs) {
      await convertSVGImagesToBase64(svg);
    }

    html2canvas(div, { useCORS: true }).then((canvas) => {
      const dataUrl = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  async function convertSVGImagesToBase64(svg) {
    const images = svg.querySelectorAll("image");
    for (let img of images) {
      const href = img.getAttribute("href") || img.getAttribute("xlink:href");
      if (href && !href.startsWith("data:image")) {
        const base64 = await convertImageToBase64(href);
        img.setAttribute("href", base64);
      }
    }
  }

  async function convertImageToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error loading image:", url, error);
      return url;
    }
  }

  const tabBtns = [
    { title: "Users", code: "user" },
    { title: "Tables", code: "table" },
    { title: "Categories", code: "category" },
  ];

  return (
    <>
      {(userDialog || userId != "") && (
        <UserDialog
          userId={userId}
          onSubmit={() => {
            setUserDialog(false);
            setUserId("");
            refetchUserList();
          }}
          onClose={() => {
            setUserDialog(false);
            setUserId("");
          }}
        />
      )}
      {tableDeleteProp != "" && (
        <Confirmation
          message={
            <div>
              <span>Are you sure you want to delete the table no </span>
              <span className="font-bold">#{tableDeleteProp}</span>
            </div>
          }
          open={true}
          onCancel={onOrderCancelDismiss}
          onConfirm={onOrderCancelConfirm}
          title="Deleting Table"
          confirmBtn="Delete"
          cancelBtn="Cancel"
        />
      )}

      <Dialog
        open={tableDialog}
        title="Add Table"
        onClose={() => {
          setTableDialog(false);
          setQrtext("");
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-1 border-r pe-2">
            <input
              type="text"
              autoFocus
              className="p-2 w-full mb-2"
              placeholder="Table No."
              value={qrtext}
              onChange={(e) => setQrtext(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTable()}
            />
            <button
              disabled={updateMutation.isPending}
              onClick={() => createTable()}
              className="px-4 py-1 bg-blue-500 rounded-md shadow-xl text-white disabled:opacity-60"
            >
              Add
            </button>
            <div className="text-xs text-gray-500 mt-3">The QR preview updates as you type.</div>
          </div>
          <div className="col-span-1">
            <div className="shadow-xl inline-block p-2 rounded-md border">
              <QRCodeSVG
                value={window.location.origin + "/?" + ("table=" + qrtext)}
                size={200}
                imageSettings={{
                  src: dummyfood,
                  height: 50,
                  width: 50,
                  marginSize: 1,
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={catDialog}
        title={catData.code == "" ? "Add Category" : "Edit Category"}
        onClose={() => {
          setCatDialog(false);
          setCatData({ code: "", name: "", active: true });
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={catData.name}
              onChange={(e) => setCatData({ ...catData, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSaveCategory()}
              autoFocus
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter category name"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="catActive"
              checked={catData.active}
              onChange={(e) => setCatData({ ...catData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="catActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setCatDialog(false);
                setCatData({ code: "", name: "", active: true });
              }}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={catMutation.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </Dialog>

      <div className="flex items-center mb-4">
        <div className="text-2xl font-semibold me-6">Settings</div>
        <div className="flex flex-1 font-semibold">
          {tabBtns.map((tab) => (
            <div
              key={"tab_" + tab.code}
              onClick={() => setOrderStatus(tab.code)}
              className={`border-2 me-4 rounded-full px-4 py-1.5 cursor-pointer transition-all duration-200 ${orderStatus == tab.code
                ? "bg-background-orange text-white shadow-xl"
                : "border-background-orange cursor-pointer"
                }`}
            >
              <span>{tab.title}</span>
            </div>
          ))}
        </div>
        <div>
          {orderStatus == "table" && (
            <button
              onClick={() => setTableDialog(true)}
              className="button flex shadow-xl px-4 py-2 bg-blue-500 text-white font-bold rounded-md border"
            >
              <Plus className="me-2" />
              <span>Add Table</span>
            </button>
          )}

          {orderStatus == "user" && (
            <button
              onClick={() => setUserDialog(true)}
              className="button flex shadow-xl px-4 py-2 bg-blue-500 text-white font-bold rounded-md border"
            >
              <Plus className="me-2" />
              <span>Add User</span>
            </button>
          )}

          {orderStatus == "category" && (
            <button
              onClick={() => setCatDialog(true)}
              className="button flex shadow-xl px-4 py-2 bg-blue-500 text-white font-bold rounded-md border"
            >
              <Plus className="me-2" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {orderStatus == "table" &&
          (tableList && tableList.data ? (
            tableList.data.map((tab, index) => (
              <div key={"qrcard_" + index} className="col-span-1">
                <div
                  className="qrblock relative opacity-0 inline-block animate-fadeIn"
                  style={{ animationDelay: index * 100 + "ms" }}
                >
                  <div className="flex items-center">
                    <div className="border-t border-l border-r pb-1 px-2 rounded-t-xl border-background-orange">
                      Table No:{" "}
                      <span className="text-2xl font-bold">{tab.TableNo}</span>
                    </div>
                    <div className="flex-1 flex justify-end gap-2">
                      <button
                        title="Delete table"
                        aria-label={"Delete table " + tab.TableNo}
                        onClick={() => askCancelConfirm(tab.TableNo)}
                        className="border-2 border-white text-white shadow-xl rounded-full bg-red-500 p-1.5"
                      >
                        <Trash size={16} />
                      </button>
                      <button
                        title="Download QR"
                        aria-label={"Download QR for table " + tab.TableNo}
                        onClick={(e) =>
                          downloadQR(e, "table-no-" + tab.TableNo + ".png")
                        }
                        className="border-2 border-white text-white shadow-xl rounded-full bg-background-orange p-1.5"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="inline-block shadow-xl border border-background-orange rounded-b-xl overflow-hidden">
                    <QRCodeSVG
                      value={window.location.origin + "/?" + ("table=" + tab.TableNo)}
                      size={250}
                      imageSettings={{
                        src: dummyfood,
                        height: 70,
                        width: 70,
                      }}
                      marginSize={2}
                    />
                  </div>
                  <div className="qrimage rounded-3xl px-6 pb-6 border-8 border-black bg-none overflow-hidden fixed -top-[200vh] -left-[200vw] z-10">
                    <div className="text-center my-4">
                      <div
                        style={{ lineHeight: "60px" }}
                        className="text-[60px] pb-[48px] font-bold inline-block px-12 rounded-md border-black border-4"
                      >
                        SCAN ME
                      </div>
                      <img src={caret_down} className="w-10 mx-auto" />
                    </div>
                    <div className="p-6 border-4 relative border-black rounded-md">
                      <div className="bg-background-blue h-4 w-2/3 absolute -top-2 left-2/4 -translate-x-2/4"></div>
                      <QRCodeSVG
                        value={window.location.origin + "/?" + ("table=" + tab.TableNo)}
                        size={400}
                        imageSettings={{
                          src: dummyfood,
                          height: 100,
                          width: 100,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-gray-400">Loading tables...</div>
          ))}
        {orderStatus == "table" && tableList?.data?.length === 0 && (
          <div className="col-span-5 text-center text-gray-500 py-10">
            No tables yet. Click "Add Table" to generate a QR code.
          </div>
        )}

        <div className="col-span-5">
          {orderStatus == "user" && (
            <>
              <div className="w-full border rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">#</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userList?.users.map((user, index) => (
                      <tr key={user.UserID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-center">{index + 1}</td>
                        <td className="px-6 py-4 font-medium">{user.FullName}</td>
                        <td className="px-6 py-4 font-mono">{user.UserID}</td>
                        <td className="px-6 py-4 capitalize">{user.Role}</td>
                        <td className="px-6 py-4">
                          {passwordShow.includes(user.UserID) ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{user.Password}</span>
                              <Eye
                                size={18}
                                className="cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={() =>
                                  setPasswordShow((prev) =>
                                    prev.filter((p) => p != user.UserID)
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="tracking-[2px]">
                                {"*".repeat(user.Password.length)}
                              </span>
                              <EyeClosed
                                size={18}
                                className="cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                  setPasswordShow([
                                    ...passwordShow,
                                    user.UserID,
                                  ]);
                                }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {user.Active ? (
                            <CheckCircle className="text-green-500 mx-auto" size={20} />
                          ) : (
                            <XCircle className="text-red-500 mx-auto" size={20} />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3">
                            <Edit
                              onClick={() => setUserId(user.UserID)}
                              size={18}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {orderStatus == "category" && (
            <div className="w-full border rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">#</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categoryList?.data.map((cat, index) => (
                    <tr key={cat.Code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">{index + 1}</td>
                      <td className="px-6 py-4 font-mono">{cat.Code}</td>
                      <td className="px-6 py-4 font-medium">{cat.Name}</td>
                      <td className="px-6 py-4 text-center">
                        {cat.Active ? (
                          <CheckCircle className="text-green-500 mx-auto" size={20} />
                        ) : (
                          <XCircle className="text-red-500 mx-auto" size={20} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <Edit
                            onClick={() => {
                              setCatData({ code: cat.Code, name: cat.Name, active: cat.Active });
                              setCatDialog(true);
                            }}
                            size={18}
                            className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categoryList?.data.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">
                        No categories found. Click "Add Category" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
