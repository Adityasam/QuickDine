import { useState } from "react";
import {
  Download,
  Trash,
  Plus,
  Trash2,
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
  getSettings,
  deleteTable,
  getUserList,
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
  const [userId, setUserId] = useState("");
  const [tableDeleteProp, setTableDeleteProp] = useState("");
  const [passwordShow, setPasswordShow] = useState([]);

  const { data: settings } = useQuery({
    queryKey: ["getSettings"],
    queryFn: getSettings,
  });

  const { data: tableList, refetch: refetchTableList } = useQuery({
    queryKey: ["getTableList"],
    queryFn: getTableList,
  });

  const { data: userList, refetch: refetchUserList } = useQuery({
    queryKey: ["getUserList"],
    queryFn: getUserList,
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
        toast.success("Table no already exists");
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
    updateMutation.mutate({ tableno: qrtext });
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
        onClose={() => setTableDialog(false)}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-1 border-r pe-2">
            <input
              type="text"
              className="p-2 w-full mb-2"
              placeholder="Table No."
              onChange={(e) => setQrtext(e.target.value)}
            />
            <button
              onClick={() => createTable()}
              className="px-4 py-1 bg-blue-500 rounded-md shadow-xl text-white"
            >
              Add
            </button>
          </div>
          <div className="col-span-1">
            <div className="shadow-xl inline-block p-2 rounded-md border">
              <QRCodeSVG
                value={settings?.settings?.AppURL + "/" + qrtext}
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

      <div className="flex items-center mb-4">
        <div className="text-2xl font-semibold me-6">Settings</div>
        <div className="flex flex-1 font-semibold">
          {tabBtns.map((tab) => (
            <div
              onClick={() => setOrderStatus(tab.code)}
              className={`border-2 me-4 rounded-full px-4 py-1.5 cursor-pointer transition-all duration-200 ${
                orderStatus == tab.code
                  ? "bg-background-orange text-white shadow-xl"
                  : "border-background-orange"
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
                      <div
                        onClick={() => askCancelConfirm(tab.TableNo)}
                        className="border-2 cursor-pointer border-white text-white shadow-xl rounded-full bg-red-500 p-1.5"
                      >
                        <Trash size={16} />
                      </div>
                      <div
                        onClick={(e) =>
                          downloadQR(e, "table-no-" + tab.TableNo + ".png")
                        }
                        className="border-2 cursor-pointer border-white text-white shadow-xl rounded-full bg-background-orange p-1.5"
                      >
                        <Download size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="inline-block shadow-xl border border-background-orange rounded-b-xl overflow-hidden">
                    <QRCodeSVG
                      value={settings?.settings?.AppURL + "/" + tab.TableNo}
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
                        value={settings?.settings?.AppURL + "/" + tab.TableNo}
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
            <div>No data</div>
          ))}

        <div className="col-span-5">
          {orderStatus == "user" && (
            <>
              <div className="w-full border rounded-xl">
                <table>
                  <thead className="border-b">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>User ID</th>
                      <th>Password</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList?.users.map((user, index) => (
                      <tr>
                        <td>{index + 1}</td>
                        <td>{user.FullName}</td>
                        <td>{user.UserID}</td>
                        <td>
                          {passwordShow.includes(user.UserID) ? (
                            <div>
                              <span className="me-4">{user.Password}</span>
                              <Eye
                                size={20}
                                className="inline-block"
                                onClick={() =>
                                  setPasswordShow((prev) =>
                                    prev.filter((p) => p != user.UserID)
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <div className="flex items-baseline">
                              <span className="me-4 tracking-[3px]">
                                {"*".repeat(user.Password.length)}
                              </span>
                              <EyeClosed
                                size={20}
                                className="inline-block"
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
                        <td>
                          {user.Active ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <XCircle className="text-red-500" size={20} />
                          )}
                        </td>
                        <td>
                          <Trash2
                            size={20}
                            className="text-red-500 me-4 inline-block cursor-pointer"
                          />
                          <Edit
                            onClick={() => setUserId(user.UserID)}
                            size={20}
                            className="text-blue-500 inline-block cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
